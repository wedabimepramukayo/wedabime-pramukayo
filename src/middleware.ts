/**
 * Middleware — Wedabime Pramukayo CMS
 * Edge-compatible for Cloudflare Workers
 *
 * Simple session cookie check for middleware-level protection.
 * Full authentication (token decryption + role check) is done
 * server-side in each admin page and API route via getServerSession().
 *
 * This middleware provides:
 * 1. UX: Redirect unauthenticated users to login (instead of 401)
 * 2. Performance: Skip rendering admin pages for anonymous users
 * 3. Security: First line of defense (real auth is server-side)
 *
 * Cookie detection uses THREE methods (ordered by reliability):
 * 1. request.cookies.get() — Next.js cookie API
 * 2. Raw Cookie header parsing — fallback for Workers edge runtime
 * 3. request.headers.get('cookie') string search — last resort
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Force Edge runtime for Cloudflare Workers compatibility
export const runtime = "experimental-edge";

/**
 * Check if a NextAuth session cookie exists.
 * Uses multiple detection methods for Cloudflare Workers compatibility.
 */
function hasSessionCookie(request: NextRequest): boolean {
  // Method 1: Next.js cookie API
  const cookieViaAPI =
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value;

  if (cookieViaAPI) return true;

  // Method 2: Parse raw Cookie header (most reliable on Workers)
  const rawCookieHeader = request.headers.get("cookie") || "";

  if (!rawCookieHeader) return false;

  // Check if any session token cookie exists in the raw header
  // Match both standard and __Secure- prefixed cookie names
  const hasToken =
    rawCookieHeader.includes("next-auth.session-token=") ||
    rawCookieHeader.includes("__Secure-next-auth.session-token=");

  return hasToken;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to login and register pages without authentication
  if (pathname === "/admin/login" || pathname === "/admin/register") {
    // If user already has a session cookie, redirect to dashboard
    if (hasSessionCookie(request)) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Protect all /admin/* routes
  if (pathname.startsWith("/admin")) {
    // Check if session cookie exists
    if (!hasSessionCookie(request)) {
      // No session cookie — redirect to login
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Session cookie exists — allow through
    // Full auth verification happens server-side in pages/API routes
    return NextResponse.next();
  }

  // Allow all other (public) routes
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
