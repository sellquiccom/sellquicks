
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { collection, query, where, onSnapshot, Timestamp, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DollarSign, Users, CreditCard, Activity, ArrowUp, ArrowDown } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';

interface Order extends DocumentData {
  id: string;
  totalAmount: number;
  status: 'awaiting-payment' | 'pending' | 'confirmed' | 'fulfilled';
  createdAt: Timestamp;
  customerInfo: {
    name: string;
    email: string;
  };
}

const chartConfig = {
  revenue: {
    label: 'Revenue',
    color: 'hsl(var(--primary))',
  },
};

const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}


export default function SalesAnalyticsPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'orders'), where('storeOwnerId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setOrders(fetchedOrders);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching orders:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const {
    totalRevenue,
    totalSales,
    avgSale,
    newCustomersThisMonth,
    revenueChartData,
    recentSales,
  } = useMemo(() => {
    const confirmedOrders = orders.filter(o => o.status === 'confirmed' || o.status === 'fulfilled');
    
    const totalRevenue = confirmedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalSales = confirmedOrders.length;
    const avgSale = totalSales > 0 ? totalRevenue / totalSales : 0;
    
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const uniqueCustomersThisMonth = new Set(
        orders
            .filter(o => o.createdAt.toDate() >= startOfThisMonth)
            .map(o => o.customerInfo.email)
    );
    const newCustomersThisMonth = uniqueCustomersThisMonth.size;

    // Prepare data for the last 30 days chart
    const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = subDays(now, i);
        return format(startOfDay(date), 'yyyy-MM-dd');
    }).reverse();

    const revenueByDay = confirmedOrders.reduce((acc, order) => {
        const dateStr = format(order.createdAt.toDate(), 'yyyy-MM-dd');
        acc[dateStr] = (acc[dateStr] || 0) + order.totalAmount;
        return acc;
    }, {} as Record<string, number>);

    const revenueChartData = last30Days.map(date => ({
        date: format(new Date(date), 'MMM d'),
        revenue: revenueByDay[date] || 0,
    }));

    const recentSales = orders
        .sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime())
        .slice(0, 5);

    return { totalRevenue, totalSales, avgSale, newCustomersThisMonth, revenueChartData, recentSales };

  }, [orders]);
  
  if (loading || authLoading) {
    return <p>Loading analytics...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GHS {totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{totalSales}</div>
            <p className="text-xs text-muted-foreground">+180.1% from last month</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Sale</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GHS {avgSale.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">+19% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{newCustomersThisMonth}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Revenue - Last 30 Days</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <AreaChart data={revenueChartData} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <Tooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      indicator="dot"
                      formatter={(value) => `GHS ${Number(value).toFixed(2)}`}
                    />
                  }
                />
                <Area
                  dataKey="revenue"
                  type="natural"
                  fill="var(--color-revenue)"
                  fillOpacity={0.4}
                  stroke="var(--color-revenue)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                </TableHeader>
                 <TableBody>
                    {recentSales.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                           <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9">
                                    <AvatarFallback>{getInitials(order.customerInfo.name)}</AvatarFallback>
                                </Avatar>
                                <div className='grid gap-0.5'>
                                    <p className="font-medium leading-none">{order.customerInfo.name}</p>
                                    <p className="text-xs text-muted-foreground">{order.customerInfo.email}</p>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">GHS {order.totalAmount.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                     {recentSales.length === 0 && (
                         <TableRow>
                            <TableCell colSpan={2} className="text-center text-muted-foreground">
                                No sales yet.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
