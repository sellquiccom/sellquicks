'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { doc, DocumentData, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, Package, Check, Rocket, ShoppingBag } from 'lucide-react';

type OrderStatus = 'awaiting-payment' | 'pending' | 'confirmed' | 'fulfilled';

interface OrderItem {
  productName: string;
  quantity: number;
  price: number;
  image: string | null;
}

interface OrderData extends DocumentData {
  id: string;
  items: OrderItem[];
  customerInfo: { name: string };
  totalAmount: number;
  status: OrderStatus;
  paymentReference: string;
  storeOwnerId: string;
}

interface SellerData extends DocumentData {
    primaryColor: string;
}

const statusSteps: { status: OrderStatus; label: string; icon: React.ElementType }[] = [
  { status: 'awaiting-payment', label: 'Awaiting Payment', icon: ShoppingBag },
  { status: 'pending', label: 'Payment Pending', icon: Loader2 },
  { status: 'confirmed', label: 'Order Confirmed', icon: Check },
  { status: 'fulfilled', label: 'Order Fulfilled', icon: Rocket },
];

export default function TrackOrderPage() {
  const params = useParams();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<OrderData | null>(null);
  const [seller, setSeller] = useState<SellerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const orderRef = doc(db, 'orders', orderId);

    const unsubscribe = onSnapshot(orderRef, (orderSnap) => {
      if (orderSnap.exists()) {
        const orderData = { id: orderSnap.id, ...orderSnap.data() } as OrderData;
        setOrder(orderData);

        // Fetch seller data once when order data is first loaded
        if (!seller) {
            const sellerRef = doc(db, 'users', orderData.storeOwnerId);
            onSnapshot(sellerRef, (sellerSnap) => {
                 if (sellerSnap.exists()) {
                    setSeller(sellerSnap.data() as SellerData);
                 }
            });
        }

      } else {
        setOrder(null);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching order:", error);
      setOrder(null);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [orderId, seller]);

  const currentStatusIndex = useMemo(() => {
    if (!order) return -1;
    return statusSteps.findIndex(step => step.status === order.status);
  }, [order]);
  
  const primaryColor = seller?.primaryColor;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Card className="text-center p-8">
          <CardTitle>Order Not Found</CardTitle>
          <CardDescription>Please check the link and try again.</CardDescription>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4" style={primaryColor ? { '--primary-dynamic': primaryColor } as React.CSSProperties : {}}>
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Track Your Order</h1>
          <p className="text-muted-foreground">
            Hi {order.customerInfo.name}, here is the latest status of your order #{order.paymentReference}.
          </p>
        </header>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative pt-4">
              <div className="absolute left-0 top-7 w-full h-1 bg-gray-200" />
              <div 
                className="absolute left-0 top-7 h-1 bg-[var(--primary-dynamic,hsl(var(--primary)))] transition-all duration-500" 
                style={{ width: `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%` }}
              />
              <div className="relative flex justify-between items-start">
                {statusSteps.map((step, index) => {
                  const isActive = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;
                  return (
                    <div key={step.status} className="flex flex-col items-center text-center w-24">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-500 ${
                          isActive ? 'bg-[var(--primary-dynamic,hsl(var(--primary)))] border-[var(--primary-dynamic,hsl(var(--primary)))] text-white' : 'bg-white border-gray-300 text-gray-400'
                        }`}
                      >
                        {step.icon === Loader2 && isCurrent ? <Loader2 className="animate-spin"/> : <step.icon className="h-5 w-5" />}
                      </div>
                      <p className={`mt-2 text-xs font-semibold ${isActive ? 'text-gray-800' : 'text-gray-400'}`}>{step.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
            <CardDescription>Total: GHS {order.totalAmount.toFixed(2)}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center gap-4">
                    <Image
                      src={item.image || 'https://placehold.co/100x100'}
                      alt={item.productName}
                      width={64}
                      height={64}
                      className="rounded-md object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">GHS {(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                  {index < order.items.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
