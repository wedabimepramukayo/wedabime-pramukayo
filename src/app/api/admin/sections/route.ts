/**
 * API: Content Sections — List by pageSlug, Create
 * GET /api/admin/sections?pageSlug=home
 * POST /api/admin/sections
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/admin/sections — List sections by pageSlug
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const pageSlug = searchParams.get("pageSlug") || "home";

    const sections = await db.contentSection.findMany({
      where: { pageSlug },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ sections });
  } catch (error) {
    console.error("Sections GET error:", error);
    return NextResponse.json({ error: "Failed to fetch sections" }, { status: 500 });
  }
}

// POST /api/admin/sections — Create a new section
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      pageSlug,
      sectionKey,
      type,
      title,
      subtitle,
      content,
      items,
      imageUrl,
      linkUrl,
      linkText,
      sortOrder,
      isActive,
      settings,
    } = body;

    if (!pageSlug || !sectionKey || !type) {
      return NextResponse.json(
        { error: "pageSlug, sectionKey, and type are required" },
        { status: 400 }
      );
    }

    // Check for duplicate [pageSlug, sectionKey]
    const existing = await db.contentSection.findUnique({
      where: { pageSlug_sectionKey: { pageSlug, sectionKey } },
    });
    if (existing) {
      return NextResponse.json(
        { error: "A section with this pageSlug + sectionKey already exists" },
        { status: 409 }
      );
    }

    const section = await db.contentSection.create({
      data: {
        pageSlug,
        sectionKey,
        type,
        title: title || null,
        subtitle: subtitle || null,
        content: content || null,
        items: items || null,
        imageUrl: imageUrl || null,
        linkUrl: linkUrl || null,
        linkText: linkText || null,
        sortOrder: sortOrder ?? 0,
        isActive: isActive ?? true,
        settings: settings || null,
      },
    });

    return NextResponse.json({ section }, { status: 201 });
  } catch (error) {
    console.error("Sections POST error:", error);
    return NextResponse.json({ error: "Failed to create section" }, { status: 500 });
  }
}
