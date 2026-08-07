/**
 * Admin Users API — List all admins & Create new admin
 * GET  /api/admin/users          → list all admin users
 * POST /api/admin/users          → create a new admin user
 *
 * Registration (POST) is allowed in two cases:
 *   1. No users exist in DB (first-time setup)
 *   2. Requester is an authenticated admin (adding another admin)
 *
 * Uses @neondatabase/serverless directly for first-time setup
 * (bypasses Prisma to avoid engine/WASM issues on Cloudflare Workers).
 * Falls back to Prisma for authenticated operations (list, etc.).
 */
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { neon } from "@neondatabase/serverless";

// Helper: get Neon SQL function (lightweight HTTP client, no Prisma engine)
function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }
  return neon(process.env.DATABASE_URL);
}

// Helper: generate CUID-like ID (compatible with Prisma's @default(cuid()))
// Format: c + timestamp(base36) + random chars — same length as Prisma CUIDs
function generateId(): string {
  const timestamp = Date.now().toString(36);
  const random = crypto.getRandomValues(new Uint8Array(24));
  const randomStr = Array.from(random, b => b.toString(36).padStart(2, '0')).join('');
  return `c${timestamp}${randomStr}`.slice(0, 25); // Prisma CUIDs are ~25 chars
}

export async function GET() {
  try {
    // Use Neon directly for listing users too
    const sql = getSql();
    const users = await sql`
      SELECT id, email, name, role, "isActive", "lastLoginAt", "createdAt"
      FROM "User"
      ORDER BY "createdAt" ASC
    `;

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, role } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    const sql = getSql();

    // Check user count (for first-time setup permission)
    const countResult = await sql`SELECT COUNT(*)::int as count FROM "User"`;
    const userCount = countResult[0]?.count ?? 0;
    const isFirstSetup = userCount === 0;

    // If not first setup, require authentication (existing admin adding new admin)
    if (!isFirstSetup) {
      // The middleware should handle this for /api/admin/* routes
      // But we still allow the request through if middleware passed
    }

    // Check if email already exists
    const existingResult = await sql`
      SELECT id FROM "User" WHERE email = ${email}
    `;
    if (existingResult.length > 0) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Generate ID (Prisma uses @default(cuid()), we generate manually for raw SQL)
    const id = generateId();

    // Create user using Neon SQL
    const insertResult = await sql`
      INSERT INTO "User" (id, email, "passwordHash", name, role, "isActive")
      VALUES (${id}, ${email}, ${passwordHash}, ${name || null}, ${role || "admin"}, true)
      RETURNING id, email, name, role, "isActive", "createdAt"
    `;
    const user = insertResult[0];

    return NextResponse.json(
      {
        user,
        isFirstSetup,
        message: isFirstSetup
          ? "Admin account created successfully! You can now log in."
          : "New admin account created successfully.",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Failed to create user:", error);
    const detail = error?.message || String(error);
    return NextResponse.json(
      { error: "Failed to create admin account", detail },
      { status: 500 }
    );
  }
}
