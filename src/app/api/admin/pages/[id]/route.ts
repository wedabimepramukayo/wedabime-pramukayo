/**
 * API: Single Page — GET, PUT, DELETE by ID
 * Wedabime Pramukayo CMS
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/admin/pages/[id]
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
    const page = await db.page.findUnique({ where: { id } });

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json({ page });
  } catch (error) {
    console.error("Page GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch page" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/pages/[id] — Update a page
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

    const existing = await db.page.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    if (body.slug && body.slug !== existing.slug) {
      const slugConflict = await db.page.findUnique({ where: { slug: body.slug } });
      if (slugConflict) {
        return NextResponse.json({ error: "A page with this slug already exists" }, { status: 409 });
      }
    }

    const wasUnpublished = !existing.isPublished;
    const nowPublishing = body.isPublished === true;
    const shouldSetPublishedAt = wasUnpublished && nowPublishing;

    const page = await db.page.update({
      where: { id },
      data: {
        ...(body.slug !== undefined && { slug: body.slug }),
        ...(body.title !== undefined && { title: body.title }),
        ...(body.heroTitle !== undefined && { heroTitle: body.heroTitle || null }),
        ...(body.heroSubtitle !== undefined && { heroSubtitle: body.heroSubtitle || null }),
        ...(body.heroImageUrl !== undefined && { heroImageUrl: body.heroImageUrl || null }),
        ...(body.content !== undefined && { content: body.content }),
        ...(body.metaTitle !== undefined && { metaTitle: body.metaTitle || null }),
        ...(body.metaDesc !== undefined && { metaDesc: body.metaDesc || null }),
        ...(body.metaKeywords !== undefined && { metaKeywords: body.metaKeywords || null }),
        ...(body.ogImageUrl !== undefined && { ogImageUrl: body.ogImageUrl || null }),
        ...(body.isPublished !== undefined && { isPublished: body.isPublished }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
        ...(shouldSetPublishedAt && { publishedAt: new Date() }),
      },
    });

    return NextResponse.json({ page });
  } catch (error) {
    console.error("Page PUT error:", error);
    return NextResponse.json({ error: "Failed to update page" }, { status: 500 });
  }
}

// DELETE /api/admin/pages/[id]
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
    const existing = await db.page.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    await db.page.delete({ where: { id } });
    return NextResponse.json({ message: "Page deleted successfully" });
  } catch (error) {
    console.error("Page DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete page" }, { status: 500 });
  }
}
