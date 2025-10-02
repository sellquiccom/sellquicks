'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { collection, query, where, getDocs, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { StoreHeader } from '@/components/store-header';

interface StoreData extends DocumentData {
    businessName?: string;
    bannerUrl?: string;
    logoUrl?: string;
    uid?: string;
    primaryColor?: string;
}

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
    <div style={primaryColor ? { '--primary-dynamic': primaryColor } as React.CSSProperties : {}}>
        <StoreHeader storeData={storeData} />
        {children}
    </div>
  );
}
