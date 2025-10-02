'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, Plus } from 'lucide-react';
import Link from 'next/link';
import { getStoreIdentifier } from '@/lib/store';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, getDoc, DocumentData, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/use-cart';

export interface Product extends DocumentData {
  id: string;
  name: string;
  price: number;
  images: string[];
  description: string;
  category: string;
  userId: string;
}

interface StoreData extends DocumentData {
    businessName?: string;
    bannerUrl?: string;
    logoUrl?: string;
    uid?: string;
    primaryColor?: string;
}

const ProductCard = ({ product, storeId }: { product: Product; storeId: string | null; }) => {
  const { toast } = useToast();
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent link navigation
    e.preventDefault(); // Prevent link navigation
    addToCart({ ...product, quantity: 1 });
    toast({
      title: 'Added to Cart',
      description: `"${product.name}" has been added to your cart.`,
    });
  };

  if (!storeId) return null;

  return (
    <Link href={`/store/${storeId}/product/${product.id}`} className="block">
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
          <Button size="icon" className="absolute bottom-2 right-2 rounded-full h-8 w-8 bg-[var(--primary-dynamic,hsl(var(--primary)))] text-primary-foreground hover:bg-[var(--primary-dynamic,hsl(var(--primary)))]/90" onClick={handleAddToCart}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-4">
          <h3 className="text-sm font-medium text-foreground">{product.name}</h3>
          <p className="text-muted-foreground font-semibold">GHS {product.price.toFixed(2)}</p>
        </div>
      </div>
    </Link>
  );
};


export default function StorePage({ params }: { params: { storeId: string } }) {
  const [storeId, setStoreId] = useState<string | null>(null);
  const [storeData, setStoreData] = useState<StoreData | null>(null);
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
        const usersQuery = query(collection(db, 'users'), where('storeId', '==', storeId));
        const usersSnapshot = await getDocs(usersQuery);

        if (!usersSnapshot.empty) {
          const storeUserDoc = usersSnapshot.docs[0];
          const storeUserData = storeUserDoc.data() as StoreData;
          storeUserData.uid = storeUserDoc.id;
          setStoreData(storeUserData);
          
          const userProductsQuery = query(collection(db, 'products'), where('userId', '==', storeUserDoc.id));
          const userProductsSnapshot = await getDocs(userProductsQuery);
          const productsData = userProductsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
          setProducts(productsData);

        } else {
           setStoreData({ businessName: storeId }); // Fallback to storeId as name if no user found
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
  
  const storeName = storeData?.businessName || storeId;
  const primaryColor = storeData?.primaryColor;

  return (
    <div className="bg-gray-50 min-h-screen" style={primaryColor ? { '--primary-dynamic': primaryColor } as React.CSSProperties : {}}>
       {storeData?.bannerUrl && (
        <div className="relative w-full h-48 md:h-64 lg:h-80 bg-gray-200">
            <Image
                src={storeData.bannerUrl}
                alt={`${storeName} banner`}
                layout="fill"
                className="object-cover"
                priority
            />
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <header className="relative bg-white p-6 rounded-lg shadow-sm mb-8 -mt-16 md:-mt-24 z-10">
          <div className="flex items-center gap-4">
              {storeData?.logoUrl && (
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-white shadow-md -mt-12 md:-mt-16">
                    <Image
                        src={storeData.logoUrl}
                        alt={`${storeName} logo`}
                        width={96}
                        height={96}
                        className="object-cover"
                    />
                </div>
              )}
              <div className='pt-2'>
                <h1 className="text-2xl font-bold">{storeName}</h1>
                <p className="text-muted-foreground">The best place to find your favorite kicks.</p>
              </div>
          </div>
        </header>

        <main>
          {products.length > 0 ? (
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-foreground">Our Products</h2>
                <Link href="#" className="text-sm font-medium text-[var(--primary-dynamic,hsl(var(--primary)))] hover:underline flex items-center gap-1">
                  View All <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
