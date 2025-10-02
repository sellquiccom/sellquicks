
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  collection,
  query,
  onSnapshot,
  DocumentData,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Product extends DocumentData {
  id: string;
  name: string;
  price: string;
  stock: number;
  category: string;
  images: string[];
  userId: string;
  storeId: string;
  vendorName?: string; // To be populated
}

export default function AllProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [vendors, setVendors] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch all vendors to create a lookup map
    const unsubVendors = onSnapshot(collection(db, "users"), (snapshot) => {
        const vendorMap = new Map<string, string>();
        snapshot.forEach(doc => {
            vendorMap.set(doc.id, doc.data().businessName || 'Unnamed Vendor');
        });
        setVendors(vendorMap);
    });

    const q = query(collection(db, 'products'));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const productsData = querySnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Product)
        );
        setProducts(productsData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching products: ', error);
        toast({
          title: 'Error',
          description: 'Could not fetch platform products.',
          variant: 'destructive',
        });
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
      unsubVendors();
    }
  }, [toast]);
  
  const productsWithVendorNames = useMemo(() => {
    return products.map(product => ({
        ...product,
        vendorName: vendors.get(product.userId) || 'Unknown'
    }));
  }, [products, vendors]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Platform Products</CardTitle>
        <CardDescription>
          Browse all products available across all stores.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Loading products...
                </TableCell>
              </TableRow>
            ) : productsWithVendorNames.length > 0 ? (
              productsWithVendorNames.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Image
                      src={
                        product.images && product.images.length > 0
                          ? product.images[0]
                          : 'https://placehold.co/600x400'
                      }
                      alt={product.name}
                      width={40}
                      height={40}
                      className="rounded-md object-cover aspect-square"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                   <TableCell>
                     <Badge variant="secondary">{product.vendorName}</Badge>
                  </TableCell>
                  <TableCell>GHS {product.price}</TableCell>
                  <TableCell>{product.stock || 0}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/store/${product.storeId}/product/${product.id}`} target="_blank">
                        View Product
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No products have been added to the platform yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

    