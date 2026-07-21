/**
 * API: Upload — Upload images to Cloudinary, store URL in DB
 * Wedabime Pramukayo CMS — Edge-compatible (Cloudflare Pages)
 *
 * POST: Upload image file → Cloudinary → save URL to DB
 * Uses fetch-based upload (no Node.js streams)
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadToCloudinary, isCloudinaryConfigured } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

// POST /api/admin/upload — Upload an image
export async function POST(request: NextRequest) {
  try {
    // Auth check
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check Cloudinary configuration
    if (!isCloudinaryConfigured()) {
      return NextResponse.json(
        { error: "Cloudinary is not configured. Check environment variables." },
        { status: 500 }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || undefined;
    const altText = (formData.get("altText") as string) || null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided. Use 'file' field in multipart form." },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Invalid file type: ${file.type}. Allowed: ${allowedTypes.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Max: 10MB` },
        { status: 400 }
      );
    }

    // Read file as ArrayBuffer (Edge-compatible)
    const fileData = await file.arrayBuffer();

    // Upload to Cloudinary
    const result = await uploadToCloudinary(fileData, file.name, file.type, {
      folder,
    });

    // Save URL to database (only URL, no binary)
    const media = await db.media.create({
      data: {
        url: result.secureUrl,
        cloudinaryId: result.cloudinaryId,
        altText: altText || file.name,
        filename: file.name,
        mimeType: result.mimeType,
        fileSize: result.fileSize,
        width: result.width,
        height: result.height,
        folder: result.folder,
        uploadedBy: (session.user as any)?.id || null,
      },
    });

    return NextResponse.json(
      {
        message: "Upload successful",
        media: {
          ...media,
          thumbnailUrl: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/c_fill,w_300,h_300,q_auto:low/${result.cloudinaryId}`,
          optimizedUrl: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/q_auto:good,f_auto/${result.cloudinaryId}`,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Upload error:", error);
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
