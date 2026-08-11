/**
 * Middleware — Wedabime Pramukayo CMS
 * Edge-compatible for Cloudflare Workers
 *
 * Checks for a simple auth flag cookie (wpm_auth) to determine
 * if the user is logged in. The actual NextAuth session cookie
 * is HttpOnly and can't be reliably read in the middleware on
 * Cloudflare Workers, so we use a separate non-HttpOnly flag cookie.
 *
 * Real auth verification (JWT decryption + role check) happens
 * server-side in the admin layout via getServerSession().
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Force Edge runtime for Cloudflare Workers compatibility
export const runtime = "experimental-edge";

/**
 * Check if the auth flag cookie exists.
 * Uses the raw Cookie header for maximum compatibility on Workers.
 */
function hasAuthCookie(request: NextRequest): boolean {
  // Try Next.js cookie API first
  const viaAPI =
    request.cookies.get("wpm_auth")?.value ||
    request.cookies.get("__Secure-wpm_auth")?.value;

  if (viaAPI) return true;

  // Fallback: check raw Cookie header
  const rawCookie = request.headers.get("cookie") || "";
  return rawCookie.includes("wpm_auth=") || rawCookie.includes("__Secure-wpm_auth=");
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to login and register pages without authentication
  if (pathname === "/admin/login" || pathname === "/admin/register") {
    // If user already has auth cookie, redirect to dashboard
    if (hasAuthCookie(request)) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Protect all /admin/* routes
  if (pathname.startsWith("/admin")) {
    if (!hasAuthCookie(request)) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
