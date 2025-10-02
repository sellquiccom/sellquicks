'use client';

import Link from "next/link";
import { MountainIcon, ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { usePathname } from "next/navigation";
import { DocumentData } from "firebase/firestore";

interface StoreData extends DocumentData {
    primaryColor?: string;
}

interface StoreHeaderProps {
    storeData: StoreData | null;
}

export function StoreHeader({ storeData }: StoreHeaderProps) {
    const { totalItems } = useCart();
    const pathname = usePathname();
    const primaryColor = storeData?.primaryColor;

    // Only show this header on non-dashboard pages
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/login') || pathname.startsWith('/signup')) {
        return null;
    }

    // Hide on the root landing page as well, which has its own header
    if (pathname === '/') {
        return null;
    }
    
    return (
        <header className="sticky top-0 z-50 bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex-shrink-0">
                        <Link className="flex items-center justify-center" href="/">
                            <MountainIcon className="h-6 w-6" />
                            <span className="sr-only">Storefront</span>
                        </Link>
                    </div>
                    <div className="flex items-center">
                        <Link href="/cart" className="relative p-2 rounded-full text-gray-600 hover:bg-gray-100">
                            <ShoppingCart className="h-6 w-6" />
                            <span className="sr-only">Shopping Cart</span>
                            {totalItems > 0 && (
                                <span 
                                    className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground"
                                    style={primaryColor ? { backgroundColor: primaryColor } : {}}
                                >
                                    {totalItems}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}
