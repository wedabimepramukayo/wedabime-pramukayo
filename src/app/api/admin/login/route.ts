/**
 * Custom Admin Login API — Cloudflare Workers Compatible
 *
 * Bypasses NextAuth's signIn/redirect mechanism which breaks on Workers
 * because NextAuth generates redirect URLs with the workers.dev internal
 * domain instead of the custom domain.
 *
 * This endpoint:
 * 1. Validates credentials against the database
 * 2. Creates a NextAuth-compatible JWT session token using jose
 * 3. Sets the session cookie on the correct domain
 * 4. Returns a JSON success response (no redirect)
 *
 * The JWT format is compatible with NextAuth v4's JWE format
 * (dir + A256GCM), so getServerSession() and the middleware's
 * cookie check continue to work.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyPassword } from "@/lib/password-utils";
import { neon } from "@neondatabase/serverless";
import { EncryptJWT } from "jose";

// Helper: get Neon SQL function
function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }
  return neon(process.env.DATABASE_URL);
}

// Get the encryption key from AUTH_SECRET
// NextAuth v4 uses AUTH_SECRET as the key for 'dir' algorithm with A256GCM
async function getEncryptionKey(): Promise<CryptoKey> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not configured");
  }
  // NextAuth v4 uses the raw secret bytes as the key for 'dir' algorithm
  const keyBytes = new TextEncoder().encode(secret);
  // Import as a CryptoKey for A256GCM (first 32 bytes = 256 bits)
  return crypto.subtle.importKey(
    "raw",
    keyBytes.slice(0, 32),
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
}

// NextAuth v4 JWE protected header
const JWE_PROTECTED_HEADER = {
  alg: "dir",
  enc: "A256GCM",
};

interface LoginRequest {
  email: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    // Validate required fields
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

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: "Account is deactivated. Contact administrator." },
        { status: 403 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Update last login timestamp
    await sql`
      UPDATE "User" SET "lastLoginAt" = NOW() WHERE id = ${user.id}
    `;

    // Create NextAuth-compatible JWT session token
    const encryptionKey = await getEncryptionKey();

    // NextAuth v4 JWT payload structure
    const now = Math.floor(Date.now() / 1000);
    const maxAge = 24 * 60 * 60; // 24 hours (matches auth.ts)
    const tokenPayload = {
      name: user.name || "",
      email: user.email,
      role: user.role,
      id: user.id,
      iat: now,
      exp: now + maxAge,
      jti: crypto.randomUUID?.() || `${now}-${Math.random().toString(36).slice(2)}`,
    };

    // Encrypt the JWT using JWE (dir + A256GCM) — same as NextAuth v4
    const sessionToken = await new EncryptJWT(tokenPayload)
      .setProtectedHeader(JWE_PROTECTED_HEADER)
      .setIssuedAt(now)
      .setExpirationTime(now + maxAge)
      .encrypt(encryptionKey);

    // Determine the correct cookie settings
    const requestUrl = new URL(request.url);
    const isHttps = requestUrl.protocol === "https:" ||
                    request.headers.get("x-forwarded-proto") === "https";

    // Build cookie name — NextAuth uses __Secure- prefix on HTTPS
    const cookieName = isHttps
      ? "__Secure-next-auth.session-token"
      : "next-auth.session-token";

    // Auth flag cookie name (non-HttpOnly, readable by middleware)
    const authFlagName = isHttps ? "__Secure-wpm_auth" : "wpm_auth";

    const expires = new Date(Date.now() + maxAge * 1000);
    const cookieOptions = {
      path: "/",
      expires,
      sameSite: "lax" as const,
      secure: isHttps,
      httpOnly: true,
    };

    const authFlagOptions = {
      path: "/",
      expires,
      sameSite: "lax" as const,
      secure: isHttps,
      httpOnly: false,
    };

    // Return success response
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

    // Set both cookies using NextResponse cookies API
    // This properly creates separate Set-Cookie headers (no comma-join bug)
    response.cookies.set(cookieName, sessionToken, cookieOptions);
    response.cookies.set(authFlagName, "1", authFlagOptions);

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    const detail = error?.message || String(error);

    let userError = "Login failed. Please try again.";
    if (detail.includes("DATABASE_URL")) {
      userError = "Database connection failed. Please try again later.";
    } else if (detail.includes("AUTH_SECRET")) {
      userError = "Server configuration error. Please contact support.";
    }

    return NextResponse.json(
      { error: userError },
      { status: 500 }
    );
  }
}
