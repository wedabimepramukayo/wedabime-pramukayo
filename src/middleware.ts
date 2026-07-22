/**
 * Middleware — Wedabime Pramukayo CMS
 * Edge-compatible: Uses JWT decoding without Node.js-only next-auth/middleware
 * Required for Cloudflare Workers (Edge runtime)
 *
 * Protects /admin/* routes (except /admin/login)
 * Redirects unauthenticated users to login page
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Force Edge runtime for Cloudflare Workers compatibility
export const runtime = "experimental-edge";

// Simple JWT decoder — Edge-compatible (no Node.js crypto needed)
// JWT tokens from NextAuth are structured as: header.payload.signature
// We only need to read the payload (middle section) to check auth
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    // Base64url decode the payload section
    const payload = parts[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const jsonStr = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to login page without authentication
  if (pathname === "/admin/login") {
    // Check if user is already logged in
    const token = request.cookies.get("next-auth.session-token")?.value ||
                  request.cookies.get("__Secure-next-auth.session-token")?.value;

    if (token) {
      const payload = decodeJwtPayload(token);
      if (payload && (payload.role === "admin" || payload.role === "editor")) {
        // Already logged in as admin — redirect to dashboard
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }
    }
    // Not logged in or no valid admin token — allow login page
    return NextResponse.next();
  }

  // Protect all /admin/* routes — require valid JWT with admin/editor role
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("next-auth.session-token")?.value ||
                  request.cookies.get("__Secure-next-auth.session-token")?.value;

    if (!token) {
      // No token — redirect to login
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const payload = decodeJwtPayload(token);
    if (!payload) {
      // Invalid token — redirect to login
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const role = payload.role as string;
    if (role !== "admin" && role !== "editor") {
      // Not an admin/editor — redirect to login
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Valid admin user — allow access
    return NextResponse.next();
  }

  // Allow all other (public) routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
  ],
};
