/**
 * API: Media — List and delete media files
 * Wedabime Pramukayo CMS
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { unlink } from "fs/promises";
import path from "path";

// GET /api/admin/media — List all media
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const media = await db.media.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ media });
  } catch (error) {
    console.error("Media GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch media" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/media — Delete media by ID
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Media ID required" }, { status: 400 });
    }

    const media = await db.media.findUnique({ where: { id } });
    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    // Try to delete the file from disk
    try {
      const filepath = path.join(process.cwd(), "public", media.url);
      await unlink(filepath);
    } catch {
      // File may already be deleted, continue with DB cleanup
    }

    await db.media.delete({ where: { id } });

    return NextResponse.json({ message: "Media deleted successfully" });
  } catch (error) {
    console.error("Media DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete media" },
      { status: 500 }
    );
  }
}
