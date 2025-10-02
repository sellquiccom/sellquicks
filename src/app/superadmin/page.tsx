
'use client';
import React, { useEffect, useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { DollarSign, Users, CreditCard, Activity, Package } from 'lucide-react';
import { AreaChart, Area, CartesianGrid, XAxis, Tooltip } from 'recharts';
import { collection, onSnapshot, Timestamp, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format, subDays, startOfDay } from 'date-fns';

interface Order extends DocumentData {
  id: string;
  totalAmount: number;
  status: 'awaiting-payment' | 'pending' | 'confirmed' | 'fulfilled';
  createdAt: Timestamp;
}

interface Seller extends DocumentData {
    id: string;
    createdAt: Timestamp;
}

interface Product extends DocumentData {
  id: string;
}

const chartConfig = {
  revenue: {
    label: 'Revenue',
    color: 'hsl(var(--primary))',
  },
  vendors: {
    label: 'Vendors',
    color: 'hsl(var(--accent-foreground))',
  },
};


export default function SuperAdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [vendors, setVendors] = useState<Seller[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
      const fetchedOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setOrders(fetchedOrders);
      setLoading(false);
    });

    const unsubVendors = onSnapshot(collection(db, 'users'), (snapshot) => {
      const fetchedVendors = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Seller));
      setVendors(fetchedVendors);
    });

    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
        const fetchedProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setProducts(fetchedProducts);
    });


    return () => {
      unsubOrders();
      unsubVendors();
      unsubProducts();
    };
  }, []);

  const {
    totalRevenue,
    totalSales,
    totalVendors,
    totalProducts,
    avgOrderValue,
    revenueChartData,
    vendorsChartData,
  } = useMemo(() => {
    const confirmedOrders = orders.filter(o => o.status === 'confirmed' || o.status === 'fulfilled');
    
    const totalRevenue = confirmedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalSales = confirmedOrders.length;
    const avgOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;
    const totalVendors = vendors.length;
    const totalProducts = products.length;

    // Chart data for last 30 days
    const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = subDays(new Date(), i);
        return format(startOfDay(date), 'yyyy-MM-dd');
    }).reverse();

    const revenueByDay = confirmedOrders.reduce((acc, order) => {
        const dateStr = format(order.createdAt.toDate(), 'yyyy-MM-dd');
        acc[dateStr] = (acc[dateStr] || 0) + order.totalAmount;
        return acc;
    }, {} as Record<string, number>);

    const newVendorsByDay = vendors.reduce((acc, vendor) => {
        const dateStr = format(vendor.createdAt.toDate(), 'yyyy-MM-dd');
        acc[dateStr] = (acc[dateStr] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const revenueChartData = last30Days.map(date => ({
        date: format(new Date(date), 'MMM d'),
        revenue: revenueByDay[date] || 0,
    }));
    
    const vendorsChartData = last30Days.map(date => ({
        date: format(new Date(date), 'MMM d'),
        vendors: newVendorsByDay[date] || 0,
    }));


    return { totalRevenue, totalSales, totalVendors, totalProducts, avgOrderValue, revenueChartData, vendorsChartData };
  }, [orders, vendors, products]);
  
  if (loading) {
    return <p>Loading platform analytics...</p>;
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
            <p className="text-xs text-muted-foreground">Across all vendors</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{totalSales}</div>
            <p className="text-xs text-muted-foreground">Total orders placed</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVendors}</div>
            <p className="text-xs text-muted-foreground">Sellers on the platform</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">Across all stores</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
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

        <Card>
          <CardHeader>
            <CardTitle>New Vendors - Last 30 Days</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <AreaChart data={vendorsChartData} margin={{ left: 12, right: 12 }}>
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
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Area
                  dataKey="vendors"
                  type="step"
                  fill="var(--color-vendors)"
                  fillOpacity={0.4}
                  stroke="var(--color-vendors)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
