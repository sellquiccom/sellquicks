
'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { collection, query, where, onSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/use-auth';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface Product extends DocumentData {
  id: string;
  name: string;
  price: string;
  stock: number;
  category: string;
  images: string[];
  sellingStatus: 'none' | 'best-seller' | 'new-arrival';
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'products'), where('userId', '==', user.uid));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(productsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching products: ", error);
      toast({
        title: "Error",
        description: "Could not fetch products. Please try again later.",
        variant: "destructive",
      });
      setLoading(false);
    });

    return () => unsubscribe();
    
  }, [user, toast]);

  const getStatusLabel = (status: string | undefined) => {
    switch (status) {
      case 'best-seller':
        return 'Best Seller';
      case 'new-arrival':
        return 'New Arrival';
      default:
        return 'None';
    }
  };


  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Products</CardTitle>
            <CardDescription>Manage your products and view their sales performance.</CardDescription>
          </div>
          <Button asChild>
            <Link href="/dashboard/products/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Product
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">Loading products...</TableCell>
              </TableRow>
            ) : products.length > 0 ? (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                     <Image
                        src={product.images && product.images.length > 0 ? product.images[0] : 'https://placehold.co/600x400'}
                        alt={product.name}
                        width={40}
                        height={40}
                        className="rounded-md object-cover aspect-square"
                      />
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    {product.category ? <Badge variant="secondary">{product.category}</Badge> : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.sellingStatus === 'best-seller' ? 'default' : 'outline'}>
                        {getStatusLabel(product.sellingStatus)}
                    </Badge>
                  </TableCell>
                  <TableCell>GHS {product.price}</TableCell>
                  <TableCell>{product.stock || 0}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/products/edit/${product.id}`}>Edit</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center">You haven't added any products yet.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

    