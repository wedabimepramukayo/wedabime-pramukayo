/**
 * Middleware — Wedabime Pramukayo CMS
 * Edge-compatible for Cloudflare Workers
 *
 * Simple session cookie check for middleware-level protection.
 * Full authentication (token decryption + role check) is done
 * server-side in each admin page and API route via getServerSession().
 *
 * Why not decrypt JWE here?
 * - NextAuth v4 encrypts JWTs with JWE (dir + A256GCM)
 * - jose library adds significant bundle size and bundling complexity
 * - Cloudflare Workers have strict 3MiB limits
 * - The real auth check happens in API routes and server components
 *
 * This middleware provides:
 * 1. UX: Redirect unauthenticated users to login (instead of 401)
 * 2. Performance: Skip rendering admin pages for anonymous users
 * 3. Security: First line of defense (real auth is server-side)
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Force Edge runtime for Cloudflare Workers compatibility
export const runtime = "experimental-edge";

/**
 * Check if a NextAuth session cookie exists.
 * We check both the standard and __Secure- prefixed variants.
 * The __Secure- prefix is used when the site is served over HTTPS.
 */
function hasSessionCookie(request: NextRequest): boolean {
  return !!(
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value
  );
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
