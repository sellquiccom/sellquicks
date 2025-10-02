
import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    '/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)',
  ],
};

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host');

  // Define your production domain. This should be customized for your app.
  const PROD_DOMAIN = process.env.PROD_DOMAIN || 'sellquic.com';

  let storeId;

  // Check for subdomain in production
  if (hostname) {
    if (process.env.NODE_ENV === 'production' && hostname.endsWith(PROD_DOMAIN)) {
        const parts = hostname.split('.');
        // Handle root domain (e.g., sellquic.com) and subdomains (e.g., store1.sellquic.com)
        if (parts.length > 2 && parts[0] !== 'www') {
            storeId = parts[0];
        }
    }
  }

  // If a storeId was found via subdomain and we are on the root path, rewrite to the store page.
  // This makes `store1.sellquic.com` show the content of `sellquic.com/store/store1`.
  if (storeId && url.pathname === '/') {
    console.log(`Rewriting subdomain to /store/${storeId} for host ${hostname}`);
    return NextResponse.rewrite(new URL(`/store/${storeId}`, req.url));
  }
  
  // No rewrite is needed for other paths or in development,
  // as Next.js handles the /store/[storeId] route directly.
  return NextResponse.next();
}
