
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

  // Prevent rewrite loops for paths that are already rewritten.
  if (url.pathname.startsWith('/store/')) {
    return NextResponse.next();
  }

  const PROD_DOMAIN = process.env.PROD_DOMAIN || 'shadaai.com';
  const DEV_DOMAIN = 'localhost:9002';

  let storeId;

  if (hostname) {
    if (hostname.endsWith(PROD_DOMAIN)) {
        const parts = hostname.split('.');
        if (parts.length > 2 && parts[0] !== 'www') {
            storeId = parts[0];
        }
    } else if (hostname.endsWith(DEV_DOMAIN)) {
        const parts = hostname.split('.');
        // This logic is for local testing like `store.localhost:9002`
        // It won't work for `store.shadaai.localhost` without hosts file modification
        if (parts.length > 1 && parts[0] !== 'www' && parts[0] !== 'localhost') {
            storeId = parts[0];
        }
    }
  }

  // If a storeId was found via subdomain, rewrite the path to the store page.
  if (storeId) {
    const newPath = `/store/${storeId}${url.pathname === '/' ? '' : url.pathname}`;
    console.log(`Rewriting subdomain to ${newPath} for host ${hostname}`);
    return NextResponse.rewrite(new URL(newPath, req.url));
  }
  
  // No rewrite is needed for the main marketing site or other paths.
  return NextResponse.next();
}
