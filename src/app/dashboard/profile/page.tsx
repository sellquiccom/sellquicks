'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [businessName, setBusinessName] = useState('');
  const [storeId, setStoreId] = useState('');
  const [originalStoreId, setOriginalStoreId] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setBusinessName(user.businessName || '');
      setStoreId(user.storeId || '');
      setOriginalStoreId(user.storeId || '');
    }
  }, [user]);

  const handleSaveChanges = async () => {
    if (!user) {
      toast({ title: 'Not authenticated', variant: 'destructive' });
      return;
    }

    const newStoreIdSlug = storeId.toLowerCase().replace(/\s+/g, '-');
    if (!businessName || !newStoreIdSlug) {
      toast({
        title: 'Fields cannot be empty',
        description: 'Please provide a business name and store slug.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        businessName: businessName,
        storeId: newStoreIdSlug,
      });

      toast({
        title: 'Profile Updated!',
        description: 'Your business details have been saved.',
      });
      setOriginalStoreId(newStoreIdSlug);
    } catch (error) {
      console.error('Error saving profile: ', error);
      toast({
        title: 'Save Failed',
        description: 'Could not save your profile details.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const showStoreIdWarning = storeId !== originalStoreId;

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>My Profile</CardTitle>
        <CardDescription>
          Manage your account and business details.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" type="email" value={user?.email || ''} disabled />
          <p className="text-xs text-muted-foreground">
            Email address cannot be changed.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="businessName">Business Name</Label>
          <Input
            id="businessName"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            disabled={isSaving}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="storeId">Store Slug</Label>
          <Input
            id="storeId"
            value={storeId}
            onChange={(e) => setStoreId(e.target.value)}
            disabled={isSaving}
          />
          <p className="text-xs text-muted-foreground">
            This will be part of your store's URL. Use only letters, numbers,
            and dashes.
          </p>
        </div>

        {showStoreIdWarning && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              Changing your store slug will change your store's URL. Your old
              link will no longer work.
            </AlertDescription>
          </Alert>
        )}

        <Button size="lg" onClick={handleSaveChanges} disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </CardContent>
    </Card>
  );
}
