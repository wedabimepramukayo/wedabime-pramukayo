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
    const count = await db.user.count();

    return NextResponse.json({
      count,
      canRegister: count === 0,
    });
  } catch (error) {
    console.error("Failed to count users:", error);
    return NextResponse.json(
      { error: "Failed to check users" },
      { status: 500 }
    );
  }
}
