
'use client';

import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, Plus } from 'lucide-react';
import Link from 'next/link';
import { getStoreIdentifier } from '@/lib/store';
import { useEffect, useState } from 'react';

type Product = {
  id: string;
  name: string;
  price: string;
  image: string;
  imageHint: string;
  badge?: string;
};

const categories = PlaceHolderImages.filter(img => ["new-kicks", "nike", "adidas", "clearance", "vintage-picks"].includes(img.id));

const featuredProducts: Product[] = [
  { id: 'product-1', name: 'Nike Green', price: 'GHS 300.00', image: PlaceHolderImages.find(img => img.id === 'product-1')?.imageUrl!, imageHint: 'green sneakers', badge: '20% OFF' },
  { id: 'product-2', name: 'RS-X Reinvent', price: 'GHS 300.00', image: PlaceHolderImages.find(img => img.id === 'product-2')?.imageUrl!, imageHint: 'running shoes' },
  { id: 'product-3', name: 'Nike Air Max 270', price: 'GHS 300.00', image: PlaceHolderImages.find(img => img.id === 'product-3')?.imageUrl!, imageHint: 'white sneakers' },
  { id: 'product-4', name: 'Nike Air Max 1 "Orange"', price: 'GHS 450.00', image: PlaceHolderImages.find(img => img.id === 'product-4')?.imageUrl!, imageHint: 'orange sneakers' },
];

const allProducts: Product[] = [
  { id: 'product-5', name: 'Nike Dunk Low "Black/Volt"', price: 'GHS 300.00', image: PlaceHolderImages.find(img => img.id === 'product-5')?.imageUrl!, imageHint: 'yellow sneakers' },
  { id: 'product-6', name: 'Nike Airforce 1', price: 'GHS 470.00', image: PlaceHolderImages.find(img => img.id === 'product-6')?.imageUrl!, imageHint: 'white airforce' },
  { id: 'product-7', name: 'Nike Dunk Low "Blue"', price: 'GHS 350.00', image: PlaceHolderImages.find(img => img.id === 'product-7')?.imageUrl!, imageHint: 'blue sneakers', badge: '3 OPTIONS' },
  { id: 'product-8', name: 'Nike Air Force 1 Low', price: 'GHS 300.00', image: PlaceHolderImages.find(img => img.id === 'product-8')?.imageUrl!, imageHint: 'colorful sneakers' },
];

const bottomCategories = PlaceHolderImages.filter(img => ["category-1", "category-2", "category-3", "category-4"].includes(img.id));


const ProductCard = ({ product }: { product: Product }) => (
  <div className="bg-card rounded-lg shadow-sm overflow-hidden group">
    <div className="relative">
      <Image
        src={product.image}
        alt={product.name}
        width={400}
        height={400}
        className="object-cover w-full aspect-square"
        data-ai-hint={product.imageHint}
      />
      {product.badge && (
        <Badge
          className="absolute top-2 left-2 bg-destructive text-destructive-foreground"
          variant={product.badge.includes('OPTIONS') ? 'secondary' : 'destructive'}
        >
          {product.badge}
        </Badge>
      )}
      <Button size="icon" className="absolute bottom-2 right-2 rounded-full h-8 w-8 bg-white text-gray-900 hover:bg-gray-200">
        <Plus className="h-4 w-4" />
      </Button>
    </div>
    <div className="p-4">
      <h3 className="text-sm font-medium text-foreground">{product.name}</h3>
      <p className="text-muted-foreground font-semibold">{product.price}</p>
    </div>
  </div>
);


export default function StorePage({ params }: { params: { storeId: string } }) {
  const [storeId, setStoreId] = useState<string | null>(null);

  useEffect(() => {
    setStoreId(getStoreIdentifier(params.storeId));
  }, [params.storeId]);

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
                <h1 className="text-2xl font-bold">Welcome to {storeId ? `'${storeId}'` : 'the store'}!</h1>
                <p className="text-muted-foreground">The best place to find your favorite kicks.</p>
              </div>
          </div>
        </header>

        <main>
          <div className="flex items-center justify-center space-x-8 mb-8">
            {categories.map((cat) => (
              <div key={cat.id} className="flex flex-col items-center gap-2">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-transparent hover:border-primary transition">
                  <Image
                    src={cat.imageUrl}
                    alt={cat.description}
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                    data-ai-hint={cat.imageHint}
                  />
                </div>
                <span className="text-sm font-medium text-muted-foreground">{cat.description}</span>
              </div>
            ))}
          </div>

          <section className="mb-12">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-foreground">Featured Products</h2>
              <Link href="#" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                All Products <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>

          <section className="mb-12">
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {allProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>

          <section>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-foreground">Categories</h2>
                 <div className="flex items-center gap-2">
                    <Button size="icon" variant="outline" className="rounded-full"><ArrowRight className="h-4 w-4 transform rotate-180" /></Button>
                    <Button size="icon" variant="outline" className="rounded-full"><ArrowRight className="h-4 w-4" /></Button>
                 </div>
            </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {bottomCategories.map(cat => (
                    <div key={cat.id} className="relative rounded-lg overflow-hidden h-40">
                        <Image src={cat.imageUrl} alt={cat.description} fill style={{objectFit: 'cover'}} data-ai-hint={cat.imageHint} />
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                            <h3 className="text-white font-bold text-lg">{cat.description}</h3>
                        </div>
                    </div>
                ))}
             </div>
          </section>
        </main>
      </div>
    </div>
  );
}
