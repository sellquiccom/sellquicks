
'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  collection,
  query,
  where,
  onSnapshot,
  DocumentData,
  Timestamp,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { format } from 'date-fns';
import { ChevronDown, Trash2 } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

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

const OrderRow = ({ order }: { order: Order }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { toast } = useToast();

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
  
  const handleDeleteOrder = async (orderId: string) => {
    const orderRef = doc(db, 'orders', orderId);
    try {
      await deleteDoc(orderRef);
      toast({
        title: 'Order Deleted',
        description: 'The order has been permanently deleted.',
      });
    } catch (error) {
       console.error('Error deleting order: ', error);
      toast({
        title: 'Delete Failed',
        description: 'Could not delete the order.',
        variant: 'destructive',
      });
    }
  };


  const getStatusVariant = (
    status: string
  ): 'destructive' | 'secondary' | 'default' | 'outline' => {
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
      return 'No items';
    }
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    if (items.length === 1) {
      return `${items[0].productName} (x${items[0].quantity})`;
    }
    return `${items.length} products, ${totalItems} total items`;
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} asChild>
      <tbody className="border-b">
        <CollapsibleTrigger asChild>
          <TableRow className="cursor-pointer">
            <TableCell className="font-medium">
              {order.customerInfo?.name || 'N/A'}
            </TableCell>
            <TableCell>{getItemSummary(order.items)}</TableCell>
            <TableCell>
              {order.createdAt ? format(order.createdAt.toDate(), 'PPp') : 'N/A'}
            </TableCell>
            <TableCell>
              <Badge variant={getStatusVariant(order.status)} className="capitalize">
                {order.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              GHS{' '}
              {typeof order.totalAmount === 'number'
                ? order.totalAmount.toFixed(2)
                : '0.00'}
            </TableCell>
            <TableCell className="text-right w-[120px]">
              <div className="flex items-center justify-end gap-2">
                <span className="text-xs text-muted-foreground">
                  {isOpen ? 'Hide' : 'View'}
                </span>
                <ChevronDown
                  className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')}
                />
              </div>
            </TableCell>
          </TableRow>
        </CollapsibleTrigger>
        <CollapsibleContent asChild>
          <tr className="bg-muted/50">
            <TableCell colSpan={6}>
              <div className="grid gap-4 py-4 px-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Customer Information</h3>
                    <div className="text-sm space-y-1">
                      <p>
                        <span className="font-medium">Name:</span>{' '}
                        {order.customerInfo?.name}
                      </p>
                      <p>
                        <span className="font-medium">Email:</span>{' '}
                        {order.customerInfo?.email}
                      </p>
                      <p>
                        <span className="font-medium">Phone:</span>{' '}
                        {order.customerInfo?.phone}
                      </p>
                      <p>
                        <span className="font-medium">Address:</span>{' '}
                        {order.customerInfo?.address}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Order Summary & Actions</h3>
                    <div className="text-sm space-y-2">
                      <p>
                        <span className="font-medium">Order ID:</span> {order.id}
                      </p>
                      <p>
                        <span className="font-medium">Status:</span>{' '}
                        <Badge
                          variant={getStatusVariant(order.status)}
                          className="capitalize"
                        >
                          {order.status}
                        </Badge>
                      </p>
                      <p>
                        <span className="font-medium">Total:</span> GHS{' '}
                        {typeof order.totalAmount === 'number'
                          ? order.totalAmount.toFixed(2)
                          : '0.00'}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={order.status === 'confirmed'}
                        onClick={() => handleStatusChange(order.id, 'confirmed')}
                      >
                        Mark as Confirmed
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={order.status === 'fulfilled'}
                        onClick={() => handleStatusChange(order.id, 'fulfilled')}
                      >
                        Mark as Fulfilled
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button size="sm" variant="destructive" className="ml-auto">
                              <Trash2 className="mr-2 h-4 w-4" /> Delete Order
                           </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the order from your records.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteOrder(order.id)}>
                              Yes, Delete Order
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Items Ordered</h3>
                  <div className="space-y-2">
                    {order.items &&
                      order.items.map((item) => (
                        <div
                          key={item.productId}
                          className="flex items-center gap-4 p-2 border rounded-md bg-background"
                        >
                          <Image
                            src={item.image || 'https://placehold.co/100x100'}
                            alt={item.productName}
                            width={60}
                            height={60}
                            className="rounded-md object-cover"
                          />
                          <div className="flex-1">
                            <p className="font-medium">{item.productName}</p>
                            <p className="text-sm text-muted-foreground">
                              Qty: {item.quantity} @ GHS {item.price.toFixed(2)}
                            </p>
                          </div>
                          <p className="font-semibold">
                            GHS {(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </TableCell>
          </tr>
        </CollapsibleContent>
      </tbody>
    </Collapsible>
  );
};

export default function OrdersPage() {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  React.useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'orders'),
      where('storeOwnerId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const ordersData = querySnapshot.docs.map((doc) => {
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
      },
      (error) => {
        console.error('Error fetching orders in real-time: ', error);
        toast({
          title: 'Error',
          description: 'Could not fetch orders. Please try again later.',
          variant: 'destructive',
        });
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders</CardTitle>
        <CardDescription>
          View and manage incoming orders for your store.
        </CardDescription>
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
              <TableHead className="w-[120px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Loading orders...
                </TableCell>
              </TableRow>
            ) : orders.length > 0 ? (
              orders.map((order) => <OrderRow key={order.id} order={order} />)
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  You have no orders yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
