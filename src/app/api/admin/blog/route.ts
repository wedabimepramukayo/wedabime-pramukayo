/**
 * API: Blog Posts — CRUD endpoints for blog management
 * Wedabime Pramukayo CMS
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/admin/blog — List all blog posts
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const posts = await db.blogPost.findMany({
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Blog GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog posts" },
      { status: 500 }
    );
  }
}

// POST /api/admin/blog — Create a new blog post
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      slug,
      title,
      excerpt,
      content,
      coverImageUrl,
      author,
      tags,
      metaTitle,
      metaDesc,
      metaKeywords,
      ogImageUrl,
      isPublished,
    } = body;

    if (!slug || !title || !content) {
      return NextResponse.json(
        { error: "Slug, title, and content are required" },
        { status: 400 }
      );
    }

    // Check for duplicate slug
    const existing = await db.blogPost.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "A blog post with this slug already exists" },
        { status: 409 }
      );
    }

    const post = await db.blogPost.create({
      data: {
        slug,
        title,
        excerpt: excerpt || null,
        content,
        coverImageUrl: coverImageUrl || null,
        author: author || session.user?.name || "Admin",
        tags: tags ? (typeof tags === "object" ? JSON.stringify(tags) : tags) : null,
        metaTitle: metaTitle || null,
        metaDesc: metaDesc || null,
        metaKeywords: metaKeywords || null,
        ogImageUrl: ogImageUrl || null,
        isPublished: isPublished ?? false,
        publishedAt: isPublished ? new Date() : null,
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error("Blog POST error:", error);
    return NextResponse.json(
      { error: "Failed to create blog post" },
      { status: 500 }
    );
  }
}
