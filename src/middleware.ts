// middleware.ts (temporary diagnostic)
import { NextRequest, NextResponse } from "next/server";

export const config = { matcher: ["/((?!api/|_next/|_static/|_vercel).*)"] };

export default function middleware(req: NextRequest) {
  const hostRaw = req.headers.get("host") || "";
  const hostname = hostRaw.replace(/\.$/, ""); // normalize trailing dot
  const parts = hostname.split(".");
  const storeId = parts.length > 2 ? parts[0] : null;
  const url = req.nextUrl;

  // If diagnostic query param present, return JSON showing what we see
  if (url.searchParams.has("_diag")) {
    return NextResponse.json({
      ok: true,
      hostname,
      parts,
      storeId,
      pathname: url.pathname,
      env: process.env.NODE_ENV || null,
    });
  }

  // Pass all other requests through without rewriting to prevent potential loops.
  return NextResponse.next();
}
