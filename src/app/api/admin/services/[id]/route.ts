/**
 * API: Single Service (Product) — GET, PUT, DELETE by ID
 * Wedabime Pramukayo CMS
 *
 * Converted from Prisma to Neon direct SQL for Cloudflare Workers compatibility.
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

/**
 * Build a service object with nested category from a flat JOIN row.
 */
function buildServiceRow(row: Record<string, unknown>) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    subtitle: row.subtitle,
    description: row.description,
    features: row.features,
    advantages: row.advantages,
    specifications: row.specifications,
    mainImageUrl: row.mainImageUrl,
    gallery: row.gallery,
    categoryId: row.categoryId,
    metaTitle: row.metaTitle,
    metaDesc: row.metaDesc,
    metaKeywords: row.metaKeywords,
    ogImageUrl: row.ogImageUrl,
    isFeatured: row.isFeatured,
    isPublished: row.isPublished,
    publishedAt: row.publishedAt,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    category: row.category_id
      ? {
          id: row.category_id,
          name: row.category_name,
          slug: row.category_slug,
        }
      : null,
  };
}

// GET /api/admin/services/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const { id } = await params;
    const sql = getSql();

    const [row] = await sql`
      SELECT
        p.id,
        p.slug,
        p.name,
        p.subtitle,
        p.description,
        p.features,
        p.advantages,
        p.specifications,
        p."mainImageUrl",
        p.gallery,
        p."categoryId",
        p."metaTitle",
        p."metaDesc",
        p."metaKeywords",
        p."ogImageUrl",
        p."isFeatured",
        p."isPublished",
        p."publishedAt",
        p."sortOrder",
        p."createdAt",
        p."updatedAt",
        c.id   AS category_id,
        c.name AS category_name,
        c.slug AS category_slug
      FROM "Product" p
      LEFT JOIN "ProductCategory" c ON p."categoryId" = c.id
      WHERE p.id = ${id}
    `;

    if (!row) {
      return notFound("Service not found");
    }

    const service = buildServiceRow(row);

    return NextResponse.json({ service });
  } catch (error) {
    console.error("Service GET error:", error);
    return serverError("Failed to fetch service");
  }
}

