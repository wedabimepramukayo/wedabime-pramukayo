/**
 * NextAuth API Route Handler — Wedabime Pramukayo CMS
 * Handles all auth requests at /api/auth/[...nextauth]
 *
 * FIX: On Cloudflare Workers, the request origin header reports
 * the workers.dev internal URL instead of the custom domain.
 * This causes NextAuth to generate callback/redirect URLs with
 * the wrong domain, breaking login redirects.
 *
 * We intercept the request, fix the origin/URL to use the
 * custom domain, and also fix the response redirect location.
 */

import { NextRequest, NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// The correct public URL for this deployment
const SITE_URL = "https://wedabimepramukayo.site";

async function handler(req: NextRequest) {
  // Fix the request URL to use the correct domain
  // Cloudflare Workers may report the workers.dev URL internally
  const url = new URL(req.url);
  if (url.origin !== SITE_URL) {
    url.protocol = "https:";
    url.hostname = "wedabimepramukayo.site";
    url.port = "";
  }

  // Create a new Request with the fixed URL and origin header
  const headers = new Headers(req.headers);
  headers.set("host", "wedabimepramukayo.site");
  headers.set("x-forwarded-host", "wedabimepramukayo.site");
  headers.set("x-forwarded-proto", "https");

  // Remove the origin header so NextAuth falls back to NEXTAUTH_URL
  // or reconstructs it from the request
  headers.delete("origin");

  const fixedRequest = new Request(url.toString(), {
    method: req.method,
    headers,
    body: req.body,
    // @ts-ignore - duplex is needed for streaming bodies
    duplex: "half",
  });

  // Set NEXTAUTH_URL before NextAuth processes the request
  process.env.NEXTAUTH_URL = SITE_URL;

  // Process with NextAuth
  const nextAuthHandler = NextAuth(authOptions);
  // @ts-ignore
  const response = await nextAuthHandler(fixedRequest);

  // Fix any redirect URLs in the response that point to workers.dev
  if (response.status === 302 || response.status === 307) {
    const location = response.headers.get("location");
    if (location && location.includes("workers.dev")) {
      // Replace workers.dev URL with custom domain
      const fixedLocation = location.replace(
        /https?:\/\/[a-z-]+\.wedabimepramukayo\.workers\.dev/,
        SITE_URL
      );
      const fixedHeaders = new Headers(response.headers);
      fixedHeaders.set("location", fixedLocation);
      return new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: fixedHeaders,
      });
    }
  }

  // Fix Set-Cookie headers that have workers.dev URLs
  const responseHeaders = new Headers(response.headers);
  const setCookies = responseHeaders.getSetCookie?.() || [];
  if (setCookies.length > 0) {
    let needsFix = false;
    const fixedCookies = setCookies.map((cookie: string) => {
      if (cookie.includes("workers.dev")) {
        needsFix = true;
        return cookie.replace(
          /https%3A%2F%2F[a-z-]+\.wedabimepramukayo\.workers\.dev/g,
          encodeURIComponent(SITE_URL).replace(/\./g, "%2E")
        );
      }
      return cookie;
    });

    if (needsFix) {
      // Delete all Set-Cookie headers and re-add fixed ones
      responseHeaders.delete("set-cookie");
      for (const cookie of fixedCookies) {
        responseHeaders.append("set-cookie", cookie);
      }
    }
  }

  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

export { handler as GET, handler as POST };
