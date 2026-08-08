/**
 * API: Site Settings — GET all settings grouped by category, PATCH bulk update
 * Wedabime Pramukayo CMS
 * Uses @neondatabase/serverless directly (Cloudflare Workers compatible)
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getSql,
  requireAuth,
  unauthorized,
  badRequest,
  serverError,
} from "@/lib/neon-sql";

// GET /api/admin/settings — Fetch all settings grouped by category
export async function GET() {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const sql = getSql();
    const settings = await sql`
      SELECT
        id, key, value, category, description,
        "isPublic", "createdAt", "updatedAt"
      FROM "SiteSetting"
      ORDER BY category ASC, key ASC
    `;

    // Group by category
    const grouped: Record<string, typeof settings> = {};
    for (const s of settings) {
      if (!grouped[s.category]) grouped[s.category] = [];
      grouped[s.category].push(s);
    }

    return NextResponse.json({ settings, grouped });
  } catch (error) {
    console.error("Settings GET error:", error);
    return serverError("Failed to fetch settings");
  }
}

// PATCH /api/admin/settings — Bulk update settings
// Body: { settings: { [key: string]: string } }
export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const body = await request.json();
    const { settings } = body;

    if (!settings || typeof settings !== "object") {
      return badRequest("Settings object is required");
    }

    const sql = getSql();
    const entries = Object.entries(settings);
    let updatedCount = 0;

    // Update each setting sequentially
    for (const [key, value] of entries) {
      const result = await sql`
        UPDATE "SiteSetting"
        SET value = ${String(value)}, "updatedAt" = NOW()
        WHERE key = ${key}
      `;
      // result.count gives the number of affected rows
      updatedCount += result.count;
    }

    return NextResponse.json({
      message: `Updated ${updatedCount} settings`,
      updated: updatedCount,
    });
  } catch (error) {
    console.error("Settings PATCH error:", error);
    return serverError("Failed to update settings");
  }
}
