/**
 * API: Single Category — GET, PUT, DELETE by ID
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
} from "@/lib/neon-sql";

// GET /api/admin/categories/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const { id } = await params;
    const sql = getSql();

    // Fetch category with product count
    const [categoryRow] = await sql`
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
      WHERE c.id = ${id}
      GROUP BY c.id
    `;

    if (!categoryRow) {
      return notFound("Category not found");
    }

    // Fetch products in this category
    const products = await sql`
      SELECT id, name, slug
      FROM "Product"
      WHERE "categoryId" = ${id}
      ORDER BY "sortOrder" ASC
    `;

    const category = {
      id: categoryRow.id,
      slug: categoryRow.slug,
      name: categoryRow.name,
      description: categoryRow.description,
      icon: categoryRow.icon,
      imageUrl: categoryRow.imageUrl,
      sortOrder: categoryRow.sortOrder,
      isActive: categoryRow.isActive,
      createdAt: categoryRow.createdAt,
      updatedAt: categoryRow.updatedAt,
      _count: {
        products: Number(categoryRow._count_products),
      },
      products,
    };

    return NextResponse.json({ category });
  } catch (error) {
    console.error("Category GET error:", error);
    return serverError("Failed to fetch category");
  }
}

// PUT /api/admin/categories/[id]
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

    // Check category exists
    const [existing] = await sql`
      SELECT id, slug FROM "ProductCategory" WHERE id = ${id}
    `;
    if (!existing) {
      return notFound("Category not found");
    }

    // Check slug conflict if changing slug
    if (body.slug && body.slug !== existing.slug) {
      const [slugConflict] = await sql`
        SELECT id FROM "ProductCategory" WHERE slug = ${body.slug}
      `;
      if (slugConflict) {
        return conflict("A category with this slug already exists");
      }
    }

    // Determine which fields to update
    const hasSlug = body.slug !== undefined;
    const hasName = body.name !== undefined;
    const hasDescription = body.description !== undefined;
    const hasIcon = body.icon !== undefined;
    const hasImageUrl = body.imageUrl !== undefined;
    const hasSortOrder = body.sortOrder !== undefined;
    const hasIsActive = body.isActive !== undefined;

    const [category] = await sql`
      UPDATE "ProductCategory"
      SET
        slug        = CASE WHEN ${hasSlug} THEN ${body.slug ?? null} ELSE slug END,
        name        = CASE WHEN ${hasName} THEN ${body.name ?? null} ELSE name END,
        description = CASE WHEN ${hasDescription} THEN ${body.description || null} ELSE description END,
        icon        = CASE WHEN ${hasIcon} THEN ${body.icon || null} ELSE icon END,
        "imageUrl"  = CASE WHEN ${hasImageUrl} THEN ${body.imageUrl || null} ELSE "imageUrl" END,
        "sortOrder" = CASE WHEN ${hasSortOrder} THEN ${body.sortOrder ?? 0} ELSE "sortOrder" END,
        "isActive"  = CASE WHEN ${hasIsActive} THEN ${body.isActive ?? true} ELSE "isActive" END,
        "updatedAt" = NOW()
      WHERE id = ${id}
      RETURNING
        id, slug, name, description, icon, "imageUrl", "sortOrder", "isActive", "createdAt", "updatedAt"
    `;

    return NextResponse.json({ category });
  } catch (error) {
    console.error("Category PUT error:", error);
    return serverError("Failed to update category");
  }
}

// DELETE /api/admin/categories/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const { id } = await params;
    const sql = getSql();

    // Check category exists with product count
    const [existing] = await sql`
      SELECT
        c.id,
        COUNT(p.id) AS "_count_products"
      FROM "ProductCategory" c
      LEFT JOIN "Product" p ON p."categoryId" = c.id
      WHERE c.id = ${id}
      GROUP BY c.id
    `;

    if (!existing) {
      return notFound("Category not found");
    }

    const productCount = Number(existing._count_products);
    if (productCount > 0) {
      return conflict(
        `Cannot delete category with ${productCount} services. Reassign or delete them first.`
      );
    }

    await sql`
      DELETE FROM "ProductCategory" WHERE id = ${id}
    `;

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Category DELETE error:", error);
    return serverError("Failed to delete category");
  }
}
