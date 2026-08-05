/**
 * Check if any admin users exist — used by registration page
 * GET /api/admin/users/count → { count, canRegister }
 *
 * canRegister is true when no users exist (first-time setup)
 *
 * Uses @neondatabase/serverless directly (bypasses Prisma)
 * This avoids Prisma's native engine/WASM requirement on Cloudflare Workers.
 */
import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET() {
  try {
    // Check if DATABASE_URL is available
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        {
          error: "DATABASE_URL is not configured",
          hint: "Set DATABASE_URL as a Cloudflare Worker secret: wrangler secret put DATABASE_URL",
          count: 0,
          canRegister: false,
        },
        { status: 503 }
      );
    }

    // Use Neon serverless directly — no Prisma engine needed
    const sql = neon(process.env.DATABASE_URL);
    const result = await sql`SELECT COUNT(*)::int as count FROM "User"`;
    const count = result[0]?.count ?? 0;

    return NextResponse.json({
      count,
      canRegister: count === 0,
    });
  } catch (error: any) {
    console.error("Failed to count users:", error);
    const errorDetail = error?.message || String(error);
    const errorCode = error?.code;
    return NextResponse.json(
      {
        error: "Failed to check users",
        detail: errorDetail,
        code: errorCode,
        dbUrlSet: !!process.env.DATABASE_URL,
        dbUrlPrefix: process.env.DATABASE_URL
          ? process.env.DATABASE_URL.substring(0, 20) + "..."
          : "NOT SET",
      },
      { status: 500 }
    );
  }
}
