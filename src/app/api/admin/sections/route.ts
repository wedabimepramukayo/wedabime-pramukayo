/**
 * API: Content Sections — List by pageSlug, Create
 * GET /api/admin/sections?pageSlug=home
 * POST /api/admin/sections
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getSql,
  requireAuth,
  unauthorized,
  badRequest,
  conflict,
  serverError,
  generateId,
  jsonStringify,
} from "@/lib/neon-sql";

// GET /api/admin/sections — List sections by pageSlug
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const { searchParams } = new URL(request.url);
    const pageSlug = searchParams.get("pageSlug") || "home";

    const sql = getSql();
    const rows = await sql`
      SELECT
        id, "pageSlug", "sectionKey", type, title, subtitle, content,
        items, "imageUrl", "linkUrl", "linkText", "sortOrder",
        "isActive", settings, "createdAt", "updatedAt"
      FROM "ContentSection"
      WHERE "pageSlug" = ${pageSlug}
      ORDER BY "sortOrder" ASC
    `;

    // neon returns JSONB columns as already-parsed objects
    return NextResponse.json({ sections: rows });
  } catch (error) {
    console.error("Sections GET error:", error);
    return serverError("Failed to fetch sections");
  }
}

// POST /api/admin/sections — Create a new section
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const body = await request.json();
    const {
      pageSlug,
      sectionKey,
      type,
      title,
      subtitle,
      content,
      items,
      imageUrl,
      linkUrl,
      linkText,
      sortOrder,
      isActive,
      settings,
    } = body;

    if (!pageSlug || !sectionKey || !type) {
      return badRequest("pageSlug, sectionKey, and type are required");
    }

    const sql = getSql();

    // Check for duplicate [pageSlug, sectionKey]
    const [existing] = await sql`
      SELECT id FROM "ContentSection"
      WHERE "pageSlug" = ${pageSlug} AND "sectionKey" = ${sectionKey}
    `;
    if (existing) {
      return conflict("A section with this pageSlug + sectionKey already exists");
    }

    const id = generateId();
    const itemsJson = jsonStringify(items ?? null);
    const settingsJson = jsonStringify(settings ?? null);

    const [section] = await sql`
      INSERT INTO "ContentSection" (
        id, "pageSlug", "sectionKey", type, title, subtitle, content,
        items, "imageUrl", "linkUrl", "linkText", "sortOrder",
        "isActive", settings, "createdAt", "updatedAt"
      ) VALUES (
        ${id},
        ${pageSlug},
        ${sectionKey},
        ${type},
        ${title || null},
        ${subtitle || null},
        ${content || null},
        ${itemsJson},
        ${imageUrl || null},
        ${linkUrl || null},
        ${linkText || null},
        ${sortOrder ?? 0},
        ${isActive ?? true},
        ${settingsJson},
        NOW(),
        NOW()
      )
      RETURNING
        id, "pageSlug", "sectionKey", type, title, subtitle, content,
        items, "imageUrl", "linkUrl", "linkText", "sortOrder",
        "isActive", settings, "createdAt", "updatedAt"
    `;

    return NextResponse.json({ section }, { status: 201 });
  } catch (error) {
    console.error("Sections POST error:", error);
    return serverError("Failed to create section");
  }
}
