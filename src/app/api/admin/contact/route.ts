/**
 * Admin Contact Submissions API — Wedabime Pramukayo CMS
 * List, mark as read, and delete contact form submissions
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/admin/contact — List submissions
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const unreadOnly = searchParams.get("unread") === "true";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const [submissions, total, unreadCount] = await Promise.all([
      db.contactSubmission.findMany({
        where: unreadOnly ? { isRead: false } : {},
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.contactSubmission.count({
        where: unreadOnly ? { isRead: false } : {},
      }),
      db.contactSubmission.count({ where: { isRead: false } }),
    ]);

    return NextResponse.json({
      submissions,
      total,
      unreadCount,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Contact submissions list error:", error);
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 });
  }
}

// PATCH /api/admin/contact — Mark as read/replied
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, isRead, isReplied } = body;

    if (!id) {
      return NextResponse.json({ error: "Submission ID is required" }, { status: 400 });
    }

    const updateData: any = {};
    if (typeof isRead === "boolean") updateData.isRead = isRead;
    if (typeof isReplied === "boolean") {
      updateData.isReplied = isReplied;
      if (isReplied) updateData.repliedAt = new Date();
    }

    const updated = await db.contactSubmission.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Contact submission update error:", error);
    return NextResponse.json({ error: "Failed to update submission" }, { status: 500 });
  }
}

// DELETE /api/admin/contact — Delete submission
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Submission ID is required" }, { status: 400 });
    }

    await db.contactSubmission.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact submission delete error:", error);
    return NextResponse.json({ error: "Failed to delete submission" }, { status: 500 });
  }
}
