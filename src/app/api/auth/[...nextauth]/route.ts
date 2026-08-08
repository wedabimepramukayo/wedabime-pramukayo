/**
 * NextAuth API Route Handler — Wedabime Pramukayo CMS
 * Handles all auth requests at /api/auth/[...nextauth]
 *
 * This handler is needed for:
 * - Session reading (getServerSession)
 * - CSRF token generation
 * - Session refresh
 *
 * Note: The actual login flow uses /api/admin/login instead of
 * NextAuth's callback to avoid the workers.dev redirect issue
 * on Cloudflare Workers.
 *
 * We also fix any response URLs that point to the workers.dev
 * internal domain instead of the custom domain.
 */

import { NextRequest, NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const SITE_URL = "https://wedabimepramukayo.site";
const WORKERS_DEV_PATTERN = /https?:\/\/[a-z-]+\.wedabimepramukayo\.workers\.dev/;

async function handler(req: NextRequest) {
  // Process with NextAuth
  const nextAuthHandler = NextAuth(authOptions);
  // @ts-ignore
  const response = await nextAuthHandler(req);

  // Fix any redirect URLs in the response that point to workers.dev
  if (response.status === 302 || response.status === 307) {
    const location = response.headers.get("location");
    if (location && WORKERS_DEV_PATTERN.test(location)) {
      const fixedLocation = location.replace(WORKERS_DEV_PATTERN, SITE_URL);
      const fixedHeaders = new Headers(response.headers);
      fixedHeaders.set("location", fixedLocation);
      return new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: fixedHeaders,
      });
    }
  }

  return response;
}

export { handler as GET, handler as POST };
