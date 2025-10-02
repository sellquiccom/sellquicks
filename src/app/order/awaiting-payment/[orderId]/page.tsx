
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OrderData extends DocumentData {
    id: string;
    totalAmount: number;
    paymentReference: string;
    storeOwnerId: string;
    storeId: string;
}

interface SellerData extends DocumentData {
    momoNumber: string;
    momoAccountName: string;
}

export default function AwaitingPaymentPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params.orderId as string;
    const { toast } = useToast();

    const [order, setOrder] = useState<OrderData | null>(null);
    const [seller, setSeller] = useState<SellerData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isConfirming, setIsConfirming] = useState(false);

    useEffect(() => {
        if (!orderId) return;

        const fetchOrderAndSeller = async () => {
            setIsLoading(true);
            try {
                const orderRef = doc(db, 'orders', orderId);
                const orderSnap = await getDoc(orderRef);

                if (orderSnap.exists()) {
                    const orderData = { id: orderSnap.id, ...orderSnap.data() } as OrderData;
                    setOrder(orderData);

                    const sellerRef = doc(db, 'users', orderData.storeOwnerId);
                    const sellerSnap = await getDoc(sellerRef);
                    if (sellerSnap.exists()) {
                        setSeller(sellerSnap.data() as SellerData);
                    } else {
                        throw new Error("Seller not found");
                    }
                } else {
                    throw new Error("Order not found");
                }
            } catch (error) {
                console.error("Error fetching payment details:", error);
                toast({
                    title: "Error",
                    description: "Could not load payment details. Please check the URL or contact support.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrderAndSeller();
    }, [orderId, toast]);

    const handleConfirmPayment = async () => {
        if (!order) return;
        setIsConfirming(true);
        try {
            const orderRef = doc(db, 'orders', order.id);
            await updateDoc(orderRef, {
                status: 'pending' // Move to pending for seller to confirm
            });
             router.push(`/store/${order.storeId}/thank-you?orderCode=${order.paymentReference}&sellerId=${order.storeOwnerId}`);
        } catch (error) {
             console.error("Error confirming payment:", error);
             toast({
                title: "Confirmation Failed",
                description: "There was an issue confirming your payment. Please try again.",
                variant: "destructive",
             });
             setIsConfirming(false);
        }
    };
    
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast({ title: 'Copied!', description: 'Copied to your clipboard.' });
        });
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!order || !seller) {
        return (
            <div className="flex h-screen items-center justify-center">
                <p>Could not load payment information.</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen flex items-center justify-center px-4 py-12">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <CardTitle className="text-2xl">Complete Your Order</CardTitle>
                    <CardDescription>
                        Please send your payment using the details below. Use the reference code to ensure your order is processed quickly.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="bg-muted p-4 rounded-lg space-y-3">
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">MOMO Number</Label>
                            <div className="flex items-center justify-center gap-2">
                                <p className="text-lg font-mono">{seller.momoNumber}</p>
                                 <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyToClipboard(seller.momoNumber)}>
                                    <Copy className="h-4 w-4" />
                                 </Button>
                            </div>
                        </div>
                        <div className="space-y-1">
                             <Label className="text-xs text-muted-foreground">Account Name</Label>
                             <p className="text-lg font-medium">{seller.momoAccountName}</p>
                        </div>
                    </div>

                     <div className="bg-primary/10 border-2 border-dashed border-primary/50 text-primary-foreground p-4 rounded-lg space-y-1">
                        <Label className="text-xs text-primary/80">Total Amount</Label>
                        <p className="text-3xl font-bold text-primary">GHS {order.totalAmount.toFixed(2)}</p>
                    </div>

                    <div className="bg-muted p-4 rounded-lg space-y-1">
                        <Label className="text-xs text-muted-foreground">Your Payment Reference</Label>
                         <div className="flex items-center justify-center gap-2">
                             <p className="text-xl font-bold tracking-widest text-foreground font-mono">{order.paymentReference}</p>
                             <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyToClipboard(order.paymentReference)}>
                                <Copy className="h-4 w-4" />
                             </Button>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex-col gap-4">
                     <p className="text-sm text-muted-foreground italic flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Waiting for payment...
                     </p>
                    <Button size="lg" className="w-full" onClick={handleConfirmPayment} disabled={isConfirming}>
                        {isConfirming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isConfirming ? "Confirming..." : "I Have Paid"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}

    