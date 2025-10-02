
'use client';

import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, DocumentData, Timestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format, formatDistanceToNow, addYears } from 'date-fns';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { MoreHorizontal, Trash2, Ban, CheckCircle, Star } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface Vendor extends DocumentData {
  uid: string;
  businessName: string;
  email: string;
  storeId: string;
  createdAt: Timestamp;
  status?: 'active' | 'suspended';
  subscription?: {
      planId: 'free' | 'pro';
  }
}

const getInitials = (name: string) => {
    return name?.charAt(0).toUpperCase() || 'V';
};

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const fetchedVendors = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as Vendor));
      fetchedVendors.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
      setVendors(fetchedVendors);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (vendorId: string, newStatus: 'active' | 'suspended') => {
    const vendorRef = doc(db, 'users', vendorId);
    try {
        await updateDoc(vendorRef, { status: newStatus });
        toast({
            title: `Vendor ${newStatus === 'active' ? 'Activated' : 'Suspended'}`,
            description: `The vendor has been successfully ${newStatus}.`,
        });
    } catch (error) {
        console.error("Error updating vendor status:", error);
        toast({ title: "Update Failed", variant: "destructive" });
    }
  };

  const handleDeleteVendor = async (vendorId: string) => {
    const vendorRef = doc(db, 'users', vendorId);
    try {
        await deleteDoc(vendorRef);
        toast({
            title: "Vendor Deleted",
            description: "The vendor has been permanently removed.",
        });
    } catch (error) {
        console.error("Error deleting vendor:", error);
        toast({ title: "Delete Failed", variant: "destructive" });
    }
  };
  
  const handlePlanChange = async (vendorId: string, planId: 'free' | 'pro') => {
    const vendorRef = doc(db, 'users', vendorId);
    try {
        let subscriptionData;
        if (planId === 'pro') {
            subscriptionData = {
                planId: 'pro',
                status: 'active',
                startDate: new Date(),
                endDate: addYears(new Date(), 1),
            };
        } else {
             subscriptionData = {
                planId: 'free',
                status: 'active',
                startDate: new Date(),
                endDate: null,
            };
        }

        await updateDoc(vendorRef, { subscription: subscriptionData });
        toast({
            title: `Plan Changed to ${planId.toUpperCase()}`,
            description: `The vendor has been moved to the ${planId} plan.`,
        });
    } catch (error) {
        console.error("Error changing plan:", error);
        toast({ title: "Plan Change Failed", variant: "destructive" });
    }
  };


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
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
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
                <TableCell>
                     <Badge variant={vendor.subscription?.planId === 'pro' ? 'default' : 'secondary'} className="capitalize">
                       {vendor.subscription?.planId || 'free'}
                    </Badge>
                </TableCell>
                <TableCell>
                    <Badge variant={vendor.status === 'suspended' ? 'destructive' : 'default'} className="capitalize">
                        {vendor.status || 'active'}
                    </Badge>
                </TableCell>
                <TableCell>{vendor.createdAt ? formatDistanceToNow(vendor.createdAt.toDate(), { addSuffix: true }) : 'N/A'}</TableCell>
                <TableCell className="text-right">
                    <AlertDialog>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                 <Link href={`/store/${vendor.storeId}`} target="_blank">View Store</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                             {vendor.subscription?.planId !== 'pro' ? (
                                <DropdownMenuItem onClick={() => handlePlanChange(vendor.uid, 'pro')}>
                                    <Star className="mr-2 h-4 w-4" /> Upgrade to Pro
                                </DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem onClick={() => handlePlanChange(vendor.uid, 'free')}>
                                    <Star className="mr-2 h-4 w-4" /> Downgrade to Free
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {vendor.status !== 'suspended' ? (
                                <DropdownMenuItem onClick={() => handleStatusChange(vendor.uid, 'suspended')}>
                                    <Ban className="mr-2 h-4 w-4" /> Suspend
                                </DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem onClick={() => handleStatusChange(vendor.uid, 'active')}>
                                    <CheckCircle className="mr-2 h-4 w-4" /> Activate
                                </DropdownMenuItem>
                            )}
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                        </DropdownMenuContent>
                      </DropdownMenu>
                       <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the vendor and all their associated data from the platform.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteVendor(vendor.uid)}>
                                    Yes, Delete Vendor
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
            {vendors.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
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
