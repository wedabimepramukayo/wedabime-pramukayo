/**
 * NextAuth Configuration — Wedabime Pramukayo CMS
 * Uses Credentials provider with bcrypt password verification
 * Session strategy: JWT (Edge-compatible for Cloudflare Pages)
 */

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Admin Login",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "admin@wedabimepramukayo.site",
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

        // Find user in database
        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("Invalid email or password");
        }

        // Check if user is active
        if (!user.isActive) {
          throw new Error("Account is deactivated. Contact administrator.");
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isValidPassword) {
          throw new Error("Invalid email or password");
        }

        // Update last login timestamp
        await db.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

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
      // After login, redirect to admin dashboard
      if (url.startsWith(baseUrl)) {
        // If returning from a protected page, go there
        const callbackUrl = new URL(url).searchParams.get("callbackUrl");
        if (callbackUrl) return callbackUrl;
        return `${baseUrl}/admin/dashboard`;
      }
      // If callback URL is relative
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return `${baseUrl}/admin/dashboard`;
    },
  },

  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },

  secret: process.env.AUTH_SECRET,

  debug: process.env.NODE_ENV === "development",
};
