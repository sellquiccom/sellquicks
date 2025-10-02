
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, writeBatch, doc, getDocs, query, where, DocumentData, onSnapshot } from 'firebase/firestore';
import { generateOrderCode } from '@/lib/order-code';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface DeliveryOption extends DocumentData {
    id: string;
    label: string;
    fee: number;
}

export default function CheckoutPage() {
  const { cart, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryOption | null>(null);

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [primaryColor, setPrimaryColor] = useState<string | undefined>();
  
  const shippingCost = selectedDelivery ? selectedDelivery.fee : 0;
  const finalTotal = totalPrice + shippingCost;


  useEffect(() => {
    if (cart.length === 0) return;
    
    const storeOwnerId = cart[0].userId;
    if (!storeOwnerId) return;

    // Fetch primary color
    const userDocRef = doc(db, 'users', storeOwnerId);
    getDoc(userDocRef).then(docSnap => {
        if(docSnap.exists()){
            setPrimaryColor(docSnap.data().primaryColor);
        }
    });

    // Fetch delivery options
    const deliveryQuery = query(collection(db, 'users', storeOwnerId, 'deliveries'));
    const unsubscribe = onSnapshot(deliveryQuery, (snapshot) => {
        const options = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DeliveryOption));
        setDeliveryOptions(options);
        // Auto-select the first option if not already selected
        if (!selectedDelivery && options.length > 0) {
            setSelectedDelivery(options[0]);
        }
    });

    return () => unsubscribe();
  }, [cart, selectedDelivery]);
  
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      toast({ title: 'Your cart is empty', variant: 'destructive' });
      return;
    }
    if (!selectedDelivery) {
        toast({ title: 'Please select a delivery option', variant: 'destructive' });
        return;
    }
    
    // Group items by seller (storeOwnerId) - this is a bit redundant now but good practice
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
      if (Object.keys(ordersByStore).length > 1) {
          toast({ title: "Multiple Stores", description: "Checkout from one store at a time.", variant: "destructive" });
          setIsPlacingOrder(false);
          return;
      }
      
      const storeOwnerId = Object.keys(ordersByStore)[0];
      const storeItems = ordersByStore[storeOwnerId];
      const storeId = storeItems[0]?.storeId;
      const paymentReference = generateOrderCode();

      const newOrderRef = await addDoc(collection(db, 'orders'), {
            storeOwnerId,
            storeId,
            status: 'awaiting-payment',
            paymentReference,
            totalAmount: finalTotal,
            shipping: {
                label: selectedDelivery.label,
                fee: selectedDelivery.fee,
            },
            customerInfo: { name, email, phone, address },
            items: storeItems.map(item => ({
                productId: item.id,
                productName: item.name,
                quantity: item.quantity,
                price: item.price,
                image: item.images && item.images.length > 0 ? item.images[0] : null,
            })),
            createdAt: serverTimestamp(),
      });
      
      clearCart();
      router.push(`/order/awaiting-payment/${newOrderRef.id}`);

    } catch (error) {
      console.error('Error placing order: ', error);
      toast({ title: 'Order Failed', description: 'Something went wrong. Please try again.', variant: 'destructive' });
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen" style={primaryColor ? { '--primary-dynamic': primaryColor } as React.CSSProperties : {}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="mb-8 text-center">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Checkout</h1>
            </div>

            <div className="max-w-4xl mx-auto">
                <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                    <div className="space-y-6">
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
                        
                        <Card>
                            <CardHeader>
                                <CardTitle>Delivery Method</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <RadioGroup value={selectedDelivery?.id} onValueChange={(id) => setSelectedDelivery(deliveryOptions.find(opt => opt.id === id) || null)}>
                                    <div className="space-y-2">
                                        {deliveryOptions.map(option => (
                                            <Label key={option.id} className='flex items-center justify-between p-3 border rounded-md cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary'>
                                                <div className="flex items-center space-x-3">
                                                    <RadioGroupItem value={option.id} id={option.id} />
                                                    <span>{option.label}</span>
                                                </div>
                                                <span className='font-semibold'>GHS {option.fee.toFixed(2)}</span>
                                            </Label>
                                        ))}
                                        {deliveryOptions.length === 0 && (
                                            <p className='text-sm text-muted-foreground'>No delivery options available for this store.</p>
                                        )}
                                    </div>
                                </RadioGroup>
                            </CardContent>
                        </Card>

                    </div>


                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Your Order</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                {cart.map(item => (
                                    <div key={item.id} className="flex items-center justify-between">
                                        <div className='flex items-center gap-4'>
                                            <Image 
                                                src={item.images && item.images.length > 0 ? item.images[0] : 'https://picsum.photos/seed/placeholder/64'} 
                                                alt={item.name} 
                                                width={64} height={64} 
                                                className='rounded-md object-cover'
                                            />
                                            <div>
                                                <p className="font-medium">{item.name}</p>
                                                <p className="text-muted-foreground">Qty: {item.quantity}</p>
                                            </div>
                                        </div>
                                        <p className="font-semibold">GHS {(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                ))}
                                <Separator />
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className='text-muted-foreground'>Subtotal</span>
                                        <span className="font-semibold">GHS {totalPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className='text-muted-foreground'>Shipping</span>
                                        <span className="font-semibold">GHS {shippingCost.toFixed(2)}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>Total</span>
                                        <span>GHS {finalTotal.toFixed(2)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Button type="submit" size="lg" className="w-full bg-[var(--primary-dynamic,hsl(var(--primary)))] hover:bg-[var(--primary-dynamic,hsl(var(--primary)))]/90" disabled={isPlacingOrder || cart.length === 0 || !selectedDelivery}>
                            {isPlacingOrder ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    </div>
  );
}

    