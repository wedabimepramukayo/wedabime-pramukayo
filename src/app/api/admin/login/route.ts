/**
 * Custom Login API — Bypasses NextAuth's redirect mechanism
 *
 * NextAuth's default callback flow returns a 302 redirect to the
 * workers.dev internal URL on Cloudflare Workers, breaking the
 * login flow for custom domains.
 *
 * This endpoint handles authentication directly:
 * 1. Validates credentials
 * 2. Creates a NextAuth session token
 * 3. Sets the session cookie directly (no redirect)
 * 4. Returns JSON success response
 *
 * The client-side login page then navigates to the dashboard
 * using window.location.href.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyPassword } from "@/lib/password-utils";
import { neon } from "@neondatabase/serverless";

// We need to create a JWT token for the session
// Using jose library which is Edge-compatible
import { EncryptJWT } from "jose/jwt/encrypt";
import { SignJWT } from "jose/jwt/sign";

export const dynamic = "force-dynamic";

function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }
  return neon(process.env.DATABASE_URL);
}

/**
 * Create an encrypted JWT session token compatible with NextAuth v4
 * NextAuth uses: { alg: "dir", enc: "A256GCM" } with the AUTH_SECRET as key
 */
async function createSessionToken(payload: {
  id: string;
  email: string;
  name: string | null;
  role: string;
}): Promise<string> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not configured");
  }

  const secretKey = new TextEncoder().encode(secret);
  const now = Math.floor(Date.now() / 1000);

  // NextAuth v4 encrypts the JWT using JWE
  const token = await new EncryptJWT({
    ...payload,
    iat: now,
    exp: now + 24 * 60 * 60, // 24 hours
    jti: crypto.randomUUID?.() || `${now}-${Math.random().toString(36).slice(2)}`,
  })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .encrypt(secretKey);

  return token;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user in database
    const sql = getSql();
    const result = await sql`
      SELECT id, email, name, role, "isActive", "passwordHash"
      FROM "User"
      WHERE email = ${email}
    `;
    const user = result[0];

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: "Account is deactivated. Contact administrator." },
        { status: 403 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Update last login timestamp
    await sql`
      UPDATE "User" SET "lastLoginAt" = NOW() WHERE id = ${user.id}
    `;

    // Create session token
    const sessionToken = await createSessionToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    // Calculate cookie expiry (24 hours from now)
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Set the session cookie and return success
    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: 200 }
    );

    // Set the NextAuth session cookie
    // Use __Secure- prefix for HTTPS (production)
    const cookieName = "__Secure-next-auth.session-token";
    response.cookies.set(cookieName, sessionToken, {
      path: "/",
      expires,
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}
