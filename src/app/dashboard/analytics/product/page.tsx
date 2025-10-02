'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { collection, query, where, onSnapshot, Timestamp, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';

interface Product extends DocumentData {
  id: string;
  name: string;
  price: number;
  images: string[];
}

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

interface Order extends DocumentData {
  items: OrderItem[];
  status: 'confirmed' | 'fulfilled';
}

interface ProductAnalytics extends Product {
  unitsSold: number;
  revenue: number;
}

export default function ProductAnalyticsPage() {
  const { user, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const productsQuery = query(collection(db, 'products'), where('userId', '==', user.uid));
    const ordersQuery = query(collection(db, 'orders'), where('storeOwnerId', '==', user.uid));

    const unsubProducts = onSnapshot(productsQuery, (snapshot) => {
      const fetchedProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(fetchedProducts);
    });

    const unsubOrders = onSnapshot(ordersQuery, (snapshot) => {
      const fetchedOrders = snapshot.docs
        .map(doc => doc.data() as Order)
        .filter(o => o.status === 'confirmed' || o.status === 'fulfilled');
      setOrders(fetchedOrders);
    });

    setLoading(false);

    return () => {
      unsubProducts();
      unsubOrders();
    };
  }, [user]);

  const productAnalytics = useMemo(() => {
    const analyticsMap = new Map<string, { unitsSold: number; revenue: number }>();

    orders.forEach(order => {
      order.items.forEach(item => {
        const current = analyticsMap.get(item.productId) || { unitsSold: 0, revenue: 0 };
        current.unitsSold += item.quantity;
        current.revenue += item.quantity * item.price;
        analyticsMap.set(item.productId, current);
      });
    });

    return products
      .map(product => ({
        ...product,
        unitsSold: analyticsMap.get(product.id)?.unitsSold || 0,
        revenue: analyticsMap.get(product.id)?.revenue || 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [products, orders]);
  
  const totalRevenueAllProducts = productAnalytics.reduce((sum, p) => sum + p.revenue, 0);

  if (loading || authLoading) {
    return <p>Loading product analytics...</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Analytics</CardTitle>
        <CardDescription>Performance of your products.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[350px]">Product</TableHead>
              <TableHead>Units Sold</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead className="w-[150px]">% of Total Revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {productAnalytics.map(product => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Image
                      src={product.images?.[0] || 'https://placehold.co/40x40'}
                      alt={product.name}
                      width={40}
                      height={40}
                      className="rounded-md object-cover aspect-square"
                    />
                    <span className="font-medium">{product.name}</span>
                  </div>
                </TableCell>
                <TableCell>{product.unitsSold}</TableCell>
                <TableCell>GHS {product.revenue.toFixed(2)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className='text-sm text-muted-foreground'>
                        {totalRevenueAllProducts > 0 ? ((product.revenue / totalRevenueAllProducts) * 100).toFixed(1) : 0}%
                    </span>
                    <Progress value={totalRevenueAllProducts > 0 ? (product.revenue / totalRevenueAllProducts) * 100 : 0} className='h-2' />
                  </div>
                </TableCell>
              </TableRow>
            ))}
             {productAnalytics.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No product sales data available yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
