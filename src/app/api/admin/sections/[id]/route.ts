/**
 * API: Content Section by ID — GET, PUT, DELETE
 * /api/admin/sections/[id]
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/admin/sections/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const section = await db.contentSection.findUnique({ where: { id } });

    if (!section) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    return NextResponse.json({ section });
  } catch (error) {
    console.error("Section GET error:", error);
    return NextResponse.json({ error: "Failed to fetch section" }, { status: 500 });
  }
}

// PUT /api/admin/sections/[id]
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

    // Check if section exists
    const existing = await db.contentSection.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    // If sectionKey or pageSlug is being changed, check for unique constraint
    if (body.sectionKey || body.pageSlug) {
      const newPageSlug = body.pageSlug || existing.pageSlug;
      const newSectionKey = body.sectionKey || existing.sectionKey;
      if (newPageSlug !== existing.pageSlug || newSectionKey !== existing.sectionKey) {
        const duplicate = await db.contentSection.findUnique({
          where: { pageSlug_sectionKey: { pageSlug: newPageSlug, sectionKey: newSectionKey } },
        });
        if (duplicate) {
          return NextResponse.json(
            { error: "A section with this pageSlug + sectionKey already exists" },
            { status: 409 }
          );
        }
      }
    }

    const section = await db.contentSection.update({
      where: { id },
      data: {
        ...(body.pageSlug !== undefined && { pageSlug: body.pageSlug }),
        ...(body.sectionKey !== undefined && { sectionKey: body.sectionKey }),
        ...(body.type !== undefined && { type: body.type }),
        ...(body.title !== undefined && { title: body.title || null }),
        ...(body.subtitle !== undefined && { subtitle: body.subtitle || null }),
        ...(body.content !== undefined && { content: body.content || null }),
        ...(body.items !== undefined && { items: body.items || null }),
        ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl || null }),
        ...(body.linkUrl !== undefined && { linkUrl: body.linkUrl || null }),
        ...(body.linkText !== undefined && { linkText: body.linkText || null }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.settings !== undefined && { settings: body.settings || null }),
      },
    });

    return NextResponse.json({ section });
  } catch (error) {
    console.error("Section PUT error:", error);
    return NextResponse.json({ error: "Failed to update section" }, { status: 500 });
  }
}

// DELETE /api/admin/sections/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await db.contentSection.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    await db.contentSection.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Section DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete section" }, { status: 500 });
  }
}
