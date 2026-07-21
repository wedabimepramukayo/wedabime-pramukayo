/**
 * API: Media Upload — Upload images to Cloudinary, store only URLs in DB
 * Wedabime Pramukayo CMS — Cloudinary Integration
 *
 * Flow: FormData → Cloudinary upload → Get URL → Store URL in DB
 * This keeps the database lightweight — no binary data stored.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  uploadToCloudinary,
  isCloudinaryConfigured,
} from "@/lib/cloudinary";

// POST /api/admin/upload — Upload a file to Cloudinary
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify Cloudinary is configured
    if (!isCloudinaryConfigured()) {
      return NextResponse.json(
        { error: "Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment variables." },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const altText = formData.get("altText") as string | null;
    const folder = formData.get("folder") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF, SVG" },
        { status: 400 }
      );
    }

    // Validate file size (10MB max for Cloudinary)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size: 10MB" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const cloudinaryResult = await uploadToCloudinary(
      buffer,
      file.name,
      file.type,
      folder ? { folder: folder } : undefined
    );

    // Save only the URL and metadata to database
    const media = await db.media.create({
      data: {
        url: cloudinaryResult.secureUrl,
        cloudinaryId: cloudinaryResult.cloudinaryId,
        altText: altText || null,
        filename: file.name,
        mimeType: cloudinaryResult.mimeType,
        fileSize: cloudinaryResult.fileSize,
        width: cloudinaryResult.width,
        height: cloudinaryResult.height,
        folder: cloudinaryResult.folder,
        uploadedBy: (session.user as any)?.id || null,
      },
    });

    return NextResponse.json(
      {
        media,
        url: cloudinaryResult.secureUrl,
        cloudinaryId: cloudinaryResult.cloudinaryId,
        thumbnailUrl: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/c_fill,w_300,h_300,q_auto:low/${cloudinaryResult.cloudinaryId}`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload file" },
      { status: 500 }
    );
  }
}
