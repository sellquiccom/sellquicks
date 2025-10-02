'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function ThankYouPage() {
  const params = useParams();
  const storeId = params.storeId as string;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto bg-green-100 rounded-full h-16 w-16 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="mt-4 text-2xl font-bold">
            Thank You for Your Order!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Your order has been placed successfully. The seller will be in contact with you shortly regarding payment and delivery.
          </p>
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
