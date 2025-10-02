
import { Button } from "@/components/ui/button";
import { MountainIcon, ArrowRight, Monitor, Smartphone, RefreshCw, Blend, ToyBrick, Bot, Sparkles, Package, ShoppingCart, BarChart2, DollarSign, Users, MoreHorizontal, CircleUser, Bell, Search, Home as HomeIcon, Package2, CreditCard, Activity, ArrowUp, ArrowDown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const Feature = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
  <div className="flex flex-col items-start gap-2">
    <div className="flex items-center gap-3">
      <Icon className="h-5 w-5 text-primary" />
      <h3 className="text-xl font-semibold text-accent-foreground">{title}</h3>
    </div>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

function ChevronDownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center fixed top-0 left-0 right-0 z-20 bg-black/50 backdrop-blur-sm text-white">
        <Link className="flex items-center justify-center" href="#">
          <MountainIcon className="h-6 w-6" />
          <span className="ml-2 text-lg font-semibold">SellQuic</span>
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
            href="/login"
          >
            Login
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="relative w-full h-screen flex items-center justify-center bg-black text-white">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            >
              <source src="https://firebasestorage.googleapis.com/v0/b/sellquic.firebasestorage.app/o/WhatsApp%20Video%202025-09-29%20at%2013.05.33_6eb32e77.mp4?alt=media&token=ed31a266-1a60-47d6-9fcf-d1be7f9d035d" type="video/mp4" />
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

        <section className="w-full py-12 md:py-24 lg:py-32 bg-accent">
          <div className="container px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-24">
              <div className="flex flex-col justify-center space-y-8">
                <div className="space-y-4">
                  <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl text-accent-foreground">Customize to make it your own</h2>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Our intuitive platform gives you complete control over your store's design and functionality.
                  </p>
                </div>
                <ul className="grid gap-6">
                  <li>
                    <div className="grid gap-1">
                      <div className="flex items-center gap-2">
                        <ArrowRight className="h-5 w-5 text-primary" />
                        <h3 className="text-xl font-bold text-accent-foreground">Intuitive drag and drop</h3>
                      </div>
                      <p className="text-muted-foreground">
                        Effortlessly add and arrange your text, visuals, buttons and even entire sections.
                      </p>
                    </div>
                  </li>
                  <li>
                    <div className="grid gap-1">
                       <h3 className="text-xl font-bold text-accent-foreground ml-7">Built-in AI tools</h3>
                    </div>
                  </li>
                  <li>
                    <div className="grid gap-1">
                       <h3 className="text-xl font-bold text-accent-foreground ml-7">Advanced design features</h3>
                    </div>
                  </li>
                </ul>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" asChild>
                    <Link href="/signup">Get Started</Link>
                  </Button>
                </div>
              </div>
              <div className="relative rounded-xl shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-100 to-orange-100 z-0"></div>
                 <Image
                    src="https://picsum.photos/seed/towel/700/600"
                    alt="Editor Mockup Background"
                    width={700}
                    height={600}
                    className="absolute top-0 right-0 w-2/3 h-full object-cover z-10"
                    data-ai-hint="colorful towel"
                  />
                <div className="relative z-20 m-4 lg:m-6 bg-white/50 backdrop-blur-sm rounded-lg border border-gray-200/50">
                    <div className="flex items-center justify-between p-2 border-b border-gray-200/50">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-600">Page: Home</span>
                            <ChevronDownIcon className="h-4 w-4 text-gray-500"/>
                        </div>
                        <div className="flex items-center gap-2">
                            <Monitor className="h-5 w-5 text-gray-600" />
                            <Smartphone className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="flex items-center gap-3">
                           <RefreshCw className="h-4 w-4 text-gray-500" />
                           <Blend className="h-4 w-4 text-gray-500" />
                           <ToyBrick className="h-4 w-4 text-gray-500" />
                           <Button size="sm" variant="ghost" className="text-xs h-7">Tools</Button>
                           <Button size="sm" className="text-xs h-7">Publish</Button>
                        </div>
                    </div>
                    <div className="bg-yellow-50 p-6 md:p-8 lg:p-12">
                      <div className="max-w-md mx-auto text-center">
                        <h3 className="text-4xl font-bold text-orange-500" style={{fontFamily: "'Fredoka One', cursive"}}>PROSUN
                          <span className="text-2xl align-super">50+</span>
                        </h3>
                        <p className="text-sm font-semibold text-orange-400 tracking-wider mb-6">PROTECT. NOURISH. SHINE.</p>
                        <div className="relative aspect-video rounded-lg overflow-hidden mb-6 shadow-lg">
                           <Image
                            src="https://picsum.photos/seed/sunscreen-girl/300/200"
                            alt="Woman with sunscreen"
                            fill
                            className="object-cover"
                            data-ai-hint="woman beach"
                          />
                        </div>
                        <div className="relative -mt-16 mr-10 self-end w-24 h-32 animate-pulse">
                           <Image
                            src="https://picsum.photos/seed/sunscreen-tube/200/300"
                            alt="Sunscreen tube"
                            fill
                            className="object-contain drop-shadow-2xl"
                            data-ai-hint="sunscreen bottle"
                          />
                        </div>
                        <p className="text-sm text-gray-600 mt-4">
                          Maximum protection for every adventure. Lightweight and non-greasy, perfect for all skin types.
                        </p>
                         <Button variant="outline" className="mt-6 bg-transparent border-orange-400 text-orange-500 hover:bg-orange-500 hover:text-white">
                           Shop Now
                         </Button>
                      </div>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-950 text-white">
          <div className="container px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-24 items-center">
              <div className="flex flex-col justify-center space-y-4 text-center lg:text-left">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Manage everything in one place</h2>
                  <p className="max-w-[600px] text-gray-400 md:text-xl/relaxed lg:mx-0">
                    From back-office to front-of-store, you're always in control with our powerful dashboard.
                  </p>
                </div>
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl shadow-inner-lg overflow-hidden">
                  <div className="flex justify-between items-center p-4 border-b border-gray-800">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="text-sm text-gray-500">
                      <Search className="inline-block mr-2 h-4 w-4" />
                      Search
                    </div>
                    <div>
                      <Bell className="h-5 w-5 text-gray-400"/>
                    </div>
                  </div>
                  <div className="flex">
                    <div className="w-48 p-4 border-r border-gray-800 space-y-2">
                      <Button variant="ghost" className="w-full justify-start text-white bg-gray-700"><HomeIcon className="mr-2 h-4 w-4" /> Home</Button>
                      <Button variant="ghost" className="w-full justify-start text-gray-400"><ShoppingCart className="mr-2 h-4 w-4" /> Orders</Button>
                      <Button variant="ghost" className="w-full justify-start text-gray-400"><Package className="mr-2 h-4 w-4" /> Products</Button>
                      <Button variant="ghost" className="w-full justify-start text-gray-400"><Users className="mr-2 h-4 w-4" /> Customers</Button>
                      <Button variant="ghost" className="w-full justify-start text-gray-400"><BarChart2 className="mr-2 h-4 w-4" /> Analytics</Button>
                    </div>
                    <div className="flex-1 p-6">
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-gray-800 p-4 rounded-lg">
                          <p className="text-sm text-gray-400">Online store sessions</p>
                          <p className="text-2xl font-bold">1,853 <span className="text-sm font-normal text-green-400 flex items-center gap-1"><ArrowUp className="h-3 w-3"/>+1%</span></p>
                        </div>
                         <div className="bg-gray-800 p-4 rounded-lg">
                          <p className="text-sm text-gray-400">Total sales</p>
                          <p className="text-2xl font-bold">$2,521.50 <span className="text-sm font-normal text-red-400 flex items-center gap-1"><ArrowDown className="h-3 w-3"/>-2%</span></p>
                        </div>
                         <div className="bg-gray-800 p-4 rounded-lg">
                          <p className="text-sm text-gray-400">Total orders</p>
                          <p className="text-2xl font-bold">56 <span className="text-sm font-normal text-green-400 flex items-center gap-1"><ArrowUp className="h-3 w-3"/>+10%</span></p>
                        </div>
                      </div>
                      <div className="w-full h-40 bg-gray-800 rounded-lg relative">
                        <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                          <path d="M 0 50 C 50 20, 100 80, 150 50 S 250 20, 300 50" stroke="#38bdf8" fill="none" strokeWidth="2" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-4 text-center lg:text-left">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Run your store from anywhere</h2>
                  <p className="max-w-[600px] text-gray-400 md:text-xl/relaxed lg:mx-0">
                    Do it all right from your pocket with the full-featured SellQuic mobile app.
                  </p>
                </div>
                 <div className="relative mx-auto border-gray-800 bg-gray-900 border-[10px] rounded-[2.5rem] h-[550px] w-[270px] shadow-xl">
                    <div className="w-[140px] h-[18px] bg-gray-900 top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute"></div>
                    <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[13px] top-[72px] rounded-l-lg"></div>
                    <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[13px] top-[124px] rounded-l-lg"></div>
                    <div className="h-[64px] w-[3px] bg-gray-800 absolute -right-[13px] top-[142px] rounded-r-lg"></div>
                    <div className="rounded-[2rem] overflow-hidden w-full h-full bg-indigo-900">
                        <div className="text-white text-center flex flex-col items-center justify-center h-full px-4 space-y-4">
                            <p className="text-sm text-indigo-300">Thursday, October 2</p>
                            <p className="text-6xl font-bold">1:25</p>
                            <div className="w-full space-y-2 pt-8">
                                <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl text-left animate-slide-up [animation-delay:0.2s] opacity-0">
                                    <p className="text-xs font-semibold">Shopify</p>
                                    <p className="text-sm">[Verve] You have a new order for 4 items totaling $205.</p>
                                    <p className="text-xs text-indigo-300 text-right">1:25 PM</p>
                                </div>
                                 <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl text-left animate-slide-up [animation-delay:0.4s] opacity-0">
                                    <p className="text-xs font-semibold">Shopify</p>
                                    <p className="text-sm">[Verve] You have a new order for 2 items totaling $190.</p>
                                    <p className="text-xs text-indigo-300 text-right">1:25 PM</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl text-left animate-slide-up [animation-delay:0.6s] opacity-0">
                                    <p className="text-xs font-semibold">Shopify</p>
                                    <p className="text-sm">[Verve] You have a new order for 1 item.</p>
                                    <p className="text-xs text-indigo-300 text-right">1:25 PM</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </section>


      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-gray-800 z-10 bg-black text-white">
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
