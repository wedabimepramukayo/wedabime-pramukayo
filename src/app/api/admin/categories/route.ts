/**
 * API: Categories — CRUD endpoints for service category management
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
} from "@/lib/neon-sql";

// GET /api/admin/categories — List all categories with service counts
export async function GET() {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const sql = getSql();

    const rows = await sql`
      SELECT
        c.id,
        c.slug,
        c.name,
        c.description,
        c.icon,
        c."imageUrl",
        c."sortOrder",
        c."isActive",
        c."createdAt",
        c."updatedAt",
        COUNT(p.id) AS "_count_products"
      FROM "ProductCategory" c
      LEFT JOIN "Product" p ON p."categoryId" = c.id
      GROUP BY c.id
      ORDER BY c."sortOrder" ASC
    `;

    const categories = rows.map((row: Record<string, unknown>) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      description: row.description,
      icon: row.icon,
      imageUrl: row.imageUrl,
      sortOrder: row.sortOrder,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      _count: {
        products: Number(row._count_products),
      },
    }));

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Categories GET error:", error);
    return serverError("Failed to fetch categories");
  }
}

// POST /api/admin/categories — Create a new category
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const body = await request.json();
    const { slug, name, description, icon, imageUrl, sortOrder, isActive } = body;

    if (!slug || !name) {
      return badRequest("Slug and name are required");
    }

    const sql = getSql();

    // Check for duplicate slug
    const [existing] = await sql`
      SELECT id FROM "ProductCategory" WHERE slug = ${slug}
    `;
    if (existing) {
      return conflict("A category with this slug already exists");
    }

    const id = generateId();

    const [category] = await sql`
      INSERT INTO "ProductCategory" (
        id, slug, name, description, icon, "imageUrl", "sortOrder", "isActive", "createdAt", "updatedAt"
      ) VALUES (
        ${id},
        ${slug},
        ${name},
        ${description || null},
        ${icon || null},
        ${imageUrl || null},
        ${sortOrder ?? 0},
        ${isActive ?? true},
        NOW(),
        NOW()
      )
      RETURNING
        id, slug, name, description, icon, "imageUrl", "sortOrder", "isActive", "createdAt", "updatedAt"
    `;

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error("Categories POST error:", error);
    return serverError("Failed to create category");
  }
}
