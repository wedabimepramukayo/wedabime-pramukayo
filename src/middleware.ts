/**
 * Middleware — Wedabime Pramukayo CMS
 * Edge-compatible: Uses jose library to decrypt NextAuth JWE tokens
 * Required for Cloudflare Workers (Edge runtime)
 *
 * NextAuth v4 encrypts JWTs using JWE (alg: dir, enc: A256GCM)
 * when a secret is provided. The simple base64 JWT decoder cannot
 * handle these encrypted tokens — we must use jose to decrypt them.
 *
 * Protects /admin/* routes (except /admin/login and /admin/register)
 * Redirects unauthenticated users to login page
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecrypt } from "jose/jwe/compact/decrypt";

// Force Edge runtime for Cloudflare Workers compatibility
export const runtime = "experimental-edge";

/**
 * Decrypt a NextAuth JWE session token using AUTH_SECRET.
 * NextAuth v4 uses: { alg: "dir", enc: "A256GCM" }
 * Returns the decrypted payload or null if invalid.
 */
async function decryptSessionToken(
  token: string
): Promise<Record<string, unknown> | null> {
  try {
    const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
    if (!secret) {
      console.error("AUTH_SECRET is not set — cannot decrypt session token");
      return null;
    }

    // NextAuth uses the raw secret bytes as the JWE key
    const secretKey = new TextEncoder().encode(secret);

    // Decrypt the JWE token
    const { payload } = await jwtDecrypt(token, secretKey, {
      algorithms: ["dir"],
      contentEncryptions: ["A256GCM"],
    });

    return payload as Record<string, unknown>;
  } catch (error) {
    // Token is invalid, expired, or decryption failed
    console.error("Failed to decrypt session token:", error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to login and register pages without authentication
  if (pathname === "/admin/login" || pathname === "/admin/register") {
    // Check if user is already logged in
    const token =
      request.cookies.get("next-auth.session-token")?.value ||
      request.cookies.get("__Secure-next-auth.session-token")?.value;

    if (token) {
      const payload = await decryptSessionToken(token);
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
    const token =
      request.cookies.get("next-auth.session-token")?.value ||
      request.cookies.get("__Secure-next-auth.session-token")?.value;

    if (!token) {
      // No token — redirect to login
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const payload = await decryptSessionToken(token);
    if (!payload) {
      // Invalid or expired token — redirect to login
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
  matcher: ["/admin/:path*"],
};
