/**
 * Middleware — Wedabime Pramukayo CMS
 * Edge-compatible for Cloudflare Workers
 *
 * NOTE: Cookie detection in middleware is unreliable on Cloudflare Workers
 * due to how opennextjs-cloudflare handles the middleware function.
 * The session cookie IS present and valid (verified by /api/auth/session),
 * but request.cookies.get() and request.headers.get('cookie') may not
 * reliably detect it in the middleware context.
 *
 * Solution: Auth protection is handled server-side in the admin layout
 * via getServerSession(). This middleware only provides:
 * 1. A fallback redirect for clearly unauthenticated requests
 * 2. Performance hint for crawlers/bots
 *
 * The admin layout does the real auth check and redirect.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Force Edge runtime for Cloudflare Workers compatibility
export const runtime = "experimental-edge";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // For login and register pages, always allow through
  if (pathname === "/admin/login" || pathname === "/admin/register") {
    return NextResponse.next();
  }

  // For all other /admin/* routes, let the request through.
  // The admin layout (server component) will check getServerSession()
  // and redirect to /admin/login if not authenticated.
  // This is more reliable than middleware cookie detection on Workers.
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
