/**
 * Middleware — Wedabime Pramukayo CMS
 *
 * DISABLED: Cookie detection in middleware is unreliable on Cloudflare Workers
 * with opennextjs-cloudflare. The middleware function runs in a different
 * context and cannot reliably read session cookies.
 *
 * Auth protection is handled server-side:
 * - Admin layout checks getServerSession() and renders appropriately
 * - Individual admin pages do client-side useSession() checks
 * - API routes validate auth independently
 *
 * This middleware is intentionally a no-op.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  return NextResponse.next();
}

// Empty matcher — middleware does nothing
// This ensures no routes are intercepted
export const config = {
  matcher: [],
};
