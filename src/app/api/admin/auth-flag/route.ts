/**
 * Auth Flag API — Sets/Clears the wpm_auth cookie
 *
 * This endpoint is called by the login page after a successful NextAuth login
 * to set the wpm_auth flag cookie that the middleware uses for auth detection.
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const isHttps = request.headers.get("x-forwarded-proto") === "https" ||
                  new URL(request.url).protocol === "https:";

  const maxAge = 24 * 60 * 60; // 24 hours
  const expires = new Date(Date.now() + maxAge * 1000);

  const cookieName = isHttps ? "__Secure-wpm_auth" : "wpm_auth";

  const response = NextResponse.json({ success: true }, { status: 200 });

  response.cookies.set(cookieName, "1", {
    path: "/",
    expires,
    sameSite: "lax",
    secure: isHttps,
    httpOnly: false,
  });

  return response;
}

export async function DELETE(request: NextRequest) {
  const isHttps = request.headers.get("x-forwarded-proto") === "https" ||
                  new URL(request.url).protocol === "https:";

  const cookieName = isHttps ? "__Secure-wpm_auth" : "wpm_auth";

  const response = NextResponse.json({ success: true }, { status: 200 });

  response.cookies.set(cookieName, "", {
    path: "/",
    expires: new Date(0),
    sameSite: "lax",
    secure: isHttps,
    httpOnly: false,
  });

  return response;
}
