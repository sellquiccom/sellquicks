
'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { MountainIcon, ArrowRight, Monitor, Smartphone, RefreshCw, Blend, ToyBrick, Bot, Sparkles, Package, ShoppingCart, BarChart2, DollarSign, Users, MoreHorizontal, CircleUser, Bell, Search, Home as HomeIcon, Package2, CreditCard, Activity, ArrowUp, ArrowDown, X, Info, Ship, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { CountryFlag } from '@/components/country-flag';
import { PlaceHolderImages } from '@/lib/placeholder-images';

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

const faqs = [
    {
        question: "What is SellQuic?",
        answer: "SellQuic is a comprehensive ecommerce platform that allows anyone to set up an online store and sell their products. We provide the tools you need to create a beautiful, functional storefront, manage your inventory, and process payments, all without needing any coding skills."
    },
    {
        question: "Is SellQuic free to use?",
        answer: "Yes, SellQuic offers a robust free plan that includes all the essential features you need to start selling online. As your business grows, you can upgrade to one of our premium plans for advanced features like lower transaction fees, enhanced analytics, and more."
    },
    {
        question: "What kind of products can I sell?",
        answer: "You can sell a wide variety of products on SellQuic, from physical goods like clothing and electronics to digital products like ebooks and software. Our platform is flexible and designed to support diverse business needs."
    },
    {
        question: "How do I get paid?",
        answer: "SellQuic integrates with popular payment gateways to ensure you get your money securely and on time. You can connect your bank account or mobile money account and receive payouts directly. We support various local and international payment methods to cater to your customers."
    },
     {
        question: "Can I use my own domain name?",
        answer: "Absolutely! While we provide a free `sellquic.com` subdomain to get you started, you can easily connect your own custom domain name to your store for a more professional, branded look. This feature is available on all our paid plans."
    }
];

const countries = [
  { code: 'DE', name: 'Germany', currency: 'EUR', price: '89.99€', cta: 'Jetzt Kaufen' },
  { code: 'IT', name: 'Italy', currency: 'EUR', price: '95,50 €', cta: 'Acquista ora' },
  { code: 'JP', name: 'Japan', currency: 'JPY', price: '19,600¥', cta: '今すぐ購入' },
  { code: 'MX', name: 'Mexico', currency: 'MXN', price: '$1,950', cta: 'Comprar ahora' },
  { code: 'ES', name: 'Spain', currency: 'EUR', price: '89,99 €', cta: 'Comprar ahora' },
];

