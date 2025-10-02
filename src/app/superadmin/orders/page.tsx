
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
  onSnapshot,
  DocumentData,
  Timestamp,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
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
import Link from 'next/link';

type OrderStatus = 'awaiting-payment' | 'pending' | 'confirmed' | 'fulfilled';

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
  paymentReference: string;
  storeOwnerId: string;
  storeId: string;
  vendorName?: string; // Will be added dynamically
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

  const getStatusVariant = (
    status: string
  ): 'destructive' | 'secondary' | 'default' | 'outline' => {
    switch (status) {
      case 'awaiting-payment':
        return 'destructive';
      case 'pending':
        return 'secondary';
      case 'confirmed':
        return 'default';
      case 'fulfilled':
        return 'default'; 
      default:
        return 'outline';
    }
  };
  
  const getStatusLabel = (status: string) => {
    return status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  const getItemSummary = (items: OrderItem[]): string => {
    if (!items || items.length === 0) return 'No items';
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    if (items.length === 1) {
      return `${items[0].productName} (x${items[0].quantity})`;
    }
    return `${items.length} products, ${totalItems} total items`;
  };

  return (
    <Collapsible asChild key={order.id} open={isOpen} onOpenChange={setIsOpen}>
      <>
        <CollapsibleTrigger asChild>
          <TableRow className="cursor-pointer">
            <TableCell className="font-medium">
              <div className="font-medium">{order.customerInfo?.name || 'N/A'}</div>
              <div className="text-xs text-muted-foreground">{order.vendorName || '...'}</div>
            </TableCell>
            <TableCell>{getItemSummary(order.items)}</TableCell>
            <TableCell>
              <Badge variant={getStatusVariant(order.status)} className="capitalize">
                {getStatusLabel(order.status)}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              GHS {typeof order.totalAmount === 'number' ? order.totalAmount.toFixed(2) : '0.00'}
            </TableCell>
            <TableCell className="text-right w-[120px]">
              <div className="flex items-center justify-end gap-2">
                <span className="text-xs text-muted-foreground">{isOpen ? 'Hide' : 'View'}</span>
                <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
              </div>
            </TableCell>
          </TableRow>
        </CollapsibleTrigger>
        <CollapsibleContent asChild>
          <tr className="bg-muted/50">
            <TableCell colSpan={5}>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-1">Customer & Order</h3>
                    <div className="text-sm space-y-0.5">
                      <p><strong>Name:</strong> {order.customerInfo?.name}</p>
                      <p><strong>Email:</strong> {order.customerInfo?.email}</p>
                      <p><strong>Phone:</strong> {order.customerInfo?.phone}</p>
                      <p><strong>Address:</strong> {order.customerInfo?.address}</p>
                      <p><strong>Date:</strong> {order.createdAt ? format(order.createdAt.toDate(), 'PPp') : 'N/A'}</p>
                    </div>
                  </div>
                   <div>
                    <h3 className="font-semibold mb-1">Payment & Vendor</h3>
                     <div className="text-sm space-y-0.5">
                        <p><strong>Vendor:</strong> {order.vendorName || 'Loading...'}</p>
                        <p><strong>Store ID:</strong> {order.storeId}</p>
                        <p><strong>Payment Ref:</strong> <span className="font-mono">{order.paymentReference}</span></p>
                        <p><strong>Status:</strong> <span className="capitalize">{getStatusLabel(order.status)}</span></p>
                        <p><strong>Total:</strong> <span className="font-semibold">GHS {order.totalAmount.toFixed(2)}</span></p>
                     </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Items Ordered</h3>
                  <div className="space-y-2">
                    {order.items?.map((item) => (
                      <div key={item.productId} className="flex items-center gap-4 p-2 border rounded-md bg-background">
                        <Image
                          src={item.image || 'https://placehold.co/100x100'}
                          alt={item.productName}
                          width={40} height={40} className="rounded-md object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.productName}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity} @ GHS {item.price.toFixed(2)}</p>
                        </div>
                        <p className="font-semibold text-sm">GHS {(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TableCell>
          </tr>
        </CollapsibleContent>
      </>
    </Collapsible>
  );
};

export default function AllOrdersPage() {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [vendors, setVendors] = React.useState<Map<string, string>>(new Map());
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();

  React.useEffect(() => {
    // Fetch all vendors to create a lookup map
    const unsubVendors = onSnapshot(collection(db, "users"), (snapshot) => {
        const vendorMap = new Map<string, string>();
        snapshot.forEach(doc => {
            vendorMap.set(doc.id, doc.data().businessName || 'Unnamed Vendor');
        });
        setVendors(vendorMap);
    });

    const q = query(collection(db, 'orders'));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const ordersData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          } as Order));
        ordersData.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
        setOrders(ordersData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching orders: ', error);
        toast({
          title: 'Error',
          description: 'Could not fetch platform orders.',
          variant: 'destructive',
        });
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
      unsubVendors();
    };
  }, [toast]);
  
  const ordersWithVendorNames = React.useMemo(() => {
    return orders.map(order => ({
        ...order,
        vendorName: vendors.get(order.storeOwnerId) || 'Unknown Vendor'
    }));
  }, [orders, vendors]);


  return (
    <Card>
      <CardHeader>
        <CardTitle>All Platform Orders</CardTitle>
        <CardDescription>
          View and manage all orders across every store.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer / Vendor</TableHead>
              <TableHead>Order Details</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-[120px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">Loading all orders...</TableCell>
              </TableRow>
            ) : ordersWithVendorNames.length > 0 ? (
              ordersWithVendorNames.map((order) => <OrderRow key={order.id} order={order} />)
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">There are no orders on the platform yet.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

    