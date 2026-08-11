/**
 * Custom Admin Logout API — Cloudflare Workers Compatible
 *
 * Clears the NextAuth session cookie and returns success.
 * Bypasses NextAuth's signOut() which has the workers.dev domain issue.
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const isHttps = requestUrl.protocol === "https:" ||
                  request.headers.get("x-forwarded-proto") === "https";

  // Build cookie names
  const sessionCookieName = isHttps
    ? "__Secure-next-auth.session-token"
    : "next-auth.session-token";

  const callbackCookieName = isHttps
    ? "__Secure-next-auth.callback-url"
    : "next-auth.callback-url";

  // Set cookies to expire immediately (clear them)
  const clearCookies = [
    `${sessionCookieName}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax${isHttps ? "; Secure" : ""}`,
    `${callbackCookieName}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax${isHttps ? "; Secure" : ""}`,
  ];

  const response = NextResponse.json({ success: true }, { status: 200 });

  // Set multiple Set-Cookie headers
  response.headers.set("Set-Cookie", clearCookies.join(", "));

  return response;
}
