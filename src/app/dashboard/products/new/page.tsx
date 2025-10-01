
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, UploadCloud, X } from 'lucide-react';
import { generateDescription } from '@/ai/flows/generate-description-flow';
import Image from 'next/image';

export default function NewProductPage() {
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productImages, setProductImages] = useState<File[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

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

  const handleAddProduct = () => {
    // This is where you would typically save the product and upload images.
    console.log('New Product:', { 
      name: productName, 
      price: productPrice, 
      description: productDescription,
      images: productImages.map(f => f.name) 
    });
    toast({
      title: 'Product Added (Mock)',
      description: `The product "${productName}" has been added.`,
    });
    // Here you would likely redirect or clear the form.
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add a New Product</CardTitle>
        <CardDescription>Fill out the details below to add a new product to your store.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
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
            <Label htmlFor="product-description">Product Description</Label>
            <Textarea
              id="product-description"
              placeholder="A few words about your product..."
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              className="min-h-[120px]"
            />
            <Button variant="outline" size="sm" onClick={handleGenerateDescription} disabled={isGenerating}>
              <Sparkles className="mr-2 h-4 w-4" />
              {isGenerating ? 'Generating...' : 'Generate with AI'}
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-price">Price</Label>
            <Input 
              id="product-price" 
              placeholder="e.g., 250.00" 
              type="number"
              value={productPrice}
              onChange={(e) => setProductPrice(e.target.value)}
            />
          </div>

          <Button onClick={handleAddProduct} size="lg">Add Product</Button>
        </div>
      </CardContent>
    </Card>
  );
}
