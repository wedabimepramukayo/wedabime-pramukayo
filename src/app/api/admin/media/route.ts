/**
 * API: Media — List and delete media (Cloudinary URLs)
 * Wedabime Pramukayo CMS — Cloudinary Integration
 *
 * GET: List all media records (URLs from DB, thumbnails via Cloudinary)
 * DELETE: Remove from Cloudinary + delete URL record from DB
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { deleteFromCloudinary } from "@/lib/cloudinary";

// GET /api/admin/media — List all media with pagination
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const folder = searchParams.get("folder") || "";

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (search) {
      where.OR = [
        { filename: { contains: search } },
        { altText: { contains: search } },
        { cloudinaryId: { contains: search } },
      ];
    }
    if (folder) {
      where.folder = folder;
    }

    const [media, total] = await Promise.all([
      db.media.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.media.count({ where }),
    ]);

    // Add thumbnail URLs using Cloudinary transformation
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const mediaWithThumbnails = media.map((item) => ({
      ...item,
      thumbnailUrl: item.cloudinaryId
        ? `https://res.cloudinary.com/${cloudName}/image/upload/c_fill,w_300,h_300,q_auto:low/${item.cloudinaryId}`
        : item.url,
      optimizedUrl: item.cloudinaryId
        ? `https://res.cloudinary.com/${cloudName}/image/upload/q_auto:good,f_auto/${item.cloudinaryId}`
        : item.url,
    }));

    return NextResponse.json({
      media: mediaWithThumbnails,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Media GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch media" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/media — Delete media (Cloudinary + DB)
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

    // Delete from Cloudinary if cloudinaryId exists
    if (media.cloudinaryId) {
      const deleted = await deleteFromCloudinary(media.cloudinaryId);
      if (!deleted) {
        console.warn(
          `Failed to delete from Cloudinary: ${media.cloudinaryId}. Proceeding with DB cleanup.`
        );
      }
    }

    // Delete the DB record (URL only)
    await db.media.delete({ where: { id } });

    return NextResponse.json({
      message: "Media deleted successfully",
      cloudinaryDeleted: !!media.cloudinaryId,
    });
  } catch (error) {
    console.error("Media DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete media" },
      { status: 500 }
    );
  }
}
