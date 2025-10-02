
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, UploadCloud, X, Loader2 } from 'lucide-react';
import { generateDescription } from '@/ai/flows/generate-description-flow';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

interface ProductData {
    name: string;
    price: string;
    stock: string;
    description: string;
    images: string[];
    userId: string;
}

export default function EditProductPage() {
  const [product, setProduct] = useState<ProductData | null>(null);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [imagesToRemove, setImagesToRemove] = useState<string[]>([]);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const productId = params.productId as string;

  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
        try {
            const productRef = doc(db, 'products', productId);
            const docSnap = await getDoc(productRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                setProduct({
                    name: data.name || '',
                    price: data.price?.toString() || '',
                    stock: data.stock?.toString() || '0',
                    description: data.description || '',
                    images: data.images || [],
                    userId: data.userId || ''
                });
            } else {
                toast({ title: "Product not found", variant: "destructive" });
                router.push('/dashboard/products');
            }
        } catch (error) {
            console.error("Error fetching product:", error);
            toast({ title: "Error fetching product", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };
    fetchProduct();
  }, [productId, router, toast]);

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!product) return;
    setProduct({ ...product, [e.target.id]: e.target.value });
  };

  const handleGenerateDescription = async () => {
    if (!product || !product.name) {
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
        name: product.name,
        price: product.price,
        stock: product.stock,
      });
      setProduct({ ...product, description: result.description });
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
    if (e.target.files && product) {
      const files = Array.from(e.target.files);
      if (files.length + product.images.length + newImages.length - imagesToRemove.length > 3) {
        toast({
          title: 'Image Limit Exceeded',
          description: 'You can upload a maximum of 3 images per product.',
          variant: 'destructive',
        });
        return;
      }
      setNewImages((prevImages) => [...prevImages, ...files]);
    }
  };

  const removeExistingImage = (imageUrl: string) => {
    if (!product) return;
    setProduct({ ...product, images: product.images.filter(url => url !== imageUrl) });
    setImagesToRemove(prev => [...prev, imageUrl]);
  };

  const removeNewImage = (index: number) => {
    setNewImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };
  
  const uploadImage = async (file: File, path: string): Promise<string> => {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  };
  
  const deleteImage = async (imageUrl: string) => {
    // Only try to delete from storage if it's a firebase storage URL
    if (!imageUrl.includes('firebasestorage.googleapis.com')) {
        return; 
    }
    try {
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);
    } catch (error: any) {
        // Ignore "object-not-found" errors, which can happen if the file was already deleted
        if (error.code !== 'storage/object-not-found') {
            console.error("Error deleting image from storage:", error);
            throw error; // Re-throw other errors
        }
    }
  };


  const handleUpdateProduct = async () => {
    if (authLoading || !user || !product || product.userId !== user.uid) {
      toast({ title: 'Unauthorized', description: 'You do not have permission to edit this product.', variant: 'destructive' });
      return;
    }
    if (!product.name || !product.price) {
      toast({ title: 'Missing Information', description: 'Please fill out the product name and price.', variant: 'destructive'});
      return;
    }

    setIsSaving(true);
    try {
      // 1. Delete images marked for removal
      await Promise.all(imagesToRemove.map(url => deleteImage(url)));
      
      // 2. Upload new images
      const newImageUrls = await Promise.all(
        newImages.map((file, index) =>
          uploadImage(file, `products/${user.uid}/${productId}_${Date.now()}_${index}_${file.name}`)
        )
      );

      // 3. Update Firestore document
      const productRef = doc(db, 'products', productId);
      await updateDoc(productRef, {
        name: product.name,
        price: parseFloat(product.price),
        stock: parseInt(product.stock, 10) || 0,
        description: product.description,
        images: [...product.images, ...newImageUrls],
        updatedAt: new Date(),
      });

      toast({
        title: 'Product Updated!',
        description: `The product "${product.name}" has been successfully updated.`,
      });
      router.push('/dashboard/products');
    } catch (error) {
      console.error('Error updating product: ', error);
      toast({
        title: 'Update Failed',
        description: 'There was an error updating your product. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading || authLoading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!product) {
    return <div className="flex h-full items-center justify-center">Product not found.</div>;
  }

  // Fallback for image display if product.images is undefined
  const displayImages = product.images || [];
  const totalImageCount = displayImages.length + newImages.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Product</CardTitle>
        <CardDescription>Update the details for your product below.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input 
                id="name" 
                value={product.name}
                onChange={handleFieldChange}
                disabled={isSaving}
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="price">Price (GHS)</Label>
              <Input 
                id="price" 
                type="number"
                value={product.price}
                onChange={handleFieldChange}
                disabled={isSaving}
              />
            </div>
          </div>
           <div className="space-y-2">
              <Label htmlFor="stock">Stock Quantity</Label>
              <Input 
                id="stock" 
                type="number"
                value={product.stock}
                onChange={handleFieldChange}
                disabled={isSaving}
              />
            </div>

          <div className="space-y-2">
            <Label>Product Images</Label>
            <div className="grid grid-cols-3 gap-4">
              {displayImages.map((url) => (
                <div key={url} className="relative group aspect-square">
                  <Image src={url} alt="Product image" fill className="object-cover rounded-md" />
                  <button 
                    onClick={() => removeExistingImage(url)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    disabled={isSaving}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
               {newImages.map((file, index) => (
                <div key={index} className="relative group aspect-square">
                  <Image src={URL.createObjectURL(file)} alt={`New image ${index + 1}`} fill className="object-cover rounded-md" />
                  <button onClick={() => removeNewImage(index)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity" disabled={isSaving}>
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {totalImageCount < 3 && (
                <div className="border-2 border-dashed border-gray-300 rounded-md aspect-square flex items-center justify-center">
                   <Label htmlFor="image-upload" className="cursor-pointer text-center p-4">
                    <UploadCloud className="h-8 w-8 mx-auto text-gray-400" />
                    <span className="text-sm text-muted-foreground">Upload Image</span>
                   </Label>
                   <Input id="image-upload" type="file" className="sr-only" accept="image/*" multiple onChange={handleImageChange} disabled={isSaving}/>
                </div>
              )}
            </div>
             <p className="text-xs text-muted-foreground">You can upload up to 3 images.</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="description">Product Description</Label>
              <Button variant="outline" size="sm" onClick={handleGenerateDescription} disabled={isGenerating || isSaving}>
                <Sparkles className="mr-2 h-4 w-4" />
                {isGenerating ? 'Generating...' : 'Generate with AI'}
              </Button>
            </div>
            <Textarea
              id="description"
              value={product.description}
              onChange={handleFieldChange}
              className="min-h-[120px]"
              disabled={isSaving}
            />
          </div>

          <Button onClick={handleUpdateProduct} size="lg" disabled={isSaving || authLoading}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSaving ? 'Saving Changes...' : 'Save Changes'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

    