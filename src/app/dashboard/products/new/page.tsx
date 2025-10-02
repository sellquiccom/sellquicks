
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, UploadCloud, X, Loader2, AlertCircle, Star } from 'lucide-react';
import { generateDescription } from '@/ai/flows/generate-description-flow';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { addDoc, collection, query, onSnapshot, DocumentData, getDocs, where } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Category extends DocumentData {
  id: string;
  name: string;
}

export default function NewProductPage() {
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productStock, setProductStock] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productImages, setProductImages] = useState<File[]>([]);
  const [sellingStatus, setSellingStatus] = useState('none');
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [productCount, setProductCount] = useState(0);

  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const isFreePlan = user?.subscription?.planId === 'free';
  const productLimit = 10;
  const limitReached = isFreePlan && productCount >= productLimit;

  useEffect(() => {
    if (!user) return;

    // Fetch categories
    const catQuery = query(collection(db, 'users', user.uid, 'categories'));
    const unsubCategories = onSnapshot(catQuery, (querySnapshot) => {
        const categoriesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
        setCategories(categoriesData);
    });
    
    // Fetch product count
    const prodQuery = query(collection(db, 'products'), where('userId', '==', user.uid));
    const unsubProducts = onSnapshot(prodQuery, (snapshot) => {
        setProductCount(snapshot.size);
    });

    return () => {
      unsubCategories();
      unsubProducts();
    };
  }, [user]);

  const handleGenerateDescription = async () => {
    if (!productName) {
      toast({
        title: 'Product Name Required',
        description: 'Please enter a product name to generate a description.',
        variant: 'destructive',
      });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generateDescription({
        name: productName,
        price: productPrice,
        stock: productStock,
      });
      setProductDescription(result.description);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Generation Failed',
        description: 'Could not generate a description at this time.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (files.length + productImages.length > 3) {
        toast({
          title: 'Image Limit Exceeded',
          description: 'You can upload a maximum of 3 images per product.',
          variant: 'destructive',
        });
        return;
      }
      setProductImages((prevImages) => [...prevImages, ...files]);
    }
  };

  const removeImage = (index: number) => {
    setProductImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const uploadImage = async (file: File, path: string): Promise<string> => {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  };

  const handleAddProduct = async () => {
    if (authLoading || limitReached) {
      return;
    }
    if (!user) {
      toast({ title: 'Authentication Error', description: 'You must be logged in to add a product.', variant: 'destructive'});
      return;
    }
    if (!productName || !productPrice || !user.storeId) {
      toast({ title: 'Missing Information', description: 'Please fill out the product name and price.', variant: 'destructive'});
      return;
    }

    setIsSaving(true);
    try {
      const imageUrls = await Promise.all(
        productImages.map((file, index) => 
          uploadImage(file, `products/${user.uid}/${Date.now()}_${index}_${file.name}`)
        )
      );

      await addDoc(collection(db, 'products'), {
        userId: user.uid,
        storeId: user.storeId,
        name: productName,
        price: parseFloat(productPrice),
        stock: parseInt(productStock, 10) || 0,
        category: productCategory,
        description: productDescription,
        images: imageUrls,
        sellingStatus: sellingStatus,
        createdAt: new Date(),
      });

      toast({
        title: 'Product Added!',
        description: `The product "${productName}" has been successfully added to your store.`,
      });
      router.push('/dashboard/products');
    } catch (error) {
      console.error('Error adding product: ', error);
      toast({
        title: 'Save Failed',
        description: 'There was an error saving your product. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add a New Product</CardTitle>
        <CardDescription>Fill out the details below to add a new product to your store.</CardDescription>
      </CardHeader>
      <CardContent>
         {limitReached ? (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>You've reached your product limit!</AlertTitle>
            <AlertDescription>
              As a free user, you can add up to {productLimit} products. To add more, please upgrade to our Pro plan.
            </AlertDescription>
             <div className="mt-4">
                <Button asChild>
                    <Link href="/dashboard/subscription">
                        <Star className="mr-2 h-4 w-4" />
                        Upgrade to Pro
                    </Link>
                </Button>
            </div>
          </Alert>
        ) : isFreePlan && (
           <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>You are on the Free Plan</AlertTitle>
            <AlertDescription>
              You have added {productCount} of {productLimit} products.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          <fieldset disabled={isSaving || limitReached} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="product-name">Product Name</Label>
                <Input 
                  id="product-name" 
                  placeholder="e.g., Classic Leather Sneakers" 
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-price">Price (GHS)</Label>
                <Input 
                  id="product-price" 
                  placeholder="e.g., 250.00" 
                  type="number"
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="product-stock">Stock Quantity</Label>
                <Input 
                  id="product-stock" 
                  placeholder="e.g., 50" 
                  type="number"
                  value={productStock}
                  onChange={(e) => setProductStock(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-category">Category</Label>
                <Select value={productCategory} onValueChange={setProductCategory}>
                    <SelectTrigger id="product-category">
                        <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="selling-status">Selling Status</Label>
              <Select value={sellingStatus} onValueChange={setSellingStatus}>
                  <SelectTrigger id="selling-status">
                      <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="best-seller">Best Seller</SelectItem>
                      <SelectItem value="new-arrival">New Arrival</SelectItem>
                  </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Product Images</Label>
              <div className="grid grid-cols-3 gap-4">
                {productImages.map((file, index) => (
                  <div key={index} className="relative group aspect-square">
                    <Image
                      src={URL.createObjectURL(file)}
                      alt={`Product image ${index + 1}`}
                      fill
                      className="object-cover rounded-md"
                    />
                    <button 
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    {index === 0 && (
                      <div className="absolute bottom-0 w-full text-center bg-black bg-opacity-50 text-white text-xs py-0.5 rounded-b-md">Main</div>
                    )}
                  </div>
                ))}
                {productImages.length < 3 && (
                  <div className="border-2 border-dashed border-gray-300 rounded-md aspect-square flex items-center justify-center">
                    <Label htmlFor="image-upload" className="cursor-pointer text-center p-4">
                      <UploadCloud className="h-8 w-8 mx-auto text-gray-400" />
                      <span className="text-sm text-muted-foreground">Upload Image</span>
                    </Label>
                    <Input id="image-upload" type="file" className="sr-only" accept="image/*" multiple onChange={handleImageChange} />
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">You can upload up to 3 images. The first image is the main image.</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="product-description">Product Description</Label>
                <Button variant="outline" size="sm" onClick={handleGenerateDescription} disabled={isGenerating}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {isGenerating ? 'Generating...' : 'Generate with AI'}
                </Button>
              </div>
              <Textarea
                id="product-description"
                placeholder="A few words about your product..."
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
          </fieldset>

          <Button onClick={handleAddProduct} size="lg" disabled={isSaving || authLoading || limitReached}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSaving ? 'Saving Product...' : 'Add Product'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
