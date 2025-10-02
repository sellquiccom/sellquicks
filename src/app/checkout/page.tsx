'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, writeBatch, doc } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

export default function CheckoutPage() {
  const { cart, totalItems, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      toast({
        title: 'Your cart is empty',
        variant: 'destructive',
      });
      return;
    }
    
    // Group items by store owner
    const ordersByStore: { [key: string]: typeof cart } = cart.reduce((acc, item) => {
      const storeOwnerId = item.userId; 
      if (!acc[storeOwnerId]) {
        acc[storeOwnerId] = [];
      }
      acc[storeOwnerId].push(item);
      return acc;
    }, {} as { [key: string]: typeof cart });

    setIsPlacingOrder(true);
    
    try {
      const batch = writeBatch(db);

      for (const storeOwnerId in ordersByStore) {
        const storeItems = ordersByStore[storeOwnerId];
        const storeId = storeItems[0]?.storeId; 
        const totalAmount = storeItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

        const orderRef = doc(collection(db, 'orders'));
        batch.set(orderRef, {
            storeOwnerId,
            storeId,
            status: 'pending',
            totalAmount,
            customerInfo: { name, email, phone, address },
            items: storeItems.map(item => ({
                productId: item.id,
                productName: item.name,
                quantity: item.quantity,
                price: item.price,
                image: item.images[0] || null,
            })),
            createdAt: serverTimestamp(),
        });
      }
      
      await batch.commit();

      toast({
        title: 'Order Placed Successfully!',
        description: 'Thank you for your purchase. The seller(s) will be in touch.',
      });
      clearCart();
      router.push('/');
    } catch (error) {
      console.error('Error placing order: ', error);
      toast({
        title: 'Order Failed',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
        setIsPlacingOrder(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Checkout</h1>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        <Card>
          <CardHeader>
            <CardTitle>Shipping Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
             <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Delivery Address</Label>
              <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} required />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Your Order</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {cart.map(item => (
                        <div key={item.id} className="flex items-center justify-between">
                            <div className='flex items-center gap-4'>
                                <Image 
                                    src={item.images[0]} 
                                    alt={item.name} 
                                    width={64} height={64} 
                                    className='rounded-md object-cover'
                                />
                                <div>
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                </div>
                            </div>
                            <p className="font-semibold">GHS {(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                    ))}
                    <div className="border-t pt-4 space-y-2">
                         <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span className="font-semibold">GHS {totalPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Shipping</span>
                            <span className="font-semibold">GHS 10.00</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>GHS {(totalPrice + 10).toFixed(2)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Button type="submit" size="lg" className="w-full" disabled={isPlacingOrder || cart.length === 0}>
                {isPlacingOrder ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
            </Button>
        </div>
      </form>
    </div>
  );
}
