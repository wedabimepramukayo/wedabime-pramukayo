/**
 * Public Settings API — Wedabime Pramukayo
 * Returns public-facing site settings (contact info, social links, etc.)
 * Only exposes settings marked as isPublic: true
 *
 * Converted from Prisma to Neon direct SQL for Cloudflare Workers compatibility.
 */

import { NextResponse } from "next/server";
import { getSql } from "@/lib/neon-sql";

// Force dynamic rendering — no prerendering at build time (DATABASE_URL may not be available)
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sql = getSql();

    const rows = await sql`
      SELECT key, value, category
      FROM "SiteSetting"
      WHERE "isPublic" = true
    `;

    // Group by category for easier consumption
    const grouped: Record<string, Record<string, string>> = {};
    (rows as { key: string; value: string; category: string }[]).forEach((s) => {
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
