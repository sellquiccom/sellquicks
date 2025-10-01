
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Sparkles } from 'lucide-react';
import { generateDescription } from '@/ai/flows/generate-description-flow';

export default function NewProductPage() {
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productDescription, setProductDescription] = useState('');
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

  const handleAddProduct = () => {
    // This is where you would typically save the product to a database.
    // For now, we'll just log it to the console.
    console.log('New Product:', { name: productName, price: productPrice, description: productDescription });
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
        <div className="space-y-4">
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

          <Button onClick={handleAddProduct}>Add Product</Button>
        </div>
      </CardContent>
    </Card>
  );
}
