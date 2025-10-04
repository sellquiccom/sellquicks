
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

  // Prevent rewrite loops for store pages
  if (url.pathname.startsWith('/store/')) {
    return NextResponse.next();
  }

  const PROD_DOMAIN = process.env.PROD_DOMAIN || 'shadaai.com';
  const DEV_DOMAIN = 'localhost:9002';

  let storeId: string | undefined;

  if (hostname) {
    if (process.env.NODE_ENV === 'production' && hostname.endsWith(PROD_DOMAIN)) {
      const parts = hostname.split('.');
      if (parts.length > 2 && parts[0] !== 'www') {
        storeId = parts[0];
      }
    } else if (process.env.NODE_ENV !== 'production' && hostname.endsWith(DEV_DOMAIN)) {
      const parts = hostname.split('.');
      if (parts.length > 1 && parts[0] !== 'www') {
        storeId = parts[0];
      }
    }
  }

  // If a storeId was found, validate it before rewriting.
  if (storeId) {
    // Construct the absolute URL for the API endpoint
    const validationUrl = new URL(`/api/store-exists/${storeId}`, req.url);

    try {
      const response = await fetch(validationUrl);
      const { exists } = await response.json();

      if (exists) {
        const newPath = `/store/${storeId}${url.pathname === '/' ? '' : url.pathname}`;
        console.log(`Rewriting subdomain to ${newPath} for host ${hostname}`);
        return NextResponse.rewrite(new URL(newPath, req.url));
      } else {
        // If the store does not exist, rewrite to a "not found" page.
        console.log(`Store ID "${storeId}" not found. Rewriting to /store-not-found.`);
        return NextResponse.rewrite(new URL('/store-not-found', req.url));
      }
    } catch (error) {
      console.error('Middleware API call failed:', error);
      // Fallback to not found on API error
      return NextResponse.rewrite(new URL('/store-not-found', req.url));
    }
  }
  
  // No rewrite is needed for the main marketing site or other paths.
  return NextResponse.next();
}
