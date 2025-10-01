
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, UploadCloud, X, Loader2 } from 'lucide-react';
import { generateDescription } from '@/ai/flows/generate-description-flow';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';

export default function NewProductPage() {
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productStock, setProductStock] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productImages, setProductImages] = useState<File[]>([]);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();

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
      const result = await generateDescription(productName);
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

  const handleAddProduct = async () => {
    if (!user) {
      toast({ title: 'Authentication Error', description: 'You must be logged in to add a product.', variant: 'destructive'});
      return;
    }
    if (!productName || !productPrice) {
      toast({ title: 'Missing Information', description: 'Please fill out the product name and price.', variant: 'destructive'});
      return;
    }

    setIsSaving(true);
    try {
      // In a real app, you would upload images to a service like Firebase Storage
      // and get the URLs. For now, we'll just store the file names as placeholders.
      const imageUrls = productImages.map(file => file.name);

      await addDoc(collection(db, 'products'), {
        userId: user.uid,
        name: productName,
        price: parseFloat(productPrice),
        stock: parseInt(productStock, 10) || 0,
        description: productDescription,
        images: imageUrls,
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
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="product-name">Product Name</Label>
              <Input 
                id="product-name" 
                placeholder="e.g., Classic Leather Sneakers" 
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                disabled={isSaving}
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
                disabled={isSaving}
              />
            </div>
          </div>
           <div className="space-y-2">
              <Label htmlFor="product-stock">Stock Quantity</Label>
              <Input 
                id="product-stock" 
                placeholder="e.g., 50" 
                type="number"
                value={productStock}
                onChange={(e) => setProductStock(e.target.value)}
                disabled={isSaving}
              />
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
                    disabled={isSaving}
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
                   <Input id="image-upload" type="file" className="sr-only" accept="image/*" multiple onChange={handleImageChange} disabled={isSaving}/>
                </div>
              )}
            </div>
             <p className="text-xs text-muted-foreground">You can upload up to 3 images. The first image is the main image.</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="product-description">Product Description</Label>
              <Button variant="outline" size="sm" onClick={handleGenerateDescription} disabled={isGenerating || isSaving}>
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
              disabled={isSaving}
            />
          </div>

          <Button onClick={handleAddProduct} size="lg" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSaving ? 'Saving Product...' : 'Add Product'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
