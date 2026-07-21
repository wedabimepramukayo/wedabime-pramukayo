/**
 * API: Single Blog Post — GET, PUT, DELETE by ID
 * Wedabime Pramukayo CMS
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/admin/blog/[id]
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
    const post = await db.blogPost.findUnique({ where: { id } });

    if (!post) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Blog post GET error:", error);
    return NextResponse.json({ error: "Failed to fetch blog post" }, { status: 500 });
  }
}

// PUT /api/admin/blog/[id]
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

    const existing = await db.blogPost.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }

    if (body.slug && body.slug !== existing.slug) {
      const slugConflict = await db.blogPost.findUnique({ where: { slug: body.slug } });
      if (slugConflict) {
        return NextResponse.json({ error: "A blog post with this slug already exists" }, { status: 409 });
      }
    }

    const wasUnpublished = !existing.isPublished;
    const nowPublishing = body.isPublished === true;
    const shouldSetPublishedAt = wasUnpublished && nowPublishing;

    const tags = body.tags !== undefined
      ? (typeof body.tags === "object" ? JSON.stringify(body.tags) : body.tags || null)
      : undefined;

    const post = await db.blogPost.update({
      where: { id },
      data: {
        ...(body.slug !== undefined && { slug: body.slug }),
        ...(body.title !== undefined && { title: body.title }),
        ...(body.excerpt !== undefined && { excerpt: body.excerpt || null }),
        ...(body.content !== undefined && { content: body.content }),
        ...(body.coverImageUrl !== undefined && { coverImageUrl: body.coverImageUrl || null }),
        ...(body.author !== undefined && { author: body.author || null }),
        ...(tags !== undefined && { tags }),
        ...(body.metaTitle !== undefined && { metaTitle: body.metaTitle || null }),
        ...(body.metaDesc !== undefined && { metaDesc: body.metaDesc || null }),
        ...(body.metaKeywords !== undefined && { metaKeywords: body.metaKeywords || null }),
        ...(body.ogImageUrl !== undefined && { ogImageUrl: body.ogImageUrl || null }),
        ...(body.isPublished !== undefined && { isPublished: body.isPublished }),
        ...(shouldSetPublishedAt && { publishedAt: new Date() }),
      },
    });

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Blog post PUT error:", error);
    return NextResponse.json({ error: "Failed to update blog post" }, { status: 500 });
  }
}

// DELETE /api/admin/blog/[id]
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
    const existing = await db.blogPost.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }

    await db.blogPost.delete({ where: { id } });
    return NextResponse.json({ message: "Blog post deleted successfully" });
  } catch (error) {
    console.error("Blog post DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete blog post" }, { status: 500 });
  }
}
