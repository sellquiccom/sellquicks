
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { collection, query, where, onSnapshot, Timestamp, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format, formatDistanceToNow } from 'date-fns';

interface CustomerInfo {
    name: string;
    email: string;
}

interface Order extends DocumentData {
  customerInfo: CustomerInfo;
  totalAmount: number;
  status: 'confirmed' | 'fulfilled';
  createdAt: Timestamp;
}

interface CustomerAnalytics {
    email: string;
    name: string;
    totalSpent: number;
    orderCount: number;
    lastOrder: Date;
}

const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}


export default function CustomerAnalyticsPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
        collection(db, 'orders'),
        where('storeOwnerId', '==', user.uid),
        where('status', 'in', ['confirmed', 'fulfilled'])
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedOrders = snapshot.docs.map(doc => doc.data() as Order);
      setOrders(fetchedOrders);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const customerAnalytics = useMemo(() => {
    const analyticsMap = new Map<string, CustomerAnalytics>();

    orders.forEach(order => {
      const email = order.customerInfo.email;
      const current = analyticsMap.get(email) || {
        email,
        name: order.customerInfo.name,
        totalSpent: 0,
        orderCount: 0,
        lastOrder: order.createdAt.toDate(),
      };
      
      current.totalSpent += order.totalAmount;
      current.orderCount += 1;
      if (order.createdAt.toDate() > current.lastOrder) {
          current.lastOrder = order.createdAt.toDate();
      }

      analyticsMap.set(email, current);
    });

    return Array.from(analyticsMap.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders]);

  if (loading || authLoading) {
    return <p>Loading customer analytics...</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Analytics</CardTitle>
        <CardDescription>Your top customers by spending.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Last Order</TableHead>
              <TableHead className="text-right">Total Spent</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customerAnalytics.map(customer => (
              <TableRow key={customer.email}>
                <TableCell>
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                            <AvatarFallback>{getInitials(customer.name)}</AvatarFallback>
                        </Avatar>
                        <div className='grid gap-0.5'>
                            <p className="font-medium leading-none">{customer.name}</p>
                            <p className="text-xs text-muted-foreground">{customer.email}</p>
                        </div>
                    </div>
                </TableCell>
                <TableCell>{customer.orderCount}</TableCell>
                <TableCell>{formatDistanceToNow(customer.lastOrder, { addSuffix: true })}</TableCell>
                <TableCell className="text-right font-medium">GHS {customer.totalSpent.toFixed(2)}</TableCell>
              </TableRow>
            ))}
             {customerAnalytics.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No customer data available yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
