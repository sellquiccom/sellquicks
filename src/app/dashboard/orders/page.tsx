
'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { collection, query, where, onSnapshot, DocumentData, Timestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { format } from 'date-fns';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

type OrderStatus = 'pending' | 'confirmed' | 'fulfilled';

interface Order extends DocumentData {
  id: string;
  productName: string;
  productPrice: number;
  status: OrderStatus;
  createdAt: Timestamp;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'orders'), where('storeOwnerId', '==', user.uid));
    
    // Use onSnapshot for real-time updates
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const ordersData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt,
        } as Order;
      });
      // Sort orders by creation date, newest first
      ordersData.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
      setOrders(ordersData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching orders in real-time: ", error);
      toast({
        title: 'Error',
        description: 'Could not fetch orders. Please try again later.',
        variant: 'destructive',
      });
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [user, toast]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    const orderRef = doc(db, 'orders', orderId);
    try {
      await updateDoc(orderRef, { status: newStatus });
      toast({
        title: 'Order Updated',
        description: `Order status changed to ${newStatus}.`,
      });
    } catch (error) {
      console.error('Error updating order status: ', error);
      toast({
        title: 'Update Failed',
        description: 'Could not update the order status.',
        variant: 'destructive',
      });
    }
  };

  const getStatusVariant = (status: string): "destructive" | "secondary" | "default" | "outline" => {
    switch (status) {
      case 'pending':
        return 'destructive';
      case 'confirmed':
        return 'secondary';
      case 'fulfilled':
        return 'default';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders</CardTitle>
        <CardDescription>View and manage incoming orders for your store.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-[50px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">Loading orders...</TableCell>
              </TableRow>
            ) : orders.length > 0 ? (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.productName}</TableCell>
                  <TableCell>{order.createdAt ? format(order.createdAt.toDate(), 'PPp') : 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(order.status)} className="capitalize">{order.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">GHS {order.productPrice.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Order actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem disabled={order.status === 'confirmed'} onClick={() => handleStatusChange(order.id, 'confirmed')}>
                          Mark as Confirmed
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled={order.status === 'fulfilled'} onClick={() => handleStatusChange(order.id, 'fulfilled')}>
                          Mark as Fulfilled
                        </DropdownMenuItem>
                         <DropdownMenuItem disabled={order.status === 'pending'} onClick={() => handleStatusChange(order.id, 'pending')}>
                          Mark as Pending
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">You have no orders yet.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
