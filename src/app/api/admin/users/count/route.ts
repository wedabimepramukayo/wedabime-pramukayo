/**
 * Check if any admin users exist — used by registration page
 * GET /api/admin/users/count → { count, canRegister }
 *
 * canRegister is true when no users exist (first-time setup)
 */
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

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

    const count = await db.user.count();

    return NextResponse.json({
      count,
      canRegister: count === 0,
    });
  } catch (error: any) {
    console.error("Failed to count users:", error);
    // Return detailed error for debugging (remove in production later)
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
