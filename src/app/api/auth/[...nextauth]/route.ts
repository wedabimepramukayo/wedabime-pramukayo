/**
 * NextAuth API Route Handler — Wedabime Pramukayo CMS
 * Handles all auth requests at /api/auth/[...nextauth]
 *
 * On Cloudflare Workers, the request origin can be the workers.dev URL
 * instead of the custom domain. This causes NextAuth to generate
 * callback URLs with the wrong domain, breaking login redirects.
 *
 * Fix: Override NEXTAUTH_URL at runtime to ensure correct domain.
 */

// Set NEXTAUTH_URL if not already set (Cloudflare Workers runtime)
// This ensures NextAuth uses the custom domain for callback URLs
if (!process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = "https://wedabimepramukayo.site";
}

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
