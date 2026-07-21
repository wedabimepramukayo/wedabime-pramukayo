/**
 * API: Pages — CRUD endpoints for dynamic page management
 * Wedabime Pramukayo CMS
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/admin/pages — List all pages
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pages = await db.page.findMany({
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ pages });
  } catch (error) {
    console.error("Pages GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch pages" },
      { status: 500 }
    );
  }
}

// POST /api/admin/pages — Create a new page
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
      return NextResponse.json(
        { error: "Slug, title, and content are required" },
        { status: 400 }
      );
    }

    // Check for duplicate slug
    const existing = await db.page.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "A page with this slug already exists" },
        { status: 409 }
      );
    }

    const page = await db.page.create({
      data: {
        slug,
        title,
        heroTitle: heroTitle || null,
        heroSubtitle: heroSubtitle || null,
        heroImageUrl: heroImageUrl || null,
        content,
        metaTitle: metaTitle || null,
        metaDesc: metaDesc || null,
        metaKeywords: metaKeywords || null,
        ogImageUrl: ogImageUrl || null,
        isPublished: isPublished ?? true,
        publishedAt: isPublished ? new Date() : null,
        sortOrder: sortOrder ?? 0,
      },
    });

    return NextResponse.json({ page }, { status: 201 });
  } catch (error) {
    console.error("Pages POST error:", error);
    return NextResponse.json(
      { error: "Failed to create page" },
      { status: 500 }
    );
  }
}
