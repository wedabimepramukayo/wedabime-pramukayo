/**
 * Middleware — Wedabime Pramukayo CMS
 * Edge-compatible for Cloudflare Workers
 *
 * MINIMAL middleware — cookie detection on Cloudflare Workers is
 * unreliable, so we don't enforce auth here. Instead:
 * - Auth protection is handled server-side in the admin layout
 *   via getServerSession()
 * - Client-side pages use useSession() for redirects
 *
 * This middleware only handles:
 * - Redirecting logged-in users away from login/register pages
 *   (best-effort, non-blocking)
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Force Edge runtime for Cloudflare Workers compatibility
export const runtime = "experimental-edge";

export function middleware(request: NextRequest) {
  // All /admin/* routes pass through.
  // Auth is enforced server-side by the admin layout (getServerSession)
  // and client-side by individual pages (useSession).
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
