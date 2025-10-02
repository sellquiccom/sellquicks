
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface SellerData extends DocumentData {
    businessName: string;
}

export default function ThankYouPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const storeId = params.storeId as string;
  const orderCode = searchParams.get('orderCode');
  const sellerId = searchParams.get('sellerId');

  const [sellerName, setSellerName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSellerName = async () => {
        if (!sellerId) {
            setLoading(false);
            return;
        };

        try {
            const sellerRef = doc(db, 'users', sellerId);
            const sellerSnap = await getDoc(sellerRef);
            if (sellerSnap.exists()) {
                const sellerData = sellerSnap.data() as SellerData;
                setSellerName(sellerData.businessName);
            }
        } catch (error) {
            console.error("Error fetching seller data: ", error);
        } finally {
            setLoading(false);
        }
    };
    
    fetchSellerName();
  }, [sellerId]);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto bg-green-100 rounded-full h-16 w-16 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="mt-4 text-2xl font-bold">
            Thank You!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            {loading ? (
                <Loader2 className="mx-auto h-6 w-6 animate-spin" />
            ) : (
                 <p className="text-muted-foreground">
                    {sellerName || 'The seller'} is confirming your payment for order{' '}
                    <span className="font-bold text-foreground">#{orderCode}</span>.
                    You will be contacted shortly.
                </p>
            )}
          <Button asChild>
            <Link href={`/store/${storeId}`}>
              Continue Shopping
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

    