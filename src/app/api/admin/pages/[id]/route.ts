/**
 * API: Single Page — GET, PUT, DELETE by ID
 * Wedabime Pramukayo CMS
 *
 * Uses @neondatabase/serverless directly (Prisma incompatible with CF Workers)
 */

import { NextRequest } from "next/server";
import {
  getSql,
  requireAuth,
  unauthorized,
  notFound,
  conflict,
  serverError,
} from "@/lib/neon-sql";

/** Common column list for SELECT queries */
const PAGE_COLUMNS = `
  id, slug, title,
  "heroTitle", "heroSubtitle", "heroImageUrl",
  content,
  "metaTitle", "metaDesc", "metaKeywords", "ogImageUrl",
  "isPublished", "publishedAt", "sortOrder",
  "createdAt", "updatedAt"
`;

// GET /api/admin/pages/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const { id } = await params;
    const sql = getSql();

    const [page] = await sql`
      SELECT ${sql.unsafe(PAGE_COLUMNS)} FROM "Page" WHERE id = ${id}
    `;

    if (!page) {
      return notFound("Page not found");
    }

    return Response.json({ page });
  } catch (error) {
    console.error("Page GET error:", error);
    return serverError("Failed to fetch page");
  }
}

// PUT /api/admin/pages/[id] — Update a page
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

    // Fetch existing page
    const [existing] = await sql`
      SELECT
        id, slug, "isPublished", "publishedAt"
      FROM "Page" WHERE id = ${id}
    `;
    if (!existing) {
      return notFound("Page not found");
    }

    // Check slug conflict if slug is being changed
    if (body.slug && body.slug !== existing.slug) {
      const [slugConflict] = await sql`
        SELECT id FROM "Page" WHERE slug = ${body.slug}
      `;
      if (slugConflict) {
        return conflict("A page with this slug already exists");
      }
    }

    // Build dynamic SET clauses
    const sets: string[] = [];
    const values: unknown[] = [];

    const addSet = (column: string, value: unknown) => {
      sets.push(`${column} = $${values.length + 1}`);
      values.push(value);
    };

    if (body.slug !== undefined) addSet("slug", body.slug);
    if (body.title !== undefined) addSet("title", body.title);
    if (body.heroTitle !== undefined) addSet('"heroTitle"', body.heroTitle || null);
    if (body.heroSubtitle !== undefined) addSet('"heroSubtitle"', body.heroSubtitle || null);
    if (body.heroImageUrl !== undefined) addSet('"heroImageUrl"', body.heroImageUrl || null);
    if (body.content !== undefined) addSet("content", body.content);
    if (body.metaTitle !== undefined) addSet('"metaTitle"', body.metaTitle || null);
    if (body.metaDesc !== undefined) addSet('"metaDesc"', body.metaDesc || null);
    if (body.metaKeywords !== undefined) addSet('"metaKeywords"', body.metaKeywords || null);
    if (body.ogImageUrl !== undefined) addSet('"ogImageUrl"', body.ogImageUrl || null);
    if (body.isPublished !== undefined) addSet('"isPublished"', body.isPublished);
    if (body.sortOrder !== undefined) addSet('"sortOrder"', body.sortOrder);

    // Set publishedAt on first publish
    const wasUnpublished = !existing.isPublished;
    const nowPublishing = body.isPublished === true;
    if (wasUnpublished && nowPublishing) {
      addSet('"publishedAt"', new Date());
    }

    // Always update updatedAt
    addSet('"updatedAt"', new Date());

    if (sets.length === 1) {
      // Only updatedAt was set — no actual changes from body
      // Still return current page data
    }

    values.push(id);
    const setClause = sets.join(", ");
    const query = `
      UPDATE "Page"
      SET ${setClause}
      WHERE id = $${values.length}
      RETURNING ${PAGE_COLUMNS}
    `;

    const [page] = await sql.unsafe(query, values);

    return Response.json({ page });
  } catch (error) {
    console.error("Page PUT error:", error);
    return serverError("Failed to update page");
  }
}

// DELETE /api/admin/pages/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const { id } = await params;
    const sql = getSql();

    const [existing] = await sql`
      SELECT id FROM "Page" WHERE id = ${id}
    `;
    if (!existing) {
      return notFound("Page not found");
    }

    await sql`
      DELETE FROM "Page" WHERE id = ${id}
    `;

    return Response.json({ message: "Page deleted successfully" });
  } catch (error) {
    console.error("Page DELETE error:", error);
    return serverError("Failed to delete page");
  }
}
