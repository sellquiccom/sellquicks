
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function StoreNotFoundPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md text-center p-6">
        <CardHeader>
          <div className="mx-auto bg-yellow-100 rounded-full h-16 w-16 flex items-center justify-center">
            <AlertTriangle className="h-10 w-10 text-yellow-500" />
          </div>
          <CardTitle className="mt-4 text-2xl font-bold">
            Store Not Found
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Sorry, we couldn't find a store at this address. Please check the URL and try again.
          </p>
          <Button asChild>
            <Link href="/">
              Return to Homepage
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
