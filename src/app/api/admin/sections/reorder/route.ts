/**
 * API: Reorder Content Sections — batch update sortOrder
 * POST /api/admin/sections/reorder
 * Body: { items: [{ id: string, sortOrder: number }] }
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { items }: { items: { id: string; sortOrder: number }[] } = body;

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: "items array is required" }, { status: 400 });
    }

    // Update sortOrder for each item in a transaction
    await db.$transaction(
      items.map((item) =>
        db.contentSection.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Sections reorder error:", error);
    return NextResponse.json({ error: "Failed to reorder sections" }, { status: 500 });
  }
}
