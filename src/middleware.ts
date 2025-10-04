
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

  // Define your production and development domains.
  const PROD_DOMAIN = process.env.PROD_DOMAIN || 'shadaai.com';
  const DEV_DOMAIN = 'localhost:9002';

  let storeId: string | undefined;

  if (hostname) {
    if (process.env.NODE_ENV === 'production' && hostname.endsWith(PROD_DOMAIN)) {
      const parts = hostname.split('.');
      // A vendor subdomain will have 3 parts: [storeId, shadaai, com]
      if (parts.length > 2 && parts[0] !== 'www') {
        storeId = parts[0];
      }
    } else if (process.env.NODE_ENV !== 'production' && hostname.startsWith('localhost:')) {
      // In development, we can't use subdomains, so we check for /store/[storeId] in the path
      // This part is handled by Next.js routing, so the middleware can focus on subdomains.
      // We will add a special case for localhost development using a different pattern if needed.
    }
  }

  // If a storeId was found via subdomain, rewrite to the store page.
  if (storeId) {
    // Rewrite any path on the subdomain to the corresponding store path.
    // e.g., admin-store.shadaai.com/product/123 -> /store/admin-store/product/123
    const newPath = `/store/${storeId}${url.pathname}`;
    return NextResponse.rewrite(new URL(newPath, req.url));
  }
  
  // If no storeId, it's a request to the main marketing site (shadaai.com), so continue.
  return NextResponse.next();
}
