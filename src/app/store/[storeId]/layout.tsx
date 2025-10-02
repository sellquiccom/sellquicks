
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { collection, query, where, getDocs, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { StoreHeader } from '@/components/store-header';
import { StoreFooter } from '@/components/store-footer';
import Link from 'next/link';
import { FaWhatsapp } from 'react-icons/fa';


interface StoreData extends DocumentData {
    businessName?: string;
    tagline?: string;
    bannerUrl?: string;
    logoUrl?: string;
    uid?: string;
    primaryColor?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    momoNumber?: string;
}

const WhatsAppButton = ({ phoneNumber, color }: { phoneNumber: string; color?: string; }) => {
  // Basic formatting: remove leading '0', assume Ghana country code '233' if not present
  let formattedNumber = phoneNumber.replace(/\s+/g, '');
  if (formattedNumber.startsWith('0')) {
    formattedNumber = '233' + formattedNumber.substring(1);
  } else if (!formattedNumber.startsWith('233')) {
    // Add more country code logic here if needed
  }
  
  const whatsappUrl = `https://wa.me/${formattedNumber}`;

  return (
    <Link
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 p-3 bg-green-500 rounded-full shadow-lg hover:bg-green-600 transition-transform hover:scale-110"
      style={{ backgroundColor: color || '#25D366' }}
      aria-label="Chat on WhatsApp"
    >
      <FaWhatsapp className="h-8 w-8 text-white" />
    </Link>
  );
};


export default function StoreLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const storeId = params.storeId as string;
  const [storeData, setStoreData] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!storeId) return;

    const fetchStoreData = async () => {
      setLoading(true);
      try {
        const usersQuery = query(collection(db, 'users'), where('storeId', '==', storeId));
        const usersSnapshot = await getDocs(usersQuery);

        if (!usersSnapshot.empty) {
          const storeUserDoc = usersSnapshot.docs[0];
          const userData = storeUserDoc.data() as StoreData;
          userData.uid = storeUserDoc.id;
          setStoreData(userData);
        } else {
          setStoreData(null);
        }
      } catch (error) {
        console.error("Error fetching store data for layout: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStoreData();
  }, [storeId]);
  
  const primaryColor = storeData?.primaryColor;

  return (
    <div className="flex flex-col min-h-screen" style={primaryColor ? { '--primary-dynamic': primaryColor } as React.CSSProperties : {}}>
        <StoreHeader storeData={storeData} />
        <main className="flex-grow">
            {children}
        </main>
        {storeData?.momoNumber && (
          <WhatsAppButton phoneNumber={storeData.momoNumber} color={primaryColor} />
        )}
        <StoreFooter storeData={storeData} />
    </div>
  );
}
