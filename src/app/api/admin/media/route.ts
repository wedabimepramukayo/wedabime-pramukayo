/**
 * API: Media — List and delete media (Cloudinary URLs)
 * Wedabime Pramukayo CMS — Cloudinary Integration
 *
 * GET: List all media records (URLs from DB, thumbnails via Cloudinary)
 * DELETE: Remove from Cloudinary + delete URL record from DB
 *
 * Converted from Prisma to Neon direct SQL for Cloudflare Workers compatibility.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSql, requireAuth, unauthorized, badRequest, notFound, serverError } from "@/lib/neon-sql";
import { deleteFromCloudinary } from "@/lib/cloudinary";

// GET /api/admin/media — List all media with pagination
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const sql = getSql();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const folder = searchParams.get("folder") || "";

    const offset = (page - 1) * limit;

    // Build dynamic WHERE clause using sql fragment composition
    const searchPattern = `%${search}%`;
    let whereFragment: ReturnType<typeof sql>;

    if (search && folder) {
      whereFragment = sql`WHERE ("filename" ILIKE ${searchPattern} OR "altText" ILIKE ${searchPattern} OR "cloudinaryId" ILIKE ${searchPattern}) AND "folder" = ${folder}`;
    } else if (search) {
      whereFragment = sql`WHERE "filename" ILIKE ${searchPattern} OR "altText" ILIKE ${searchPattern} OR "cloudinaryId" ILIKE ${searchPattern}`;
    } else if (folder) {
      whereFragment = sql`WHERE "folder" = ${folder}`;
    } else {
      whereFragment = sql``;
    }

    const [mediaRows, countRows] = await Promise.all([
      sql`
        SELECT id, url, "cloudinaryId", "altText", filename, "mimeType", "fileSize", width, height, folder, "uploadedBy", "createdAt"
        FROM "Media"
        ${whereFragment}
        ORDER BY "createdAt" DESC
        LIMIT ${limit} OFFSET ${offset}
      `,
      sql`
        SELECT COUNT(*)::int AS count
        FROM "Media"
        ${whereFragment}
      `,
    ]);

    const total = countRows[0]?.count ?? 0;

    // Add thumbnail URLs using Cloudinary transformation
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const mediaWithThumbnails = (mediaRows as Record<string, unknown>[]).map((item) => ({
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
    return serverError("Failed to fetch media");
  }
}

// DELETE /api/admin/media — Delete media (Cloudinary + DB)
export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const sql = getSql();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return badRequest("Media ID required");

    const rows = await sql`
      SELECT id, url, "cloudinaryId", "altText", filename, "mimeType", "fileSize", width, height, folder, "uploadedBy", "createdAt"
      FROM "Media"
      WHERE id = ${id}
    `;

    if (rows.length === 0) return notFound("Media not found");

    const media = rows[0] as Record<string, unknown>;

    // Delete from Cloudinary if cloudinaryId exists
    if (media.cloudinaryId) {
      const deleted = await deleteFromCloudinary(media.cloudinaryId as string);
      if (!deleted) {
        console.warn(
          `Failed to delete from Cloudinary: ${media.cloudinaryId}. Proceeding with DB cleanup.`
        );
      }
    }

    // Delete the DB record
    await sql`DELETE FROM "Media" WHERE id = ${id}`;

    return NextResponse.json({
      message: "Media deleted successfully",
      cloudinaryDeleted: !!media.cloudinaryId,
    });
  } catch (error) {
    console.error("Media DELETE error:", error);
    return serverError("Failed to delete media");
  }
}
