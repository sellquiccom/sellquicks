
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, ShoppingCart, ArrowLeft } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, totalItems, totalPrice } = useCart();
  const [primaryColor, setPrimaryColor] = useState<string | undefined>();
  const shippingCost = 10.00;

  useEffect(() => {
    const fetchStoreColor = async () => {
      if (cart.length > 0) {
        const storeId = cart[0].storeId;
        if (storeId) {
          const q = query(collection(db, 'users'), where('storeId', '==', storeId));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const storeData = querySnapshot.docs[0].data();
            setPrimaryColor(storeData.primaryColor);
          }
        }
      }
    };
    fetchStoreColor();
  }, [cart]);

  return (
    <div className="bg-gray-50 min-h-screen" style={primaryColor ? { '--primary-dynamic': primaryColor } as React.CSSProperties : {}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Your Shopping Cart</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Review your items and proceed to checkout.
          </p>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed rounded-lg bg-white">
              <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
              <h2 className="mt-4 text-xl font-semibold">Your cart is empty</h2>
              <p className="mt-2 text-sm text-muted-foreground">Looks like you haven't added anything to your cart yet.</p>
              <Button asChild className="mt-6">
                  <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Continue Shopping
                  </Link>
              </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-12 items-start">
            <div className="lg:col-span-8">
              <Card>
                  <CardContent className='p-0'>
                      <Table>
                          <TableHeader>
                          <TableRow>
                              <TableHead className="w-24 sm:w-32">Product</TableHead>
                              <TableHead>Details</TableHead>
                              <TableHead className='text-center'>Quantity</TableHead>
                              <TableHead className="text-right">Price</TableHead>
                              <TableHead className="w-16"></TableHead>
                          </TableRow>
                          </TableHeader>
                          <TableBody>
                          {cart.map((item) => (
                              <TableRow key={item.id} className="text-sm">
                                  <TableCell>
                                      <Image
                                      src={item.images && item.images.length > 0 ? item.images[0] : `https://picsum.photos/seed/${item.id}/100`}
                                      alt={item.name}
                                      width={80}
                                      height={80}
                                      className="rounded-md object-cover"
                                      />
                                  </TableCell>
                                  <TableCell className='space-y-1'>
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-muted-foreground">{item.category}</p>
                                  </TableCell>
                                  <TableCell>
                                      <div className="flex items-center justify-center">
                                          <Input
                                              type="number"
                                              min="1"
                                              value={item.quantity}
                                              onChange={(e) => updateQuantity(item.id, parseInt(e.target.value, 10))}
                                              className="w-20 h-9"
                                              aria-label={`Quantity for ${item.name}`}
                                          />
                                      </div>
                                  </TableCell>
                                  <TableCell className="text-right font-medium">GHS {(item.price * item.quantity).toFixed(2)}</TableCell>
                                  <TableCell className="text-right">
                                     <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)} aria-label={`Remove ${item.name}`}>
                                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                                      </Button>
                                  </TableCell>
                              </TableRow>
                          ))}
                          </TableBody>
                      </Table>
                  </CardContent>
              </Card>
               <Button variant="link" asChild className="mt-4 px-0">
                  <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Continue Shopping
                  </Link>
              </Button>
            </div>

            <div className="lg:col-span-4 mt-8 lg:mt-0">
               <Card>
                  <CardHeader>
                      <CardTitle className="text-lg">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                      <div className="flex justify-between">
                          <span className="text-muted-foreground">Subtotal ({totalItems} items)</span>
                          <span className="font-medium">GHS {totalPrice.toFixed(2)}</span>
                      </div>
                       <div className="flex justify-between">
                          <span className="text-muted-foreground">Shipping</span>
                          <span className="font-medium">GHS {shippingCost.toFixed(2)}</span>
                      </div>
                      <Separator />
                       <div className="flex justify-between font-semibold text-base">
                          <span>Order Total</span>
                          <span>GHS {(totalPrice + shippingCost).toFixed(2)}</span>
                      </div>
                  </CardContent>
                  <CardFooter>
                      <Button asChild size="lg" className="w-full bg-[var(--primary-dynamic,hsl(var(--primary)))] hover:bg-[var(--primary-dynamic,hsl(var(--primary)))]/90">
                          <Link href="/checkout">Proceed to Checkout</Link>
                      </Button>
                  </CardFooter>
               </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
