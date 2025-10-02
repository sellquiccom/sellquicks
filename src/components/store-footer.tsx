
'use client';

import Link from 'next/link';
import { Instagram, Facebook, Twitter } from 'lucide-react';
import { DocumentData } from 'firebase/firestore';

const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.04-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
);


interface StoreData extends DocumentData {
    businessName?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
    tiktok?: string;
}

interface StoreFooterProps {
    storeData: StoreData | null;
}

export function StoreFooter({ storeData }: StoreFooterProps) {
    if (!storeData) {
        return null;
    }

    const year = new Date().getFullYear();
    const businessName = storeData?.businessName || 'Your Store';

    return (
        <footer className="bg-white border-t mt-auto">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 md:flex md:items-center md:justify-between">
                <div className="flex justify-center space-x-6 md:order-2">
                    {storeData.instagram && (
                        <Link href={`https://instagram.com/${storeData.instagram}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-500">
                            <span className="sr-only">Instagram</span>
                            <Instagram className="h-6 w-6" />
                        </Link>
                    )}
                    {storeData.facebook && (
                        <Link href={storeData.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-500">
                            <span className="sr-only">Facebook</span>
                            <Facebook className="h-6 w-6" />
                        </Link>
                    )}
                    {storeData.twitter && (
                         <Link href={`https://twitter.com/${storeData.twitter}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-500">
                            <span className="sr-only">Twitter</span>
                            <Twitter className="h-6 w-6" />
                        </Link>
                    )}
                     {storeData.tiktok && (
                         <Link href={`https://tiktok.com/@${storeData.tiktok}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-500">
                            <span className="sr-only">TikTok</span>
                            <TikTokIcon className="h-6 w-6" />
                        </Link>
                    )}
                </div>
                <div className="mt-8 md:mt-0 md:order-1">
                    <p className="text-center text-base text-gray-400">
                        &copy; {year} {businessName}. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
