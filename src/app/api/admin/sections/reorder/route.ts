/**
 * API: Reorder Content Sections — batch update sortOrder
 * POST /api/admin/sections/reorder
 * Body: { items: [{ id: string, sortOrder: number }] }
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getSql,
  requireAuth,
  unauthorized,
  badRequest,
  serverError,
} from "@/lib/neon-sql";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const body = await request.json();
    const { items }: { items: { id: string; sortOrder: number }[] } = body;

    if (!items || !Array.isArray(items)) {
      return badRequest("items array is required");
    }

    const sql = getSql();

    // Run sequential UPDATEs (no transaction needed for simple sort order updates)
    for (const item of items) {
      await sql`
        UPDATE "ContentSection"
        SET "sortOrder" = ${item.sortOrder}, "updatedAt" = NOW()
        WHERE id = ${item.id}
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Sections reorder error:", error);
    return serverError("Failed to reorder sections");
  }
}
