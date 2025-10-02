
'use client';

import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, Plus } from 'lucide-react';
import Link from 'next/link';
import { getStoreIdentifier } from '@/lib/store';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, DocumentData, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface Product extends DocumentData {
  id: string;
  name: string;
  price: number;
  images: string[];
  description: string;
  userId: string;
}

const ProductCard = ({ product, storeId }: { product: Product; storeId: string | null }) => {
  const { toast } = useToast();

  const handleCreateOrder = async () => {
    if (!storeId || !product.userId) {
      toast({
        title: 'Error',
        description: 'Store information is missing.',
        variant: 'destructive',
      });
      return;
    }
    try {
      await addDoc(collection(db, 'orders'), {
        productId: product.id,
        productName: product.name,
        productPrice: product.price,
        storeOwnerId: product.userId,
        storeId: storeId,
        status: 'pending',
        customerInfo: { // Placeholder for customer details
            name: 'John Doe',
            email: 'john.doe@example.com'
        },
        createdAt: serverTimestamp(),
      });
      toast({
        title: 'Order Placed!',
        description: `Your order for "${product.name}" has been sent to the seller.`,
      });
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: 'Order Failed',
        description: 'Could not place the order at this time.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-sm overflow-hidden group">
      <div className="relative">
        <Image
          src={product.images && product.images.length > 0 ? product.images[0] : `https://picsum.photos/seed/${product.id}/400/400`}
          alt={product.name}
          width={400}
          height={400}
          className="object-cover w-full aspect-square"
          data-ai-hint={product.name}
        />
        <Button size="icon" className="absolute bottom-2 right-2 rounded-full h-8 w-8 bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleCreateOrder}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="p-4">
        <h3 className="text-sm font-medium text-foreground">{product.name}</h3>
        <p className="text-muted-foreground font-semibold">GHS {product.price.toFixed(2)}</p>
      </div>
    </div>
  );
};


export default function StorePage({ params }: { params: { storeId: string } }) {
  const [storeId, setStoreId] = useState<string | null>(null);
  const [storeName, setStoreName] = useState<string | null>(null);
  const [storeOwnerId, setStoreOwnerId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const identifiedStoreId = getStoreIdentifier(params.storeId);
    setStoreId(identifiedStoreId);
  }, [params.storeId]);


  useEffect(() => {
    if (!storeId) return;

    const fetchStoreData = async () => {
      setLoading(true);
      try {
        // In a real app, you'd fetch store details from a 'stores' collection
        // For now, we derive what we can and query products by a user ID
        // which we will get from the first product we find.
        
        const productsQuery = query(collection(db, 'products'), where('storeId', '==', storeId));
        const productsSnapshot = await getDocs(productsQuery);
        
        if (productsSnapshot.empty) {
          // A better approach would be to have a 'users' collection keyed by storeId
          // to find the user and then their products.
          // For now, we'll try to find any user that might match this storeId as a business name
          // This is a fallback and not ideal for production.
          const usersQuery = query(collection(db, 'users'), where('businessName', '==', storeId));
          const usersSnapshot = await getDocs(usersQuery);

          if (!usersSnapshot.empty) {
            const storeUser = usersSnapshot.docs[0];
            setStoreName(storeUser.data().businessName);
            setStoreOwnerId(storeUser.id);
            
            const userProductsQuery = query(collection(db, 'products'), where('userId', '==', storeUser.id));
            const userProductsSnapshot = await getDocs(userProductsQuery);
            const productsData = userProductsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
            setProducts(productsData);
          } else {
             setStoreName(storeId); // Fallback to storeId as name if no user found
          }
        } else {
          const productsData = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
          setProducts(productsData);
          if (productsData.length > 0) {
            // Assume all products in this query belong to the same user/store
            setStoreOwnerId(productsData[0].userId);
            setStoreName(storeId); // You'd fetch this from a 'stores' collection ideally
          }
        }
      } catch (error) {
        console.error("Error fetching store data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStoreData();
  }, [storeId]);
  
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading store...</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <header className="relative bg-white p-6 rounded-lg shadow-sm mb-8">
            <div className="absolute -top-5 -right-5">
                <div className="w-16 h-16 bg-pink-400 rounded-full flex items-center justify-center shadow-lg">
                    <Clock className="w-8 h-8 text-white" />
                </div>
            </div>
          <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Welcome to {storeName ? `'${storeName}'` : 'the store'}!</h1>
                <p className="text-muted-foreground">The best place to find your favorite kicks.</p>
              </div>
          </div>
        </header>

        <main>
          {products.length > 0 ? (
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-foreground">Our Products</h2>
                <Link href="#" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                  View All <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} storeId={storeId} />
                ))}
              </div>
            </section>
          ) : (
             <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm py-20">
              <div className="flex flex-col items-center gap-1 text-center">
                <h3 className="text-2xl font-bold tracking-tight">
                  No products yet
                </h3>
                <p className="text-sm text-muted-foreground">
                  The owner hasn't added any products to this store.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

    