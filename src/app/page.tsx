
import { Button } from "@/components/ui/button";
import { MountainIcon, ShoppingCart, DollarSign, Users, CreditCard, ArrowUpRight, BarChart, Bell } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <header className="px-4 lg:px-6 h-16 flex items-center fixed top-0 left-0 right-0 z-20 bg-black/50 backdrop-blur-sm">
        <Link className="flex items-center justify-center" href="#">
          <MountainIcon className="h-6 w-6" />
          <span className="sr-only">SellQuic</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            href="#"
          >
            Features
          </Link>
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            href="#"
          >
            Pricing
          </Link>
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            href="#"
          >
            About
          </Link>
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            href="/login"
          >
            Login
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="relative w-full h-screen flex items-center justify-center">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            >
              <source src="https://videos.pexels.com/video-files/3209828/3209828-hd.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="absolute top-0 left-0 w-full h-full bg-black/60"></div>
          </div>
          <div className="relative container px-4 md:px-6 z-10">
            <div className="flex flex-col items-center space-y-6 text-center">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none">
                  Build Your Empire, Your Way
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-200 md:text-xl">
                  Our platform makes it easy to launch a beautiful, branded
                  storefront and start selling your products to the world. No limits.
                </p>
              </div>
              <div className="space-x-4">
                <Button asChild size="lg">
                  <Link href="/signup">Get Started</Link>
                </Button>
                <Button asChild variant="secondary" size="lg">
                  <Link href="#">Learn More</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Dashboard Mockup Section */}
        <section className="py-16 sm:py-24 bg-black">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
              
              {/* Left Side: Desktop Dashboard */}
              <div className="relative">
                <div className="relative bg-[#0F172A] p-2 rounded-xl shadow-2xl border border-gray-700/50">
                    <div className="bg-[#1E293B] rounded-lg overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between p-3 border-b border-gray-700">
                           <div className="flex items-center gap-2">
                                <MountainIcon className="h-5 w-5 text-gray-200" />
                                <span className="text-md font-semibold text-gray-200">SellQuic</span>
                           </div>
                           <div className="w-1/2">
                                <input type="text" placeholder="Search..." className="bg-[#0F172A] text-sm w-full rounded-md px-3 py-1.5 text-gray-300 placeholder-gray-500 border border-gray-600 focus:ring-primary focus:border-primary" />
                           </div>
                        </div>
                        {/* Main Content */}
                        <div className="p-4 md:p-6 text-white">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <Card className="bg-slate-800/50 border-slate-700">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium text-gray-300">Total Revenue</CardTitle>
                                        <DollarSign className="h-4 w-4 text-gray-400" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-white">GHS 2,521.50</div>
                                        <p className="text-xs text-green-400">+2% from last month</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-slate-800/50 border-slate-700">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium text-gray-300">Total Orders</CardTitle>
                                        <ShoppingCart className="h-4 w-4 text-gray-400" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-white">56</div>
                                        <p className="text-xs text-green-400">+10% from last month</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-slate-800/50 border-slate-700 col-span-2">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium text-gray-300">Online Store Sessions</CardTitle>
                                        <Users className="h-4 w-4 text-gray-400" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-white">1,853</div>
                                        <p className="text-xs text-red-400">-1% from last month</p>
                                    </CardContent>
                                </Card>
                            </div>

                             {/* Chart */}
                            <div className="h-40 relative">
                                <svg width="100%" height="100%" viewBox="0 0 400 100" preserveAspectRatio="none">
                                    <path d="M 0 60 Q 50 30, 100 50 T 200 70 T 300 40 T 400 80" stroke="#38BDF8" fill="none" strokeWidth="2" />
                                    <path d="M 0 60 Q 50 30, 100 50 T 200 70 T 300 40 T 400 80" stroke="#38BDF8" fill="url(#gradient)" strokeWidth="0" />
                                    <defs>
                                        <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                                            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.2"/>
                                            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0"/>
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
                 <div className="mt-8 text-center md:text-left">
                    <h2 className="text-3xl font-bold">Manage everything in one place</h2>
                    <p className="text-gray-400 mt-2 max-w-md mx-auto md:mx-0">From back office to front of store, you're always in control with an intuitive and powerful dashboard.</p>
                </div>
              </div>
              
              {/* Right Side: Mobile Dashboard */}
              <div className="relative flex justify-center">
                  <div className="relative w-72 h-[36rem] bg-[#1C1C1E] rounded-[40px] border-[10px] border-black shadow-2xl overflow-hidden">
                    {/* Time */}
                    <div className="absolute top-10 left-0 right-0 text-center z-10">
                        <p className="text-gray-400 text-lg">Thursday, October 2</p>
                        <p className="text-white font-bold text-7xl">1:25</p>
                    </div>
                    {/* Notifications */}
                    <div className="absolute top-40 left-3 right-3 space-y-3 animate-slide-up">
                        <div className="bg-white/20 backdrop-blur-md rounded-2xl p-3 flex items-center gap-3">
                            <div className="bg-green-500 rounded-lg p-1.5">
                                <ShoppingCart className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-300">SellQuic</p>
                                <p className="text-sm font-semibold text-white">New order for 4 items</p>
                                <p className="text-xs text-gray-400">Totaling GHS 205.00</p>
                            </div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-md rounded-2xl p-3 flex items-center gap-3">
                            <div className="bg-green-500 rounded-lg p-1.5">
                                <ShoppingCart className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-300">SellQuic</p>
                                <p className="text-sm font-semibold text-white">New order for 2 items</p>
                                <p className="text-xs text-gray-400">Totaling GHS 190.00</p>
                            </div>
                        </div>
                         <div className="bg-white/20 backdrop-blur-md rounded-2xl p-3 flex items-center gap-3">
                            <div className="bg-blue-500 rounded-lg p-1.5">
                                <Bell className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-300">SellQuic</p>
                                <p className="text-sm font-semibold text-white">50+ payments to capture</p>
                            </div>
                        </div>
                    </div>
                     {/* Background Glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-indigo-500/30 rounded-full blur-3xl"></div>
                  </div>
                   <div className="mt-8 text-center">
                    <h2 className="text-3xl font-bold">Run your store from anywhere</h2>
                    <p className="text-gray-400 mt-2 max-w-md mx-auto">Do it all right from your pocket with the full-featured SellQuic mobile experience.</p>
                </div>
              </div>

            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-gray-800 z-10">
        <p className="text-xs text-gray-400">
          © 2024 SellQuic. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}

