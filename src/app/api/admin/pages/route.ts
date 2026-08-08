/**
 * API: Pages — CRUD endpoints for dynamic page management
 * Wedabime Pramukayo CMS
 *
 * Uses @neondatabase/serverless directly (Prisma incompatible with CF Workers)
 */

import { NextRequest } from "next/server";
import {
  getSql,
  generateId,
  requireAuth,
  unauthorized,
  badRequest,
  conflict,
  serverError,
} from "@/lib/neon-sql";

// GET /api/admin/pages — List all pages
export async function GET() {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const sql = getSql();
    const pages = await sql`
      SELECT
        id, slug, title,
        "heroTitle", "heroSubtitle", "heroImageUrl",
        content,
        "metaTitle", "metaDesc", "metaKeywords", "ogImageUrl",
        "isPublished", "publishedAt", "sortOrder",
        "createdAt", "updatedAt"
      FROM "Page"
      ORDER BY "sortOrder" ASC
    `;

    return Response.json({ pages });
  } catch (error) {
    console.error("Pages GET error:", error);
    return serverError("Failed to fetch pages");
  }
}

// POST /api/admin/pages — Create a new page
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const body = await request.json();
    const {
      slug,
      title,
      heroTitle,
      heroSubtitle,
      heroImageUrl,
      content,
      metaTitle,
      metaDesc,
      metaKeywords,
      ogImageUrl,
      isPublished,
      sortOrder,
    } = body;

    if (!slug || !title || !content) {
      return badRequest("Slug, title, and content are required");
    }

    const sql = getSql();

    // Check for duplicate slug
    const [existing] = await sql`
      SELECT id FROM "Page" WHERE slug = ${slug}
    `;
    if (existing) {
      return conflict("A page with this slug already exists");
    }

    const id = generateId();
    const published = isPublished ?? true;
    const order = sortOrder ?? 0;

    const [page] = await sql`
      INSERT INTO "Page" (
        id, slug, title,
        "heroTitle", "heroSubtitle", "heroImageUrl",
        content,
        "metaTitle", "metaDesc", "metaKeywords", "ogImageUrl",
        "isPublished", "publishedAt", "sortOrder",
        "createdAt", "updatedAt"
      ) VALUES (
        ${id}, ${slug}, ${title},
        ${heroTitle || null}, ${heroSubtitle || null}, ${heroImageUrl || null},
        ${content},
        ${metaTitle || null}, ${metaDesc || null}, ${metaKeywords || null}, ${ogImageUrl || null},
        ${published}, ${published ? new Date() : null}, ${order},
        NOW(), NOW()
      )
      RETURNING
        id, slug, title,
        "heroTitle", "heroSubtitle", "heroImageUrl",
        content,
        "metaTitle", "metaDesc", "metaKeywords", "ogImageUrl",
        "isPublished", "publishedAt", "sortOrder",
        "createdAt", "updatedAt"
    `;

    return Response.json({ page }, { status: 201 });
  } catch (error) {
    console.error("Pages POST error:", error);
    return serverError("Failed to create page");
  }
}
