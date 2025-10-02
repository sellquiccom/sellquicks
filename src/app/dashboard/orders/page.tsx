
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

type OrderStatus = 'pending' | 'confirmed' | 'fulfilled';

interface OrderItem {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    image: string | null;
}

interface CustomerInfo {
    name: string;
    email: string;
    phone: string;
    address: string;
}

interface Order extends DocumentData {
  id: string;
  items: OrderItem[];
  customerInfo: CustomerInfo;
  totalAmount: number;
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
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const ordersData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt,
        } as Order;
      });
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

  const getItemSummary = (items: OrderItem[]): string => {
    if (!items || items.length === 0) {
      return "No items";
    }
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    if (items.length === 1) {
        return `${items[0].productName} (x${items[0].quantity})`;
    }
    return `${items.length} products, ${totalItems} total items`;
  }

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
              <TableHead>Customer</TableHead>
              <TableHead>Order Details</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">Loading orders...</TableCell>
              </TableRow>
            ) : orders.length > 0 ? (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.customerInfo?.name || 'N/A'}</TableCell>
                  <TableCell>{getItemSummary(order.items)}</TableCell>
                  <TableCell>{order.createdAt ? format(order.createdAt.toDate(), 'PPp') : 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(order.status)} className="capitalize">{order.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">GHS {typeof order.totalAmount === 'number' ? order.totalAmount.toFixed(2) : '0.00'}</TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Order actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                           <DialogTrigger asChild>
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                          </DialogTrigger>
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
                       <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Order Details</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="font-semibold mb-2">Customer Information</h3>
                                    <div className="text-sm space-y-1">
                                        <p><span className="font-medium">Name:</span> {order.customerInfo?.name}</p>
                                        <p><span className="font-medium">Email:</span> {order.customerInfo?.email}</p>
                                        <p><span className="font-medium">Phone:</span> {order.customerInfo?.phone}</p>
                                        <p><span className="font-medium">Address:</span> {order.customerInfo?.address}</p>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-2">Order Summary</h3>
                                    <div className="text-sm space-y-1">
                                        <p><span className="font-medium">Order ID:</span> {order.id}</p>
                                        <p><span className="font-medium">Status:</span> <Badge variant={getStatusVariant(order.status)} className="capitalize">{order.status}</Badge></p>
                                        <p><span className="font-medium">Total:</span> GHS {order.totalAmount.toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-2">Items Ordered</h3>
                                <div className="space-y-2">
                                    {order.items.map((item) => (
                                        <div key={item.productId} className="flex items-center gap-4 p-2 border rounded-md">
                                            <Image
                                                src={item.image || 'https://placehold.co/100x100'}
                                                alt={item.productName}
                                                width={60}
                                                height={60}
                                                className="rounded-md object-cover"
                                            />
                                            <div className="flex-1">
                                                <p className="font-medium">{item.productName}</p>
                                                <p className="text-sm text-muted-foreground">Qty: {item.quantity} @ GHS {item.price.toFixed(2)}</p>
                                            </div>
                                            <p className="font-semibold">GHS {(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">You have no orders yet.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

    