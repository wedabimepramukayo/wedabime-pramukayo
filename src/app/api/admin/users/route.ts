/**
 * Admin Users API — List all admins & Create new admin
 * GET  /api/admin/users          → list all admin users
 * POST /api/admin/users          → create a new admin user
 *
 * Registration (POST) is allowed in two cases:
 *   1. No users exist in DB (first-time setup)
 *   2. Requester is an authenticated admin (adding another admin)
 *
 * Uses @neondatabase/serverless directly (bypasses Prisma)
 * to avoid engine/WASM issues on Cloudflare Workers.
 */
import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/password-utils";
import { neon } from "@neondatabase/serverless";

// Helper: get Neon SQL function (lightweight HTTP client, no Prisma engine)
function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }
  return neon(process.env.DATABASE_URL);
}

// Helper: generate CUID-like ID (compatible with Prisma's @default(cuid()))
function generateId(): string {
  const timestamp = Date.now().toString(36);
  const random = crypto.getRandomValues(new Uint8Array(24));
  const randomStr = Array.from(random, b => b.toString(36).padStart(2, '0')).join('');
  return `c${timestamp}${randomStr}`.slice(0, 25);
}

export async function GET() {
  try {
    const sql = getSql();
    const users = await sql`
      SELECT id, email, name, role, "isActive", "lastLoginAt", "createdAt"
      FROM "User"
      ORDER BY "createdAt" ASC
    `;

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error("Failed to fetch users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users", detail: error?.message || String(error) },
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

    // Validate DATABASE_URL
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "Database is not configured. Please set DATABASE_URL.", detail: "DATABASE_URL environment variable is missing" },
        { status: 503 }
      );
    }

    const sql = neon(process.env.DATABASE_URL);

    // Check user count (for first-time setup permission)
    const countResult = await sql`SELECT COUNT(*)::int as count FROM "User"`;
    const userCount = countResult[0]?.count ?? 0;
    const isFirstSetup = userCount === 0;

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

    // Hash password using Web Crypto API (Cloudflare Workers compatible)
    const passwordHash = await hashPassword(password);

    // Generate ID (Prisma uses @default(cuid()), we generate manually for raw SQL)
    const id = generateId();

    // Create user using Neon SQL
    const insertResult = await sql`
      INSERT INTO "User" (id, email, "passwordHash", name, role, "isActive", "createdAt", "updatedAt")
      VALUES (${id}, ${email}, ${passwordHash}, ${name || null}, ${role || 'admin'}, true, NOW(), NOW())
      RETURNING id, email, name, role, "isActive", "createdAt"
    `;
    const user = insertResult[0];

    if (!user) {
      return NextResponse.json(
        { error: "Failed to create admin account", detail: "INSERT did not return a row" },
        { status: 500 }
      );
    }

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

    // Provide user-friendly error messages for common issues
    let userError = "Failed to create admin account";
    if (detail.includes("DATABASE_URL")) {
      userError = "Database connection failed. Please check your DATABASE_URL configuration.";
    } else if (detail.includes("relation") && detail.includes("does not exist")) {
      userError = "Database tables not found. Please run database migrations first.";
    } else if (detail.includes("connection") || detail.includes("connect")) {
      userError = "Could not connect to database. Please try again later.";
    } else if (detail.includes("crypto") || detail.includes("getRandomValues")) {
      userError = "Server crypto error. Please contact support.";
    }

    return NextResponse.json(
      { error: userError, detail },
      { status: 500 }
    );
  }
}
