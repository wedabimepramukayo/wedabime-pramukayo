/**
 * API: Single Service (Product) — GET, PUT, DELETE by ID
 * Wedabime Pramukayo CMS
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/admin/services/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const service = await db.product.findUnique({
      where: { id },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json({ service });
  } catch (error) {
    console.error("Service GET error:", error);
    return NextResponse.json({ error: "Failed to fetch service" }, { status: 500 });
  }
}

// PUT /api/admin/services/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    if (body.slug && body.slug !== existing.slug) {
      const slugConflict = await db.product.findUnique({ where: { slug: body.slug } });
      if (slugConflict) {
        return NextResponse.json({ error: "A service with this slug already exists" }, { status: 409 });
      }
    }

    const wasUnpublished = !existing.isPublished;
    const nowPublishing = body.isPublished === true;
    const shouldSetPublishedAt = wasUnpublished && nowPublishing;

    const features = body.features !== undefined
      ? (typeof body.features === "object" ? JSON.stringify(body.features) : body.features)
      : undefined;

    const advantages = body.advantages !== undefined
      ? (typeof body.advantages === "object" ? JSON.stringify(body.advantages) : body.advantages || null)
      : undefined;

    const specifications = body.specifications !== undefined
      ? (typeof body.specifications === "object" ? JSON.stringify(body.specifications) : body.specifications || null)
      : undefined;

    const gallery = body.gallery !== undefined
      ? (typeof body.gallery === "object" ? JSON.stringify(body.gallery) : body.gallery || null)
      : undefined;

    const service = await db.product.update({
      where: { id },
      data: {
        ...(body.slug !== undefined && { slug: body.slug }),
        ...(body.name !== undefined && { name: body.name }),
        ...(body.subtitle !== undefined && { subtitle: body.subtitle || null }),
        ...(body.description !== undefined && { description: body.description }),
        ...(features !== undefined && { features }),
        ...(advantages !== undefined && { advantages }),
        ...(specifications !== undefined && { specifications }),
        ...(body.mainImageUrl !== undefined && { mainImageUrl: body.mainImageUrl || null }),
        ...(gallery !== undefined && { gallery }),
        ...(body.categoryId !== undefined && { categoryId: body.categoryId || null }),
        ...(body.metaTitle !== undefined && { metaTitle: body.metaTitle || null }),
        ...(body.metaDesc !== undefined && { metaDesc: body.metaDesc || null }),
        ...(body.metaKeywords !== undefined && { metaKeywords: body.metaKeywords || null }),
        ...(body.ogImageUrl !== undefined && { ogImageUrl: body.ogImageUrl || null }),
        ...(body.isFeatured !== undefined && { isFeatured: body.isFeatured }),
        ...(body.isPublished !== undefined && { isPublished: body.isPublished }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
        ...(shouldSetPublishedAt && { publishedAt: new Date() }),
      },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });

    return NextResponse.json({ service });
  } catch (error) {
    console.error("Service PUT error:", error);
    return NextResponse.json({ error: "Failed to update service" }, { status: 500 });
  }
}

// DELETE /api/admin/services/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    await db.product.delete({ where: { id } });
    return NextResponse.json({ message: "Service deleted successfully" });
  } catch (error) {
    console.error("Service DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete service" }, { status: 500 });
  }
}
