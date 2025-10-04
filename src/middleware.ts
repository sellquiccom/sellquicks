
import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: [
    '/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)',
  ],
};

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host');

  // Correct production domain
  const PROD_DOMAIN = 'shadaai.com';
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

  // If a storeId was found, rewrite the path to the /store/[storeId] format.
  // This handles all paths, not just the root.
  if (storeId) {
    // To prevent an infinite loop, we must check if the path is already rewritten.
    if (!url.pathname.startsWith('/store/')) {
        console.log(`Rewriting subdomain to /store/${storeId}${url.pathname} for host ${hostname}`);
        const newPath = `/store/${storeId}${url.pathname}`;
        return NextResponse.rewrite(new URL(newPath, req.url));
    }
  }

  // Default: main site or already rewritten path
  return NextResponse.next();
}
