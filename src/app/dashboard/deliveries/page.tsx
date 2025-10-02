
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, onSnapshot, doc, deleteDoc, DocumentData } from 'firebase/firestore';
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

interface DeliveryOption extends DocumentData {
    id: string;
    label: string;
    fee: number;
}

export default function DeliveriesPage() {
    const [label, setLabel] = useState('');
    const [fee, setFee] = useState('');
    const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        };

        const q = query(collection(db, 'users', user.uid, 'deliveries'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const optionsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DeliveryOption));
            setDeliveryOptions(optionsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching delivery options:", error);
            toast({ title: "Error fetching delivery options", variant: "destructive" });
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, toast]);

    const handleAddOption = async () => {
        if (!label.trim() || !fee) {
            toast({ title: "Label and fee cannot be empty", variant: "destructive" });
            return;
        }
        if (!user) {
            toast({ title: "You must be logged in", variant: "destructive" });
            return;
        }

        setIsSaving(true);
        try {
            await addDoc(collection(db, 'users', user.uid, 'deliveries'), {
                label: label,
                fee: parseFloat(fee),
                createdAt: new Date(),
            });
            toast({ title: "Delivery Option Added!", description: `"${label}" has been added.` });
            setLabel('');
            setFee('');
        } catch (error) {
            console.error("Error adding option:", error);
            toast({ title: "Failed to add option", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleDeleteOption = async (optionId: string) => {
        if (!user) return;
        try {
            await deleteDoc(doc(db, 'users', user.uid, 'deliveries', optionId));
            toast({ title: "Delivery Option Deleted" });
        } catch (error) {
            console.error("Error deleting option:", error);
            toast({ title: "Failed to delete option", variant: "destructive" });
        }
    };

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Add Delivery Option</CardTitle>
                    <CardDescription>Create a new delivery fee for a location.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="delivery-label">Location Label</Label>
                            <Input
                                id="delivery-label"
                                value={label}
                                onChange={(e) => setLabel(e.target.value)}
                                placeholder="e.g., Within Accra, Same-day"
                                disabled={isSaving}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="delivery-fee">Fee (GHS)</Label>
                            <Input
                                id="delivery-fee"
                                type="number"
                                value={fee}
                                onChange={(e) => setFee(e.target.value)}
                                placeholder="e.g., 20.00"
                                disabled={isSaving}
                            />
                        </div>
                        <Button onClick={handleAddOption} disabled={isSaving || authLoading}>
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                            {isSaving ? 'Adding...' : 'Add Option'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Your Delivery Options</CardTitle>
                    <CardDescription>Here is a list of all your delivery fees.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading || authLoading ? (
                        <p>Loading options...</p>
                    ) : deliveryOptions.length > 0 ? (
                        <ul className="space-y-2">
                            {deliveryOptions.map(option => (
                                <li key={option.id} className="flex items-center justify-between p-2 bg-gray-100 rounded-md">
                                    <div>
                                        <span className="font-medium">{option.label}</span>
                                        <span className="text-muted-foreground ml-2">GHS {option.fee.toFixed(2)}</span>
                                    </div>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently delete this delivery option.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteOption(option.id)}>
                                                    Yes, delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-muted-foreground text-center py-4">You haven't created any delivery options yet.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

    