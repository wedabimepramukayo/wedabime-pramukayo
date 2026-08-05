/**
 * API: Upload — Canonical image upload endpoint for admin
 * Wedabime Pramukayo CMS
 *
 * POST: Accept FormData with file + optional folder + altText
 * Uploads to Cloudinary and saves Media record to DB
 * Returns the media record JSON
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";

// POST /api/admin/upload — Upload a file and create Media record
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || undefined;
    const altText = (formData.get("altText") as string) || null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided. Use 'file' field in FormData." },
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
      "image/avif",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}. Allowed: ${allowedTypes.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum: 10MB.` },
        { status: 400 }
      );
    }

    // Read file as ArrayBuffer
    const fileData = await file.arrayBuffer();

    // Upload to Cloudinary
    const result = await uploadToCloudinary(fileData, file.name, file.type, {
      folder,
    });

    // Save Media record to database
    const media = await db.media.create({
      data: {
        url: result.secureUrl,
        cloudinaryId: result.cloudinaryId,
        altText,
        filename: file.name,
        mimeType: result.mimeType,
        fileSize: result.fileSize,
        width: result.width,
        height: result.height,
        folder: result.folder,
        uploadedBy: (session.user as any)?.id || null,
      },
    });

    return NextResponse.json({ media }, { status: 201 });
  } catch (error) {
    console.error("Upload POST error:", error);
    const message = error instanceof Error ? error.message : "Failed to upload file";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
