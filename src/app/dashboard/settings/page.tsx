
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UploadCloud, Instagram, Facebook, Twitter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [banner, setBanner] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState('#e11d48');
  const [accentColor, setAccentColor] = useState('#f4f4f5');
  const { toast } = useToast();

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
  
  const handleSaveChanges = () => {
    toast({
        title: "Settings Saved (Mock)",
        description: "Your store settings have been saved successfully.",
    });
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
                    <span>{logo ? 'Change Logo' : 'Upload Logo'}</span>
                </Button>
                 <Input id="logo-upload" type="file" className="sr-only" accept="image/*" onChange={(e) => handleFileChange(e, setLogo, setLogoPreview)} />
              </Label>
            </div>
             <p className="text-xs text-muted-foreground">Recommended size: 200x200px</p>
          </div>

          <div className="space-y-2">
            <Label>Cover Banner</Label>
             <div className="border-2 border-dashed border-gray-300 rounded-md aspect-[16/5] flex items-center justify-center relative overflow-hidden">
                 {bannerPreview ? (
                     <Image src={bannerPreview} alt="Banner preview" layout="fill" className="object-cover" />
                 ) : (
                    <div className='text-center p-4'>
                        <UploadCloud className="h-8 w-8 mx-auto text-gray-400" />
                        <span className="text-sm text-muted-foreground">Upload Banner</span>
                    </div>
                 )}
                 <Label htmlFor="banner-upload" className="absolute inset-0 cursor-pointer" />
                 <Input id="banner-upload" type="file" className="sr-only" accept="image/*" onChange={(e) => handleFileChange(e, setBanner, setBannerPreview)} />
            </div>
             <p className="text-xs text-muted-foreground">Recommended size: 1600x400px</p>
          </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                <Label htmlFor="primary-color">Primary Color</Label>
                <div className="flex items-center gap-2">
                    <Input 
                        id="primary-color" 
                        type="color" 
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-12 h-10 p-1"
                    />
                    <Input 
                        type="text"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        placeholder="#e11d48"
                    />
                </div>
              </div>
               <div className="space-y-2">
                <Label htmlFor="accent-color">Accent Color</Label>
                 <div className="flex items-center gap-2">
                    <Input 
                        id="accent-color" 
                        type="color" 
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="w-12 h-10 p-1"
                    />
                     <Input 
                        type="text"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
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
                  <Input id="twitter" placeholder="https://twitter.com/your-profile" className="pl-10" />
              </div>
               <div className="relative">
                  <Label htmlFor="facebook" className="sr-only">Facebook</Label>
                  <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input id="facebook" placeholder="https://facebook.com/your-profile" className="pl-10" />
              </div>
               <div className="relative">
                  <Label htmlFor="instagram" className="sr-only">Instagram</Label>
                  <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input id="instagram" placeholder="https://instagram.com/your-profile" className="pl-10" />
              </div>
          </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button size="lg" onClick={handleSaveChanges}>Save Changes</Button>
      </div>
    </div>
  );
}
