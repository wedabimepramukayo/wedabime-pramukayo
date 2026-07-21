/**
 * Proxy (Middleware) — Wedabime Pramukayo CMS
 * Next.js 16 uses "proxy" convention instead of deprecated "middleware"
 * Protects /admin/* routes (except /admin/login)
 * Redirects unauthenticated users to login page
 */

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth({
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    authorized({ token, req }) {
      const { pathname } = req.nextUrl;

      // Allow access to login page without authentication
      if (pathname === "/admin/login") {
        // If already logged in, redirect to dashboard
        if (token) {
          return NextResponse.redirect(new URL("/admin/dashboard", req.url));
        }
        return NextResponse.next();
      }

      // Protect all /admin/* routes — require valid token with admin/editor role
      if (pathname.startsWith("/admin")) {
        if (!token) return false;
        const role = token.role as string;
        return role === "admin" || role === "editor";
      }

      // Allow all other routes
      return true;
    },
  },
});

export const config = {
  matcher: [
    "/admin/:path*",
  ],
};
