
'use client';

import Link from 'next/link';
import {
  Bell,
  ChevronDown,
  Home,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingCart,
  Users,
  Building,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { getAuth, signOut } from 'firebase/auth';
import React from 'react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useAuth, useRequireAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

const NavLink = ({ href, children, icon: Icon, ...props }: { href: string; children: React.ReactNode; icon: React.ElementType }) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-600 transition-all hover:bg-gray-100 hover:text-gray-900",
        isActive && "bg-gray-100 text-gray-900",
      )}
      {...props}
    >
      <Icon className="h-4 w-4" />
      {children}
    </Link>
  );
};

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // We can create a useRequireSuperAdmin hook later
  useRequireAuth(); 
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut(getAuth());
      router.push('/login');
    } catch (error: any) {
      toast({
        title: 'Logout Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div>Loading Super Admin Dashboard...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Redirect is handled by useRequireAuth
  }

  const sidebarNav = (
    <div className="flex h-full max-h-screen flex-col">
      <div className="flex h-16 items-center border-b px-4 lg:h-[68px] lg:px-6">
        <span className="flex items-center gap-2 text-lg font-semibold">
            <Building className="h-6 w-6" />
            <span>Super Admin</span>
        </span>
      </div>
      <div className="flex-1 overflow-y-auto">
        <nav className="grid items-start px-2 py-4 text-sm font-medium lg:px-4">
          <p className="px-3 pb-2 text-xs text-gray-500">PLATFORM</p>
          <NavLink href="/superadmin" icon={Home}>Dashboard</NavLink>
          <NavLink href="/superadmin/vendors" icon={Users}>Vendors</NavLink>
          <NavLink href="/superadmin/orders" icon={ShoppingCart}>All Orders</NavLink>
          <NavLink href="/superadmin/products" icon={Package}>All Products</NavLink>
          <NavLink href="/superadmin/settings" icon={Settings}>Platform Settings</NavLink>
        </nav>
      </div>
      <div className="mt-auto p-4 border-t">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-900">
           <Avatar className="h-9 w-9">
             <AvatarFallback className='bg-primary text-primary-foreground'>
                {user.email ? user.email.charAt(0).toUpperCase() : 'A'}
             </AvatarFallback>
           </Avatar>
           <div className='grid gap-0.5'>
                <p className="font-medium leading-none">{user.displayName || 'Admin'}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
           </div>
           <button onClick={handleLogout} className="ml-auto flex items-center gap-2 rounded-md p-2 text-gray-600 hover:bg-gray-100">
             <LogOut className="h-4 w-4" />
           </button>
         </div>
      </div>
    </div>
  );

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-white md:block">
        {sidebarNav}
      </div>
      <div className="flex flex-col bg-gray-50">
        <header className="flex h-16 items-center gap-4 border-b bg-white px-4 lg:h-[68px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0 w-[280px]">
              {sidebarNav}
            </SheetContent>
          </Sheet>
          <div className="flex-1">
            {/* We can make this dynamic later */}
            <h1 className="text-lg font-semibold">Platform Overview</h1>
          </div>
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                    <AvatarFallback className='bg-primary text-primary-foreground'>
                        {user.email ? user.email.charAt(0).toUpperCase() : 'A'}
                    </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

    