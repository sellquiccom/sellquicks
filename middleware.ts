
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

  // Define your production domain
  const PROD_DOMAIN = 'sellquic.com';

  // Extract storeId from subdomain
  let storeId;
  if (hostname) {
    if (process.env.NODE_ENV === 'production' && hostname.endsWith(PROD_DOMAIN)) {
        const parts = hostname.split('.');
        if(parts.length > 2) {
            storeId = parts[0];
        }
    }
  }


  // If we have a storeId from a subdomain, and we are not already on the /store path,
  // rewrite to the dynamic store page.
  if (storeId && url.pathname === '/') {
    console.log(`Rewriting to /store/${storeId} for host ${hostname}`);
    return NextResponse.rewrite(new URL(`/store/${storeId}`, req.url));
  }

  return NextResponse.next();
}
