/**
 * API: Site Settings — GET all settings grouped by category, PATCH bulk update
 * Wedabime Pramukayo CMS
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/admin/settings — Fetch all settings grouped by category
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await db.siteSetting.findMany({
      orderBy: [{ category: "asc" }, { key: "asc" }],
    });

    // Group by category
    const grouped: Record<string, typeof settings> = {};
    for (const s of settings) {
      if (!grouped[s.category]) grouped[s.category] = [];
      grouped[s.category].push(s);
    }

    return NextResponse.json({ settings, grouped });
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/settings — Bulk update settings
// Body: { settings: { [key: string]: string } }
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { settings } = body;

    if (!settings || typeof settings !== "object") {
      return NextResponse.json(
        { error: "Settings object is required" },
        { status: 400 }
      );
    }

    // Update each setting in a transaction
    const updates = await db.$transaction(
      Object.entries(settings).map(([key, value]) =>
        db.siteSetting.update({
          where: { key },
          data: { value: String(value) },
        })
      )
    );

    return NextResponse.json({
      message: `Updated ${updates.length} settings`,
      updated: updates.length,
    });
  } catch (error) {
    console.error("Settings PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
