
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

interface PaymentSettings {
  momoNumber?: string;
  momoAccountName?: string;
}

export default function PaymentsPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [settings, setSettings] = useState<PaymentSettings>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) return;
      setIsLoading(true);
      const userDocRef = doc(db, 'users', user.uid);
      try {
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSettings({
            momoNumber: data.momoNumber || '',
            momoAccountName: data.momoAccountName || '',
          });
        }
      } catch (error) {
        console.error("Error fetching payment settings:", error);
        toast({
          title: "Error",
          description: "Could not fetch your payment settings.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      fetchSettings();
    }
  }, [user, authLoading, toast]);
  
  const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setSettings(prev => ({ ...prev, [id]: value }));
  };

  const handleSaveChanges = async () => {
    if (!user) {
        toast({ title: "Not authenticated", variant: "destructive" });
        return;
    }
    
    setIsSaving(true);
    try {
        await updateDoc(doc(db, 'users', user.uid), {
            momoNumber: settings.momoNumber,
            momoAccountName: settings.momoAccountName,
        });

        toast({
            title: "Settings Saved!",
            description: "Your payment details have been updated.",
        });

    } catch (error) {
        console.error("Error saving payment settings: ", error);
        toast({
            title: "Save Failed",
            description: "Could not save your payment settings.",
            variant: "destructive",
        });
    } finally {
        setIsSaving(false);
    }
  };

  if (isLoading || authLoading) {
    return (
        <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Payment Details</CardTitle>
        <CardDescription>
          Set up your Mobile Money (MoMo) details to receive payments from customers.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
            <Label htmlFor="momoNumber">MOMO Number</Label>
            <Input id="momoNumber" placeholder="e.g., 0241234567" value={settings.momoNumber} onChange={handleSettingChange} disabled={isSaving} />
        </div>
        <div className="space-y-2">
            <Label htmlFor="momoAccountName">Account Name</Label>
            <Input id="momoAccountName" placeholder="e.g., John Doe" value={settings.momoAccountName} onChange={handleSettingChange} disabled={isSaving}/>
        </div>
         <Button size="lg" onClick={handleSaveChanges} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSaving ? "Saving..." : "Save Payment Details"}
        </Button>
      </CardContent>
    </Card>
  );
}

    
