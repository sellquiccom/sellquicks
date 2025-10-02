
'use client';

import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, DocumentData, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format, formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Vendor extends DocumentData {
  uid: string;
  businessName: string;
  email: string;
  storeId: string;
  createdAt: Timestamp;
}

const getInitials = (name: string) => {
    return name?.charAt(0).toUpperCase() || 'V';
};

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const fetchedVendors = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as Vendor));
      fetchedVendors.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
      setVendors(fetchedVendors);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <p>Loading vendors...</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Vendors</CardTitle>
        <CardDescription>A list of all sellers who have registered on the platform.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vendor</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendors.map(vendor => (
              <TableRow key={vendor.uid}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-secondary text-secondary-foreground">
                          {getInitials(vendor.businessName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className='grid gap-0.5'>
                      <p className="font-medium leading-none">{vendor.businessName}</p>
                      <p className="text-xs text-muted-foreground">Store ID: {vendor.storeId}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{vendor.email}</TableCell>
                <TableCell>{formatDistanceToNow(vendor.createdAt.toDate(), { addSuffix: true })}</TableCell>
                <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/store/${vendor.storeId}`} target="_blank">
                            View Store
                        </Link>
                    </Button>
                </TableCell>
              </TableRow>
            ))}
            {vendors.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No vendors have signed up yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

    