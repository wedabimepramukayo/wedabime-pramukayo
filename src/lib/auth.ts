/**
 * NextAuth Configuration — Wedabime Pramukayo CMS
 * Uses Credentials provider with PBKDF2 password verification
 * Session strategy: JWT (Edge-compatible for Cloudflare Workers)
 *
 * Password hashing: PBKDF2 via Web Crypto API (crypto.subtle)
 * - Works on both Cloudflare Workers (Edge) and Node.js
 * - Also supports legacy bcrypt hashes for migration
 */

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyPassword } from "@/lib/password-utils";
import { neon } from "@neondatabase/serverless";

// Helper: get Neon SQL function (lightweight HTTP client, no Prisma engine)
function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }
  return neon(process.env.DATABASE_URL);
}

// Validate AUTH_SECRET to prevent silent security issues
// Skip during Next.js build phase (secrets not available at build time)
const PLACEHOLDER_SECRETS = [
  "your-secret-key-here-change-this",
  "change-me",
  "secret",
  "",
];

const isBuildPhase = process.env.NEXT_PHASE?.includes("build");

if (!isBuildPhase && (!process.env.AUTH_SECRET || PLACEHOLDER_SECRETS.includes(process.env.AUTH_SECRET))) {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "AUTH_SECRET environment variable must be set to a secure random value in production. " +
      "Generate one with: openssl rand -base64 32"
    );
  }
  // In development, warn but don't crash
  console.warn(
    "AUTH_SECRET is not set or uses a placeholder value. " +
    "This is insecure for production. Set a strong random value."
  );
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Admin Login",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "your@email.com",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        // Find user in database using Neon directly (no Prisma engine)
        const sql = getSql();
        const result = await sql`
          SELECT id, email, name, role, "isActive", "passwordHash"
          FROM "User"
          WHERE email = ${credentials.email}
        `;
        const user = result[0];

        if (!user) {
          throw new Error("Invalid email or password");
        }

        // Check if user is active
        if (!user.isActive) {
          throw new Error("Account is deactivated. Contact administrator.");
        }

        // Verify password using PBKDF2 (Web Crypto API) or legacy bcrypt
        const isValidPassword = await verifyPassword(
          credentials.password,
          user.passwordHash
        );

        if (!isValidPassword) {
          throw new Error("Invalid email or password");
        }

        // Update last login timestamp
        await sql`
          UPDATE "User" SET "lastLoginAt" = NOW() WHERE id = ${user.id}
        `;

        // Return user object (never include passwordHash)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 4 * 60 * 60, // Update JWT every 4 hours
  },

  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },

  callbacks: {
    async jwt({ token, user }) {
      // Include role in JWT token on sign in
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      // Pass role and id to session from JWT
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      // CRITICAL FIX for Cloudflare Workers:
      // NextAuth generates URLs with the workers.dev internal domain.
      // We must override ALL redirect URLs to use the custom domain.
      const siteUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || baseUrl;

      // Parse the URL to extract the path and query params
      let targetPath = "/admin/dashboard";
      try {
        const parsedUrl = new URL(url);
        targetPath = parsedUrl.pathname + parsedUrl.search;
      } catch {
        // url is a relative path
        targetPath = url;
      }

      // Extract callbackUrl if present
      try {
        const callbackUrl = new URL(url).searchParams.get("callbackUrl");
        if (callbackUrl) {
          // callbackUrl might also have workers.dev domain, fix it
          try {
            const parsedCallback = new URL(callbackUrl);
            targetPath = parsedCallback.pathname + parsedCallback.search;
          } catch {
            targetPath = callbackUrl;
          }
        }
      } catch {}

      // Always use the site URL (custom domain), never workers.dev
      return `${siteUrl}${targetPath}`;
    },
  },

  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },

  secret: process.env.AUTH_SECRET,

  debug: process.env.NODE_ENV === "development",
};
