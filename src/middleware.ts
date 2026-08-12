/**
 * Middleware — Wedabime Pramukayo CMS
 *
 * DISABLED: This middleware is intentionally a no-op.
 *
 * Auth protection is handled by:
 * 1. Server-side: admin layout uses getServerSession()
 * 2. Client-side: AdminAuthGuard component uses useSession()
 *
 * Cookie detection in Cloudflare Workers middleware is unreliable,
 * so we don't use middleware for auth protection.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  return NextResponse.next();
}

// Empty matcher — middleware never runs
export const config = {
  matcher: [],
};
