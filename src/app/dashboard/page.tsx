
'use client';
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
import { ShoppingBag, BarChart, Users, DollarSign, Ban, Link as LinkIcon, Copy, CreditCard, Activity } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState, useMemo } from 'react';
import { collection, query, where, onSnapshot, Timestamp, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
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

export default function Dashboard() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [storeUrl, setStoreUrl] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && user && user.storeId) {
        const protocol = window.location.protocol;
        const host = window.location.host;
        let url;
        
        const storeId = user.storeId;

        if (process.env.NODE_ENV === 'production') {
            const domain = host.split('.').slice(-2).join('.');
            url = `${protocol}//${storeId}.${domain}`;
        } else {
            url = `${protocol}//${host}/store/${storeId}`;
        }
        setStoreUrl(url);
    }
  }, [user, loading]);
  
  useEffect(() => {
    if (!user) return;

    setDataLoading(true);
    const q = query(collection(db, 'orders'), where('storeOwnerId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setOrders(fetchedOrders);
      setDataLoading(false);
    }, (error) => {
      console.error("Error fetching orders:", error);
      toast({ title: "Error", description: "Could not load dashboard data.", variant: "destructive" });
      setDataLoading(false);
    });

    return () => unsubscribe();
  }, [user, toast]);

  const {
    totalRevenue,
    totalSales,
    avgSale,
    newCustomersThisMonth,
    revenueChartData,
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

    return { totalRevenue, totalSales, avgSale, newCustomersThisMonth, revenueChartData };
  }, [orders]);


  const copyToClipboard = () => {
    if (!storeUrl) return;
    navigator.clipboard.writeText(storeUrl).then(() => {
      toast({
        title: "Copied to Clipboard!",
        description: "Your store link has been copied.",
      });
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      toast({
        title: "Copy Failed",
        description: "Could not copy the link.",
        variant: "destructive",
      });
    });
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
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

       <div className="grid gap-4 md:gap-8 lg:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Share Your Store</CardTitle>
            <CardDescription>
              Here is the link to your storefront. Share it with your customers!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="relative flex-grow">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  readOnly
                  value={loading ? 'Loading your store link...' : storeUrl || 'Could not generate store link.'}
                  className="pl-10"
                  aria-label="Store URL"
                />
              </div>
              <Button variant="outline" size="icon" onClick={copyToClipboard} disabled={!storeUrl || loading}>
                <Copy className="h-4 w-4" />
                <span className="sr-only">Copy Link</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:gap-8 lg:grid-cols-1">
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
      </div>
    </>
  );
}
