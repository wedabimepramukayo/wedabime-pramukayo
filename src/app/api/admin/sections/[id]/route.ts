/**
 * API: Content Section by ID — GET, PUT, DELETE
 * /api/admin/sections/[id]
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getSql,
  requireAuth,
  unauthorized,
  notFound,
  conflict,
  serverError,
  jsonStringify,
} from "@/lib/neon-sql";

const SELECT_COLUMNS = `
  id, "pageSlug", "sectionKey", type, title, subtitle, content,
  items, "imageUrl", "linkUrl", "linkText", "sortOrder",
  "isActive", settings, "createdAt", "updatedAt"
`;

// GET /api/admin/sections/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const { id } = await params;
    const sql = getSql();

    const [section] = await sql`
      SELECT ${sql.unsafe(SELECT_COLUMNS)} FROM "ContentSection" WHERE id = ${id}
    `;

    if (!section) return notFound("Section not found");

    return NextResponse.json({ section });
  } catch (error) {
    console.error("Section GET error:", error);
    return serverError("Failed to fetch section");
  }
}

// PUT /api/admin/sections/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const { id } = await params;
    const body = await request.json();
    const sql = getSql();

    // Check if section exists
    const [existing] = await sql`
      SELECT ${sql.unsafe(SELECT_COLUMNS)} FROM "ContentSection" WHERE id = ${id}
    `;
    if (!existing) return notFound("Section not found");

    // If sectionKey or pageSlug is being changed, check for unique constraint
    if (body.sectionKey || body.pageSlug) {
      const newPageSlug = body.pageSlug ?? existing.pageSlug;
      const newSectionKey = body.sectionKey ?? existing.sectionKey;
      if (newPageSlug !== existing.pageSlug || newSectionKey !== existing.sectionKey) {
        const [duplicate] = await sql`
          SELECT id FROM "ContentSection"
          WHERE "pageSlug" = ${newPageSlug} AND "sectionKey" = ${newSectionKey}
        `;
        if (duplicate) {
          return conflict("A section with this pageSlug + sectionKey already exists");
        }
      }
    }

    // Build dynamic SET clauses
    const setClauses: string[] = [];
    const values: unknown[] = [];

    const addField = (column: string, value: unknown) => {
      setClauses.push(`${column} = $${values.length + 1}`);
      values.push(value);
    };

    if (body.pageSlug !== undefined) addField('"pageSlug"', body.pageSlug);
    if (body.sectionKey !== undefined) addField('"sectionKey"', body.sectionKey);
    if (body.type !== undefined) addField("type", body.type);
    if (body.title !== undefined) addField("title", body.title || null);
    if (body.subtitle !== undefined) addField("subtitle", body.subtitle || null);
    if (body.content !== undefined) addField("content", body.content || null);
    if (body.items !== undefined) addField("items", jsonStringify(body.items || null));
    if (body.imageUrl !== undefined) addField('"imageUrl"', body.imageUrl || null);
    if (body.linkUrl !== undefined) addField('"linkUrl"', body.linkUrl || null);
    if (body.linkText !== undefined) addField('"linkText"', body.linkText || null);
    if (body.sortOrder !== undefined) addField('"sortOrder"', body.sortOrder);
    if (body.isActive !== undefined) addField('"isActive"', body.isActive);
    if (body.settings !== undefined) addField("settings", jsonStringify(body.settings || null));

    // Always touch updatedAt
    setClauses.push(`"updatedAt" = NOW()`);

    const setSql = setClauses.join(", ");
    const fullSql = `
      UPDATE "ContentSection"
      SET ${setSql}
      WHERE id = $${values.length + 1}
      RETURNING ${SELECT_COLUMNS}
    `;
    values.push(id);

    const rows = await sql.unsafe(fullSql, values);
    const section = rows[0];

    return NextResponse.json({ section });
  } catch (error) {
    console.error("Section PUT error:", error);
    return serverError("Failed to update section");
  }
}

// DELETE /api/admin/sections/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const { id } = await params;
    const sql = getSql();

    const [existing] = await sql`
      SELECT id FROM "ContentSection" WHERE id = ${id}
    `;
    if (!existing) return notFound("Section not found");

    await sql`DELETE FROM "ContentSection" WHERE id = ${id}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Section DELETE error:", error);
    return serverError("Failed to delete section");
  }
}
