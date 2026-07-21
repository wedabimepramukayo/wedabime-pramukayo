/**
 * Public Settings API — Wedabime Pramukayo
 * Returns public-facing site settings (contact info, social links, etc.)
 * Only exposes settings marked as isPublic: true
 */

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const revalidate = 300; // Cache for 5 minutes

export async function GET() {
  try {
    const settings = await db.siteSetting.findMany({
      where: { isPublic: true },
      select: { key: true, value: true, category: true },
    });

    // Group by category for easier consumption
    const grouped: Record<string, Record<string, string>> = {};
    settings.forEach((s) => {
      if (!grouped[s.category]) grouped[s.category] = {};
      grouped[s.category][s.key] = s.value;
    });

    return NextResponse.json({ settings: grouped });
  } catch (error) {
    console.error("Public settings error:", error);
    return NextResponse.json(
      { settings: {} },
      { status: 500 }
    );
  }
}