// PUT /api/admin/services/[id]
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

    // Check service exists
    const [existing] = await sql`
      SELECT id, slug, "isPublished" FROM "Product" WHERE id = ${id}
    `;
    if (!existing) {
      return notFound("Service not found");
    }

    // Check slug conflict if changing slug
    if (body.slug && body.slug !== existing.slug) {
      const [slugConflict] = await sql`
        SELECT id FROM "Product" WHERE slug = ${body.slug}
      `;
      if (slugConflict) {
        return conflict("A service with this slug already exists");
      }
    }

    // Determine publishedAt: set on first publish (was unpublished, now publishing)
    const wasUnpublished = !existing.isPublished;
    const nowPublishing = body.isPublished === true;
    const shouldSetPublishedAt = wasUnpublished && nowPublishing;

    // Pre-process JSON fields — match original Prisma logic
    const featuresValue =
      body.features !== undefined
        ? jsonStringify(body.features) || "[]"
        : undefined;
    const advantagesValue =
      body.advantages !== undefined
        ? jsonStringify(body.advantages)
        : undefined;
    const specificationsValue =
      body.specifications !== undefined
        ? jsonStringify(body.specifications)
        : undefined;
    const galleryValue =
      body.gallery !== undefined
        ? jsonStringify(body.gallery)
        : undefined;

    // Flags for which fields are present in the update
    const hasSlug = body.slug !== undefined;
    const hasName = body.name !== undefined;
    const hasSubtitle = body.subtitle !== undefined;
    const hasDescription = body.description !== undefined;
    const hasFeatures = featuresValue !== undefined;
    const hasAdvantages = advantagesValue !== undefined;
    const hasSpecifications = specificationsValue !== undefined;
    const hasMainImageUrl = body.mainImageUrl !== undefined;
    const hasGallery = galleryValue !== undefined;
    const hasCategoryId = body.categoryId !== undefined;
    const hasMetaTitle = body.metaTitle !== undefined;
    const hasMetaDesc = body.metaDesc !== undefined;
    const hasMetaKeywords = body.metaKeywords !== undefined;
    const hasOgImageUrl = body.ogImageUrl !== undefined;
    const hasIsFeatured = body.isFeatured !== undefined;
    const hasIsPublished = body.isPublished !== undefined;
    const hasSortOrder = body.sortOrder !== undefined;

    const [row] = await sql`
      UPDATE "Product"
      SET
        slug            = CASE WHEN ${hasSlug} THEN ${body.slug ?? null} ELSE slug END,
        name            = CASE WHEN ${hasName} THEN ${body.name ?? null} ELSE name END,
        subtitle        = CASE WHEN ${hasSubtitle} THEN ${body.subtitle || null} ELSE subtitle END,
        description     = CASE WHEN ${hasDescription} THEN ${body.description ?? null} ELSE description END,
        features        = CASE WHEN ${hasFeatures} THEN ${featuresValue ?? "[]"} ELSE features END,
        advantages      = CASE WHEN ${hasAdvantages} THEN ${advantagesValue ?? null} ELSE advantages END,
        specifications  = CASE WHEN ${hasSpecifications} THEN ${specificationsValue ?? null} ELSE specifications END,
        "mainImageUrl"  = CASE WHEN ${hasMainImageUrl} THEN ${body.mainImageUrl || null} ELSE "mainImageUrl" END,
        gallery         = CASE WHEN ${hasGallery} THEN ${galleryValue ?? null} ELSE gallery END,
        "categoryId"    = CASE WHEN ${hasCategoryId} THEN ${body.categoryId || null} ELSE "categoryId" END,
        "metaTitle"     = CASE WHEN ${hasMetaTitle} THEN ${body.metaTitle || null} ELSE "metaTitle" END,
        "metaDesc"      = CASE WHEN ${hasMetaDesc} THEN ${body.metaDesc || null} ELSE "metaDesc" END,
        "metaKeywords"  = CASE WHEN ${hasMetaKeywords} THEN ${body.metaKeywords || null} ELSE "metaKeywords" END,
        "ogImageUrl"    = CASE WHEN ${hasOgImageUrl} THEN ${body.ogImageUrl || null} ELSE "ogImageUrl" END,
        "isFeatured"    = CASE WHEN ${hasIsFeatured} THEN ${body.isFeatured ?? false} ELSE "isFeatured" END,
        "isPublished"   = CASE WHEN ${hasIsPublished} THEN ${body.isPublished ?? true} ELSE "isPublished" END,
        "publishedAt"   = CASE
                            WHEN ${shouldSetPublishedAt} THEN ${new Date().toISOString()}
                            ELSE "publishedAt"
                          END,
        "sortOrder"     = CASE WHEN ${hasSortOrder} THEN ${body.sortOrder ?? 0} ELSE "sortOrder" END,
        "updatedAt"     = NOW()
      WHERE id = ${id}
      RETURNING
        id, slug, name, subtitle, description, features, advantages, specifications,
        "mainImageUrl", gallery, "categoryId",
        "metaTitle", "metaDesc", "metaKeywords", "ogImageUrl",
        "isFeatured", "isPublished", "publishedAt", "sortOrder",
        "createdAt", "updatedAt"
    `;

    // Fetch category info for the response
    let category = null;
    if (row.categoryId) {
      const [catRow] = await sql`
        SELECT id, name, slug FROM "ProductCategory" WHERE id = ${row.categoryId}
      `;
      if (catRow) {
        category = { id: catRow.id, name: catRow.name, slug: catRow.slug };
      }
    }

    const service = { ...row, category };

    return NextResponse.json({ service });
  } catch (error) {
    console.error("Service PUT error:", error);
    return serverError("Failed to update service");
  }
}

// DELETE /api/admin/services/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const { id } = await params;
    const sql = getSql();

    // Check service exists
    const [existing] = await sql`
      SELECT id FROM "Product" WHERE id = ${id}
    `;
    if (!existing) {
      return notFound("Service not found");
    }

    await sql`
      DELETE FROM "Product" WHERE id = ${id}
    `;

    return NextResponse.json({ message: "Service deleted successfully" });
  } catch (error) {
    console.error("Service DELETE error:", error);
    return serverError("Failed to delete service");
  }
}