const InternationalSection = () => {
    const [activeCountry, setActiveCountry] = useState(countries[2]);

    return (
        <section className="w-full bg-white text-gray-900 py-24 sm:py-32">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Sell anywhere</h2>
                    <p className="mt-4 text-gray-600 md:text-xl">
                        Reach customers around the world with localized shopping experiences and seamless international shipping.
                    </p>
                </div>
                <div 
                    className="relative flex flex-col min-h-[580px] md:min-h-[480px] bg-gray-100 rounded-2xl border border-gray-200 p-8 md:flex-row md:items-center md:justify-center"
                >
                    <div className="w-full flex-wrap justify-center items-center gap-3 mb-8 flex md:absolute md:left-8 md:top-1/2 md:-translate-y-1/2 md:flex-col md:w-auto md:mb-0">
                        {countries.map(country => (
                            <button key={country.code} onClick={() => setActiveCountry(country)} className="group">
                                <CountryFlag 
                                    countryCode={country.code} 
                                    isActive={activeCountry.code === country.code}
                                />
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full h-[300px] flex-1 md:w-[500px]">
                        {countries.map((country, index) => (
                            <div
                                key={country.code}
                                className="absolute inset-0 transition-all duration-500 ease-in-out"
                                style={{
                                    transform: `
                                        rotate(${index * 5 - (countries.indexOf(activeCountry) * 5)}deg) 
                                        translateX(${index * 20 - (countries.indexOf(activeCountry) * 20)}px)
                                        translateZ(-${Math.abs(index - countries.indexOf(activeCountry)) * 50}px)
                                    `,
                                    opacity: country.code === activeCountry.code ? 1 : 0.5,
                                    zIndex: countries.length - Math.abs(index - countries.indexOf(activeCountry)),
                                }}
                            >
                                <div className={cn("w-[280px] mx-auto bg-white/90 backdrop-blur-sm text-black rounded-xl shadow-2xl p-4 transition-transform duration-500", country.code === activeCountry.code && "scale-105")}>
                                    <div className="relative aspect-[3/4] rounded-lg overflow-hidden mb-3">
                                        <Image src="https://picsum.photos/seed/fashion-woman/300/400" alt="Model" fill className="object-cover" data-ai-hint="fashion woman" />
                                    </div>
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-2 bg-gray-200 rounded-full pl-1 pr-3 py-1 text-sm">
                                            <CountryFlag countryCode={country.code} className="w-5 h-5 shadow-sm" />
                                            <span>Order for {country.price}</span>
                                        </div>
                                    </div>
                                    <Button className="w-full bg-gray-800 hover:bg-gray-700">{country.cta}</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="absolute right-[-60px] top-1/2 -translate-y-1/2 w-[380px] bg-white text-black rounded-lg shadow-2xl p-4 hidden lg:block animate-slide-up">
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="font-semibold">Buy 11 shipping labels</h4>
                            <X className="h-4 w-4 text-gray-500 cursor-pointer" />
                        </div>
                        <div className="space-y-2 text-sm border-b pb-3 mb-3">
                           <div className="flex justify-between items-center">
                                <span className="flex items-center gap-2"><Ship className="h-4 w-4 text-blue-500" /> 3 x USPS Ground Advantage</span>
                                <span>$60.17 USD</span>
                           </div>
                           <div className="flex justify-between items-center">
                                <span className="flex items-center gap-2"><Ship className="h-4 w-4 text-yellow-600" /> 4 x UPS® Ground Saver</span>
                                <span>$118.09 USD</span>
                           </div>
                           <div className="flex justify-between items-center">
                                <span className="flex items-center gap-2"><Ship className="h-4 w-4 text-red-500" /> 4 x DHL Express Worldwide</span>
                                <span>$691.76 USD</span>
                           </div>
                        </div>
                         <div className="space-y-1 text-sm text-gray-600">
                             <div className="flex justify-between"><span>Subtotal</span><span>$870.02 USD</span></div>
                             <div className="flex justify-between text-green-600"><span>SellQuic Plan Discount</span><span>-$101.49 USD</span></div>
                             <div className="flex justify-between"><span>Insurance</span><span>Included</span></div>
                         </div>
                         <div className="flex justify-between items-center font-bold text-lg border-t pt-2 mt-2">
                             <span>Total <Info className="h-3 w-3 inline text-gray-400"/></span>
                             <span>$768.53 USD</span>
                         </div>
                         <div className="flex justify-between items-center mt-4">
                            <Button variant="ghost">Cancel</Button>
                            <Button>Buy 11 shipping labels</Button>
                         </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const TakeOrdersSection = () => {
    const featuredProducts = PlaceHolderImages.filter(img => ["product-1", "product-2", "product-3", "product-4"].includes(img.id));
    const categories = PlaceHolderImages.filter(img => ["new-kicks", "nike", "adidas", "clearance", "vintage-picks"].includes(img.id));
    
    return (
        <section className="w-full py-12 md:py-24 lg:py-32 bg-accent">
            <div className="container px-4 md:px-6">
                <div className="grid gap-10 lg:grid-cols-1 lg:gap-20 items-center justify-center">
                    <div className="space-y-6 text-center">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-accent-foreground">Take Orders Anytime, Anywhere</h2>
                        <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed mx-auto">
                            Share your store link on social media and take orders 24/7—even while you sleep. Run sales with discounts and coupons, and let customers check out directly.
                        </p>
                        <Button size="lg" asChild>
                            <Link href="/signup">
                                Get Started <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
};


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

        <InternationalSection />
        
        <TakeOrdersSection />

        <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-24">
              <div className="flex flex-col justify-center space-y-8">
                <div className="space-y-4">
                  <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl">Customize to make it your own</h2>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Our intuitive platform gives you complete control over your store's design and functionality.
                  </p>
                </div>
                <ul className="grid gap-6">
                  <li>
                    <div className="grid gap-1">
                      <div className="flex items-center gap-2">
                        <ArrowRight className="h-5 w-5 text-primary" />
                        <h3 className="text-xl font-bold">Intuitive drag and drop</h3>
                      </div>
                      <p className="text-muted-foreground">
                        Effortlessly add and arrange your text, visuals, buttons and even entire sections.
                      </p>
                    </div>
                  </li>
                  <li>
                    <div className="grid gap-1">
                       <div className="flex items-center gap-2">
                        <ArrowRight className="h-5 w-5 text-primary" />
                        <h3 className="text-xl font-bold">Built-in AI tools</h3>
                       </div>
                       <p className="text-muted-foreground">
                        Generate product descriptions, suggest designs, and optimize your store with AI.
                      </p>
                    </div>
                  </li>
                  <li>
                    <div className="grid gap-1">
                       <div className="flex items-center gap-2">
                        <ArrowRight className="h-5 w-5 text-primary" />
                        <h3 className="text-xl font-bold">Advanced design features</h3>
                       </div>
                       <p className="text-muted-foreground">
                        Fine-tune every detail with custom fonts, colors, and layouts.
                       </p>
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

        <section className="w-full md:h-screen flex items-center bg-white py-12 md:py-0">
          <div className="container px-4 md:px-6">
            <div style={{backgroundColor: '#5921c8'}} className="text-white rounded-2xl shadow-lg overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b border-white/20">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="text-sm text-gray-300">
                  <Search className="inline-block mr-2 h-4 w-4" />
                  Search
                </div>
                <div>
                  <Bell className="h-5 w-5 text-gray-300"/>
                </div>
              </div>
              <div className="flex">
                <div className="w-48 p-4 border-r border-white/20 space-y-2">
                  <Button variant="ghost" className="w-full justify-start text-white bg-white/20"><HomeIcon className="mr-2 h-4 w-4" /> Home</Button>
                  <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10"><ShoppingCart className="mr-2 h-4 w-4" /> Orders</Button>
                  <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10"><Package className="mr-2 h-4 w-4" /> Products</Button>
                  <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10"><Users className="mr-2 h-4 w-4" /> Customers</Button>
                  <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10"><BarChart2 className="mr-2 h-4 w-4" /> Analytics</Button>
                </div>
                <div className="flex-1 p-6 bg-white/10">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white/10 p-4 rounded-lg border border-white/20">
                      <p className="text-sm text-gray-300">Online store sessions</p>
                      <p className="text-2xl font-bold">1,853 <span className="text-sm font-normal text-green-400 flex items-center gap-1"><ArrowUp className="h-3 w-3"/>+1%</span></p>
                    </div>
                     <div className="bg-white/10 p-4 rounded-lg border border-white/20">
                      <p className="text-sm text-gray-300">Total sales</p>
                      <p className="text-2xl font-bold">$2,521.50 <span className="text-sm font-normal text-red-400 flex items-center gap-1"><ArrowDown className="h-3 w-3"/>-2%</span></p>
                    </div>
                     <div className="bg-white/10 p-4 rounded-lg border border-white/20">
                      <p className="text-sm text-gray-300">Total orders</p>
                      <p className="text-2xl font-bold">56 <span className="text-sm font-normal text-green-400 flex items-center gap-1"><ArrowUp className="h-3 w-3"/>+10%</span></p>
                    </div>
                  </div>
                  <div className="w-full h-40 bg-white/10 rounded-lg relative border border-white/20">
                    <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                      <path d="M 0 50 C 50 20, 100 80, 150 50 S 250 20, 300 50" stroke="#38bdf8" fill="none" strokeWidth="2" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
            <div className="container px-4 md:px-6">
                <div className="mx-auto max-w-3xl text-center">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                        Frequently asked questions
                    </h2>
                    <p className="mt-4 text-muted-foreground md:text-xl/relaxed">
                        Have a different question? <Link href="#" className="font-medium text-primary underline-offset-4 hover:underline">Contact us</Link>.
                    </p>
                </div>
                <div className="mx-auto max-w-4xl mt-12">
                    <Accordion type="single" collapsible className="w-full">
                        {faqs.map((faq, index) => (
                             <AccordionItem value={`item-${index + 1}`} key={index}>
                                <AccordionTrigger className="text-lg font-medium text-left hover:no-underline">{faq.question}</AccordionTrigger>
                                <AccordionContent className="text-base text-muted-foreground">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
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
