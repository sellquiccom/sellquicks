
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UploadCloud, Instagram, Facebook, Twitter, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { db, storage } from '@/lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.04-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
);


interface StoreSettings {
  logoUrl?: string;
  bannerUrl?: string;
  primaryColor?: string;
  accentColor?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
}

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [settings, setSettings] = useState<StoreSettings>({
    primaryColor: '#e11d48',
    accentColor: '#f4f4f5',
    twitter: '',
    facebook: '',
    instagram: '',
    tiktok: '',
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) return;
      setIsLoading(true);
      const userDocRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSettings({
          logoUrl: data.logoUrl,
          bannerUrl: data.bannerUrl,
          primaryColor: data.primaryColor || '#e11d48',
          accentColor: data.accentColor || '#f4f4f5',
          twitter: data.twitter || '',
          facebook: data.facebook || '',
          instagram: data.instagram || '',
          tiktok: data.tiktok || '',
        });
        if (data.logoUrl) setLogoPreview(data.logoUrl);
        if (data.bannerUrl) setBannerPreview(data.bannerUrl);
      }
      setIsLoading(false);
    };

    if (!authLoading) {
      fetchSettings();
    }
  }, [user, authLoading]);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<File | null>>,
    previewSetter: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setter(file);
      previewSetter(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (file: File, path: string): Promise<string> => {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  };
  
  const handleSaveChanges = async () => {
    if (!user) {
        toast({ title: "Not authenticated", description: "You must be logged in to save settings.", variant: "destructive" });
        return;
    }
    
    setIsSaving(true);
    try {
        let { logoUrl, bannerUrl } = settings;

        if (logoFile) {
            logoUrl = await uploadImage(logoFile, `stores/${user.uid}/logo.jpg`);
        }
        if (bannerFile) {
            bannerUrl = await uploadImage(bannerFile, `stores/${user.uid}/banner.jpg`);
        }

        const settingsToSave = {
            ...settings,
            logoUrl,
            bannerUrl,
        };

        await updateDoc(doc(db, 'users', user.uid), settingsToSave);

        toast({
            title: "Settings Saved!",
            description: "Your store settings have been updated successfully.",
        });

    } catch (error) {
        console.error("Error saving settings: ", error);
        toast({
            title: "Save Failed",
            description: "Could not save your settings. Please try again.",
            variant: "destructive",
        });
    } finally {
        setIsSaving(false);
    }
  };

  const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setSettings(prev => ({ ...prev, [id]: value }));
  };

  if (isLoading || authLoading) {
    return (
        <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Store Settings</h1>
        <p className="text-sm text-muted-foreground">
          Customize the look and feel of your storefront.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Branding</CardTitle>
          <CardDescription>
            Upload your logo, banner, and set your brand colors.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Store Logo</Label>
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full border bg-gray-100 flex items-center justify-center overflow-hidden">
                {logoPreview ? (
                  <Image src={logoPreview} alt="Logo preview" width={80} height={80} className="object-cover" />
                ) : (
                  <UploadCloud className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <Label htmlFor="logo-upload" className="cursor-pointer">
                <Button asChild variant="outline">
                    <span>{logoFile ? 'Change Logo' : 'Upload Logo'}</span>
                </Button>
                 <Input id="logo-upload" type="file" className="sr-only" accept="image/*" onChange={(e) => handleFileChange(e, setLogoFile, setLogoPreview)} />
              </Label>
            </div>
             <p className="text-xs text-muted-foreground">Recommended size: 200x200px</p>
          </div>

          <div className="space-y-2">
            <Label>Cover Banner</Label>
             <div className="border-2 border-dashed border-gray-300 rounded-md aspect-[16/5] flex items-center justify-center relative overflow-hidden bg-gray-50">
                 {bannerPreview ? (
                     <Image src={bannerPreview} alt="Banner preview" layout="fill" className="object-cover" />
                 ) : (
                    <div className='text-center p-4'>
                        <UploadCloud className="h-8 w-8 mx-auto text-gray-400" />
                        <span className="text-sm text-muted-foreground">Upload Banner</span>
                    </div>
                 )}
                 <Label htmlFor="banner-upload" className="absolute inset-0 cursor-pointer" />
                 <Input id="banner-upload" type="file" className="sr-only" accept="image/*" onChange={(e) => handleFileChange(e, setBannerFile, setBannerPreview)} />
            </div>
             <p className="text-xs text-muted-foreground">Recommended size: 1600x400px</p>
          </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex items-center gap-2">
                    <Input 
                        id="primaryColor" 
                        type="color" 
                        value={settings.primaryColor}
                        onChange={handleSettingChange}
                        className="w-12 h-10 p-1"
                    />
                    <Input 
                        type="text"
                        id="primaryColor"
                        value={settings.primaryColor}
                        onChange={handleSettingChange}
                        placeholder="#e11d48"
                    />
                </div>
              </div>
               <div className="space-y-2">
                <Label htmlFor="accentColor">Accent Color</Label>
                 <div className="flex items-center gap-2">
                    <Input 
                        id="accentColor" 
                        type="color" 
                        value={settings.accentColor}
                        onChange={handleSettingChange}
                        className="w-12 h-10 p-1"
                    />
                     <Input 
                        type="text"
                        id="accentColor"
                        value={settings.accentColor}
                        onChange={handleSettingChange}
                        placeholder="#f4f4f5"
                    />
                </div>
              </div>
           </div>
        </CardContent>
      </Card>
      
      <Card>
          <CardHeader>
              <CardTitle>Social Media</CardTitle>
              <CardDescription>Add links to your social media profiles.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="relative">
                  <Label htmlFor="twitter" className="sr-only">Twitter</Label>
                  <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input id="twitter" placeholder="your-username" className="pl-10" value={settings.twitter} onChange={handleSettingChange}/>
              </div>
               <div className="relative">
                  <Label htmlFor="facebook" className="sr-only">Facebook</Label>
                  <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input id="facebook" placeholder="https://facebook.com/your-page-url" className="pl-10" value={settings.facebook} onChange={handleSettingChange}/>
              </div>
               <div className="relative">
                  <Label htmlFor="instagram" className="sr-only">Instagram</Label>
                  <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input id="instagram" placeholder="your-username" className="pl-10" value={settings.instagram} onChange={handleSettingChange}/>
              </div>
               <div className="relative">
                  <Label htmlFor="tiktok" className="sr-only">TikTok</Label>
                  <TikTokIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input id="tiktok" placeholder="your-username" className="pl-10" value={settings.tiktok} onChange={handleSettingChange}/>
              </div>
          </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button size="lg" onClick={handleSaveChanges} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
