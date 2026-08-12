/**
 * Middleware — Wedabime Pramukayo CMS
 * Edge-compatible for Cloudflare Workers
 *
 * Checks for auth cookies to determine if user is logged in.
 * Multiple detection methods for maximum reliability:
 * 1. Custom auth flag cookie (wpm_auth) — non-HttpOnly, set by custom login
 * 2. NextAuth session token cookie — HttpOnly, set by both NextAuth and custom login
 *
 * Real auth verification (JWT decryption + role check) happens
 * server-side in the admin layout via getServerSession().
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Force Edge runtime for Cloudflare Workers compatibility
export const runtime = "experimental-edge";

/**
 * Check if the user has any auth cookie set.
 * Checks both the custom auth flag and the NextAuth session token.
 * Uses the raw Cookie header for maximum compatibility on Workers.
 */
function hasAuthCookie(request: NextRequest): boolean {
  // Try Next.js cookie API first — check custom auth flag
  const authFlag =
    request.cookies.get("wpm_auth")?.value ||
    request.cookies.get("__Secure-wpm_auth")?.value;

  if (authFlag) return true;

  // Check NextAuth session token cookie (set by both NextAuth and custom login)
  const sessionToken =
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value;

  if (sessionToken) return true;

  // Fallback: check raw Cookie header (most reliable on Workers)
  const rawCookie = request.headers.get("cookie") || "";
  return (
    rawCookie.includes("wpm_auth=") ||
    rawCookie.includes("__Secure-wpm_auth=") ||
    rawCookie.includes("next-auth.session-token=") ||
    rawCookie.includes("__Secure-next-auth.session-token=")
  );
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
