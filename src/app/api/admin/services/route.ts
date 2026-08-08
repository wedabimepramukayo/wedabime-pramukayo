/**
 * API: Services (Products) — CRUD endpoints for service management
 * Wedabime Pramukayo CMS
 *
 * Converted from Prisma to Neon direct SQL for Cloudflare Workers compatibility.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getSql,
  generateId,
  requireAuth,
  unauthorized,
  badRequest,
  conflict,
  serverError,
  jsonStringify,
} from "@/lib/neon-sql";

/**
 * Build a service object with nested category from a flat JOIN row.
 * This preserves the same response shape as the Prisma version.
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

// GET /api/admin/services — List all services with category info
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const url = new URL(request.url);
    const categoryId = url.searchParams.get("categoryId");

    const sql = getSql();

    const rows = categoryId
      ? await sql`
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
          WHERE p."categoryId" = ${categoryId}
          ORDER BY p."sortOrder" ASC
        `
      : await sql`
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
          ORDER BY p."sortOrder" ASC
        `;

    const services = rows.map((row: Record<string, unknown>) => buildServiceRow(row));

    return NextResponse.json({ services });
  } catch (error) {
    console.error("Services GET error:", error);
    return serverError("Failed to fetch services");
  }
}

// POST /api/admin/services — Create a new service
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const body = await request.json();
    const {
      slug,
      name,
      subtitle,
      description,
      features,
      advantages,
      specifications,
      mainImageUrl,
      gallery,
      categoryId,
      metaTitle,
      metaDesc,
      metaKeywords,
      ogImageUrl,
      isFeatured,
      isPublished,
      sortOrder,
    } = body;

    if (!slug || !name || !description) {
      return badRequest("Slug, name, and description are required");
    }

    const sql = getSql();

    // Check for duplicate slug
    const [existing] = await sql`
      SELECT id FROM "Product" WHERE slug = ${slug}
    `;
    if (existing) {
      return conflict("A service with this slug already exists");
    }

    const id = generateId();
    const nowPublished = isPublished ?? true;

    const [row] = await sql`
      INSERT INTO "Product" (
        id, slug, name, subtitle, description, features, advantages, specifications,
        "mainImageUrl", gallery, "categoryId",
        "metaTitle", "metaDesc", "metaKeywords", "ogImageUrl",
        "isFeatured", "isPublished", "publishedAt", "sortOrder",
        "createdAt", "updatedAt"
      ) VALUES (
        ${id},
        ${slug},
        ${name},
        ${subtitle || null},
        ${description},
        ${jsonStringify(features) || "[]"},
        ${jsonStringify(advantages)},
        ${jsonStringify(specifications)},
        ${mainImageUrl || null},
        ${jsonStringify(gallery)},
        ${categoryId || null},
        ${metaTitle || null},
        ${metaDesc || null},
        ${metaKeywords || null},
        ${ogImageUrl || null},
        ${isFeatured ?? false},
        ${nowPublished},
        ${nowPublished ? new Date().toISOString() : null},
        ${sortOrder ?? 0},
        NOW(),
        NOW()
      )
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

    return NextResponse.json({ service }, { status: 201 });
  } catch (error) {
    console.error("Services POST error:", error);
    return serverError("Failed to create service");
  }
}
