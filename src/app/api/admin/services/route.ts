/**
 * API: Services (Products) — CRUD endpoints for service management
 * Wedabime Pramukayo CMS
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/admin/services — List all services with category info
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const categoryId = url.searchParams.get("categoryId");

    const services = await db.product.findMany({
      where: categoryId ? { categoryId } : undefined,
      orderBy: { sortOrder: "asc" },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json({ services });
  } catch (error) {
    console.error("Services GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}

// POST /api/admin/services — Create a new service
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
      return NextResponse.json(
        { error: "Slug, name, and description are required" },
        { status: 400 }
      );
    }

    // Check for duplicate slug
    const existing = await db.product.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "A service with this slug already exists" },
        { status: 409 }
      );
    }

    const service = await db.product.create({
      data: {
        slug,
        name,
        subtitle: subtitle || null,
        description,
        features: typeof features === "object" ? JSON.stringify(features) : (features || "[]"),
        advantages: advantages
          ? (typeof advantages === "object" ? JSON.stringify(advantages) : advantages)
          : null,
        specifications: specifications
          ? (typeof specifications === "object" ? JSON.stringify(specifications) : specifications)
          : null,
        mainImageUrl: mainImageUrl || null,
        gallery: gallery
          ? (typeof gallery === "object" ? JSON.stringify(gallery) : gallery)
          : null,
        categoryId: categoryId || null,
        metaTitle: metaTitle || null,
        metaDesc: metaDesc || null,
        metaKeywords: metaKeywords || null,
        ogImageUrl: ogImageUrl || null,
        isFeatured: isFeatured ?? false,
        isPublished: isPublished ?? true,
        publishedAt: isPublished ? new Date() : null,
        sortOrder: sortOrder ?? 0,
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json({ service }, { status: 201 });
  } catch (error) {
    console.error("Services POST error:", error);
    return NextResponse.json(
      { error: "Failed to create service" },
      { status: 500 }
    );
  }
}
