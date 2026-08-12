/**
 * Custom Admin Logout API — Cloudflare Workers Compatible
 *
 * Clears the NextAuth session cookie and auth flag cookie.
 * Bypasses NextAuth's signOut() which has the workers.dev domain issue.
 * Uses NextResponse.cookies API for proper multi-cookie support.
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const isHttps = request.headers.get("x-forwarded-proto") === "https" ||
                  new URL(request.url).protocol === "https:";

  // Build cookie names
  const sessionCookieName = isHttps
    ? "__Secure-next-auth.session-token"
    : "next-auth.session-token";

  const callbackCookieName = isHttps
    ? "__Secure-next-auth.callback-url"
    : "next-auth.callback-url";

  const authFlagCookieName = isHttps
    ? "__Secure-wpm_auth"
    : "wpm_auth";

  const expired = new Date(0); // Thu, 01 Jan 1970 00:00:00 GMT

  const response = NextResponse.json({ success: true }, { status: 200 });

  // Clear each cookie using NextResponse cookies API
  // This properly creates separate Set-Cookie headers
  response.cookies.set(sessionCookieName, "", {
    path: "/",
    expires: expired,
    sameSite: "lax",
    secure: isHttps,
    httpOnly: true,
  });

  response.cookies.set(callbackCookieName, "", {
    path: "/",
    expires: expired,
    sameSite: "lax",
    secure: isHttps,
    httpOnly: true,
  });

  response.cookies.set(authFlagCookieName, "", {
    path: "/",
    expires: expired,
    sameSite: "lax",
    secure: isHttps,
    httpOnly: false,
  });

  return response;
}
