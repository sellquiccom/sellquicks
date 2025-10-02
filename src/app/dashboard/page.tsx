
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
import { ArrowUp, ShoppingBag, BarChart, Users, DollarSign, Ban, Link as LinkIcon, Copy } from 'lucide-react';
import { Line, LineChart, CartesianGrid, XAxis, Tooltip } from 'recharts';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';

const chartData = [
  { month: 'Jan', totalSales: 186, grossProfit: 80, netProfit: 60 },
  { month: 'Feb', totalSales: 305, grossProfit: 200, netProfit: 150 },
  { month: 'Mar', totalSales: 237, grossProfit: 120, netProfit: 90 },
  { month: 'Apr', totalSales: 73, grossProfit: 190, netProfit: 120 },
  { month: 'May', totalSales: 209, grossProfit: 130, netProfit: 100 },
  { month: 'Jun', totalSales: 214, grossProfit: 140, netProfit: 110 },
  { month: 'Jul', totalSales: 350, grossProfit: 220, netProfit: 180 },
  { month: 'Aug', totalSales: 280, grossProfit: 180, netProfit: 140 },
  { month: 'Sep', totalSales: 310, grossProfit: 190, netProfit: 150 },
  { month: 'Oct', totalSales: 250, grossProfit: 160, netProfit: 120 },
  { month: 'Nov', totalSales: 290, grossProfit: 180, netProfit: 140 },
  { month: 'Dec', totalSales: 320, grossProfit: 200, netProfit: 160 },
];

const chartConfig = {
  totalSales: {
    label: 'Total Sales',
    color: 'hsl(var(--chart-2))',
  },
  grossProfit: {
    label: 'Gross Profit',
    color: 'hsl(var(--chart-2))',
  },
  netProfit: {
    label: 'Net Profit',
    color: 'hsl(var(--chart-2))',
  },
};

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [storeUrl, setStoreUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && user?.displayName) {
      // In a real production app, you might have a different base URL
      const baseUrl = window.location.origin;
      setStoreUrl(`${baseUrl}/store/${user.displayName}`);
    }
  }, [user]);

  const copyToClipboard = () => {
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
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">546</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="text-green-600 flex items-center"><ArrowUp className="h-3 w-3" /> 0.5%</span> 
              vs last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gross Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GHS 835k</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="text-green-600 flex items-center"><ArrowUp className="h-3 w-3" /> 0.5%</span> 
              vs last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GHS 720.8M</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="text-green-600 flex items-center"><ArrowUp className="h-3 w-3" /> 0.5%</span> 
              vs last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
            <Ban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GHS 20k</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="text-red-600 flex items-center"><ArrowUp className="h-3 w-3" /> 0.5%</span> 
              vs last month
            </p>
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
                  value={storeUrl}
                  className="pl-10"
                  aria-label="Store URL"
                />
              </div>
              <Button variant="outline" size="icon" onClick={copyToClipboard} disabled={!storeUrl}>
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
            <CardTitle>Total Sales</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      indicator="line"
                      labelKey="totalSales"
                    />
                  }
                />
                <Line
                  dataKey="totalSales"
                  type="monotone"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  dot={true}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Gross Profit</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} />
                    <Tooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="line" />}
                    />
                    <Line
                        dataKey="grossProfit"
                        type="monotone"
                        stroke="hsl(var(--chart-2))"
                        strokeWidth={2}
                        dot={false}
                    />
                </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Net Profit</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} />
                    <Tooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="line" />}
                    />
                    <Line
                        dataKey="netProfit"
                        type="monotone"
                        stroke="hsl(var(--chart-2))"
                        strokeWidth={2}
                        dot={false}
                    />
                </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
