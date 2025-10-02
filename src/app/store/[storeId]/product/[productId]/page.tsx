'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { doc, getDoc, collection, query, where, getDocs, limit, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Star, ChevronRight, ShoppingCart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/app/store/[storeId]/page';


const RelatedProductCard = ({ product, storeId }: { product: Product; storeId: string; }) => (
    <Link href={`/store/${storeId}/product/${product.id}`} className="block group">
        <Card className="overflow-hidden">
            <div className="relative aspect-square">
                 <Image
                    src={product.images && product.images.length > 0 ? product.images[0] : `https://picsum.photos/seed/${product.id}/400/400`}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                />
            </div>
            <CardContent className="p-3">
                 <h3 className="text-sm font-medium truncate">{product.name}</h3>
                <p className="text-md font-semibold">GHS {product.price.toFixed(2)}</p>
            </CardContent>
        </Card>
    </Link>
)


export default function ProductDetailPage() {
  const params = useParams();
  const { storeId, productId } = params;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    if (!productId || !storeId) return;

    const fetchProductData = async () => {
      setLoading(true);
      try {
        // Fetch main product
        const productRef = doc(db, 'products', productId as string);
        const productSnap = await getDoc(productRef);

        if (productSnap.exists()) {
          const productData = { id: productSnap.id, ...productSnap.data() } as Product;
          setProduct(productData);
          if (productData.images && productData.images.length > 0) {
            setSelectedImage(productData.images[0]);
          }

          // Fetch related products from the same store (and user)
          if (productData.userId) {
              const q = query(
                  collection(db, 'products'),
                  where('userId', '==', productData.userId),
                  where('__name__', '!=', productId), // Exclude the current product
                  limit(4)
              );
              const relatedSnap = await getDocs(q);
              const relatedData = relatedSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
              setRelatedProducts(relatedData);
          }

        } else {
          console.log('No such product!');
        }
      } catch (error) {
        console.error("Error fetching product data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [productId, storeId]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading product...</div>;
  }

  if (!product) {
    return <div className="flex h-screen items-center justify-center">Product not found.</div>;
  }
  
  const handleAddToCart = () => {
    addToCart({ ...product, quantity: 1 });
    toast({
      title: 'Added to Cart!',
      description: `${product.name} is now in your cart.`,
    });
  };

  return (
    <div className="bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div>
            <div className="aspect-square bg-card rounded-lg overflow-hidden mb-4 relative">
              {selectedImage ? (
                <Image
                  src={selectedImage}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                 <div className="bg-gray-200 h-full w-full flex items-center justify-center">
                    <span className="text-muted-foreground">No Image</span>
                 </div>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {product.images?.map((img: string, index: number) => (
                <button
                  key={index}
                  className={`aspect-square rounded-md overflow-hidden relative border-2 ${selectedImage === img ? 'border-primary' : 'border-transparent'}`}
                  onClick={() => setSelectedImage(img)}
                >
                  <Image
                    src={img}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="py-4">
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-2">{product.name}</h1>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => <Star key={i} className={`h-5 w-5 ${i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />)}
              </div>
              <span className="text-sm text-muted-foreground">(123 reviews)</span>
            </div>
            <p className="text-4xl font-bold mb-6">GHS {product.price.toFixed(2)}</p>

            <div className="space-y-4 mb-6">
              <p className="text-muted-foreground">{product.description}</p>
            </div>
            
            <Button size="lg" className="w-full mb-4" onClick={handleAddToCart}>
                <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
            </Button>

            <Card>
                <CardContent className="p-4 space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                       <Badge variant="secondary">Category</Badge>
                       <span className="text-muted-foreground">{product.category || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <Badge variant="secondary">Stock</Badge>
                       <span className="text-green-600 font-medium">In Stock</span>
                    </div>
                </CardContent>
            </Card>
          </div>
        </div>

        <Separator className="my-12" />

        {/* Reviews Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
           <Card>
                <CardContent className="p-6 space-y-6">
                    <div className="flex gap-4">
                        <div className="flex-shrink-0">
                            <Image src="https://picsum.photos/seed/avatar1/40/40" alt="Avatar" width={40} height={40} className="rounded-full" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold">Jane Doe</h4>
                                <span className="text-xs text-muted-foreground">2 weeks ago</span>
                            </div>
                            <div className="flex items-center mb-2">
                                {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />)}
                            </div>
                            <p className="text-muted-foreground text-sm">Absolutely love these! So comfortable and they look great with everything.</p>
                        </div>
                    </div>
                     <Separator />
                     <div className="flex gap-4">
                        <div className="flex-shrink-0">
                            <Image src="https://picsum.photos/seed/avatar2/40/40" alt="Avatar" width={40} height={40} className="rounded-full" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold">John Smith</h4>
                                <span className="text-xs text-muted-foreground">1 month ago</span>
                            </div>
                            <div className="flex items-center mb-2">
                                {[...Array(4)].map((_, i) => <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />)}
                                <Star className="h-4 w-4 text-gray-300" />
                            </div>
                            <p className="text-muted-foreground text-sm">Great shoes, very stylish. A little bit stiff at first but they break in nicely.</p>
                        </div>
                    </div>
                </CardContent>
           </Card>
        </div>
        
        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-4">
                 <h2 className="text-2xl font-bold">Related Products</h2>
                 <Link href={`/store/${storeId}`} className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                    View All <ChevronRight className="h-4 w-4" />
                 </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
                 {relatedProducts.map(p => (
                    <RelatedProductCard key={p.id} product={p} storeId={storeId as string} />
                 ))}
              </div>
            </div>
        )}
      </div>
    </div>
  );
}
