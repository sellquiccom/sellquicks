
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
import { collection, addDoc, query, where, onSnapshot, doc, deleteDoc, DocumentData } from 'firebase/firestore';
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

interface Category extends DocumentData {
    id: string;
    name: string;
}

export default function CategoriesPage() {
    const [newCategoryName, setNewCategoryName] = useState('');
    const [categories, setCategories] = useState<Category[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        };

        const q = query(collection(db, 'users', user.uid, 'categories'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const categoriesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
            setCategories(categoriesData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching categories:", error);
            toast({ title: "Error fetching categories", variant: "destructive" });
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, toast]);

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) {
            toast({ title: "Category name cannot be empty", variant: "destructive" });
            return;
        }
        if (!user) {
            toast({ title: "You must be logged in", variant: "destructive" });
            return;
        }

        setIsSaving(true);
        try {
            await addDoc(collection(db, 'users', user.uid, 'categories'), {
                name: newCategoryName,
                createdAt: new Date(),
            });
            toast({ title: "Category Added!", description: `"${newCategoryName}" has been added.` });
            setNewCategoryName('');
        } catch (error) {
            console.error("Error adding category:", error);
            toast({ title: "Failed to add category", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleDeleteCategory = async (categoryId: string) => {
        if (!user) return;
        try {
            await deleteDoc(doc(db, 'users', user.uid, 'categories', categoryId));
            toast({ title: "Category Deleted" });
        } catch (error) {
            console.error("Error deleting category:", error);
            toast({ title: "Failed to delete category", variant: "destructive" });
        }
    };

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Add New Category</CardTitle>
                    <CardDescription>Create a new category for your products.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="category-name">Category Name</Label>
                            <Input
                                id="category-name"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="e.g., Sneakers, T-Shirts"
                                disabled={isSaving}
                            />
                        </div>
                        <Button onClick={handleAddCategory} disabled={isSaving || authLoading}>
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                            {isSaving ? 'Adding...' : 'Add Category'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Your Categories</CardTitle>
                    <CardDescription>Here is a list of all your product categories.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading || authLoading ? (
                        <p>Loading categories...</p>
                    ) : categories.length > 0 ? (
                        <ul className="space-y-2">
                            {categories.map(category => (
                                <li key={category.id} className="flex items-center justify-between p-2 bg-gray-100 rounded-md">
                                    <span className="font-medium">{category.name}</span>
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
                                                    This action cannot be undone. This will permanently delete the category. Products in this category will not be deleted.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteCategory(category.id)}>
                                                    Yes, delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-muted-foreground text-center py-4">You haven't created any categories yet.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
