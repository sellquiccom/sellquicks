
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { app, db } from '@/lib/firebase'; 
import { useRouter } from 'next/navigation';
import { doc, getDoc, DocumentData } from 'firebase/firestore';

// Define the structure for subscription data
interface SubscriptionData {
  planId: 'free' | 'pro';
  status: 'active' | 'cancelled' | 'past_due';
  endDate: Date | null;
}

// Extend the User type to include our custom fields
interface AppUser extends User {
    businessName?: string;
    storeId?: string;
    isSuperAdmin?: boolean;
    subscription?: SubscriptionData;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);

        try {
            const userDoc = await getDoc(userDocRef);
            
            let appUser: AppUser = { ...firebaseUser, isSuperAdmin: false };

            if (userDoc.exists()) {
              const userData = userDoc.data() as DocumentData;
              appUser = {
                ...appUser,
                businessName: userData.businessName,
                storeId: userData.storeId,
                isSuperAdmin: userData.role === 'superadmin',
                subscription: userData.subscription ? {
                    planId: userData.subscription.planId || 'free',
                    status: userData.subscription.status || 'active',
                    endDate: userData.subscription.endDate?.toDate() || null,
                } : { planId: 'free', status: 'active', endDate: null },
              };
            } else {
               appUser.subscription = { planId: 'free', status: 'active', endDate: null };
            }
            
            setUser(appUser);
        } catch (error) {
            console.error("Error fetching user data:", error);
            const fallbackUser: AppUser = {
                ...firebaseUser,
                subscription: { planId: 'free', status: 'active', endDate: null },
                isSuperAdmin: false
            };
            setUser(fallbackUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export const useRequireAuth = () => {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    return { user, loading };
};

export const useRequireSuperAdmin = () => {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/login');
            } else if (!user.isSuperAdmin) {
                router.push('/dashboard');
            }
        }
    }, [user, loading, router]);

    return { user, loading };
};
