
'use client';

import Link from 'next/link';
import {
  Bell,
  Book,
  ChevronDown,
  ChevronRight,
  CreditCard,
  Home,
  LineChart,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingCart,
  Truck,
  User,
  Users,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { getAuth, signOut } from 'firebase/auth';
import React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
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
import { useRequireAuth, useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

const NavLink = ({ href, children, icon: Icon, active, isSubmenu = false, ...props }: { href: string; children: React.ReactNode; icon: React.ElementType; active?: boolean; isSubmenu?: boolean }) => {
  const pathname = usePathname();
  const isActive = active !== undefined ? active : pathname === href;
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-600 transition-all hover:bg-gray-100 hover:text-gray-900",
        isActive && "bg-gray-100 text-gray-900",
        isSubmenu && "pl-11"
      )}
      {...props}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </Link>
  );
};


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useRequireAuth();
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [isBookkeepingOpen, setIsBookkeepingOpen] = React.useState(pathname.startsWith('/dashboard/bookkeeping'));
  const [isAnalyticsOpen, setIsAnalyticsOpen] = React.useState(pathname.startsWith('/dashboard/analytics'));

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
            <div>Loading...</div>
        </div>
    );
  }

  if (!user) {
    return null; // or a loading spinner, since useRequireAuth will redirect
  }

  const getInitials = (name?: string | null) => {
    if (!name) return 'S';
    return name.charAt(0).toUpperCase();
  };

  const sidebarNav = (
    <div className="flex h-full max-h-screen flex-col">
      <div className="flex h-16 items-center border-b px-4 lg:h-[68px] lg:px-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 text-lg font-semibold">
              <Avatar className="h-8 w-8">
                <AvatarFallback className='bg-primary text-primary-foreground'>{getInitials(user.businessName)}</AvatarFallback>
              </Avatar>
              <span className='hidden md:inline'>{user.businessName || 'My Store'}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className='w-56'>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex-1 overflow-y-auto">
        <nav className="grid items-start px-2 py-4 text-sm font-medium lg:px-4">
          <p className="px-3 pb-2 text-xs text-gray-500">MAIN MENU</p>
          <NavLink href="/dashboard" icon={Home}>Dashboard</NavLink>
          <NavLink href="/dashboard/products" icon={Package}>Products</NavLink>
          <NavLink href="/dashboard/orders" icon={ShoppingCart}>Orders</NavLink>
          
          <Collapsible open={isBookkeepingOpen} onOpenChange={setIsBookkeepingOpen}>
            <CollapsibleTrigger className="w-full">
              <div className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-gray-600 transition-all hover:bg-gray-100 hover:text-gray-900", isBookkeepingOpen && "bg-gray-100 text-gray-900")}>
                <Book className="h-4 w-4" />
                Bookkeeping
                <ChevronRight className={cn("ml-auto h-4 w-4 transition-transform", isBookkeepingOpen && "rotate-90")} />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="py-1">
              {/* Add bookkeeping sublinks here */}
            </CollapsibleContent>
          </Collapsible>

          <Collapsible open={isAnalyticsOpen} onOpenChange={setIsAnalyticsOpen}>
             <CollapsibleTrigger className="w-full">
                <div className={cn("flex items-center justify-between w-full gap-3 rounded-lg px-3 py-2 text-gray-600 transition-all hover:bg-gray-100 hover:text-gray-900", isAnalyticsOpen && "bg-gray-100 text-gray-900")}>
                  <div className='flex items-center gap-3'>
                    <LineChart className="h-4 w-4" />
                    Analytics
                  </div>
                  <ChevronRight className={cn("h-4 w-4 transition-transform", isAnalyticsOpen && "rotate-90")} />
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 pt-1">
              <NavLink href="/dashboard/analytics/sales" icon={LineChart} isSubmenu>Sales Analytics</NavLink>
              <NavLink href="/dashboard/analytics/product" icon={Package} isSubmenu>Product Analytics</NavLink>
              <NavLink href="/dashboard/analytics/customer" icon={Users} isSubmenu>Customer Analytics</NavLink>
            </CollapsibleContent>
          </Collapsible>
          
          <NavLink href="/dashboard/affiliates" icon={Users}>Affiliates</NavLink>
          <NavLink href="/dashboard/payments" icon={CreditCard}>Payments</NavLink>
          <NavLink href="/dashboard/deliveries" icon={Truck}>Deliveries</NavLink>
          <NavLink href="/dashboard/settings" icon={Settings}>Store Settings</NavLink>
        </nav>
      </div>
      <div className="mt-auto p-4 border-t">
         <p className="px-3 pb-2 text-xs text-gray-500">PROFILE</p>
         <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            <NavLink href="/dashboard/profile" icon={User}>My Profile</NavLink>
            <button onClick={handleLogout} className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-600 transition-all hover:bg-gray-100 hover:text-gray-900 w-full text-left">
              <LogOut className="h-4 w-4" />
              Logout
            </button>
         </nav>
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
            <h1 className="text-lg font-semibold">Sales Analytics</h1>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                Quick Actions
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Add Product</DropdownMenuItem>
              <DropdownMenuItem>Create Order</DropdownMenuItem>
              <DropdownMenuItem>View Reports</DropdownMenuItem>
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
