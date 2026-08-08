/**
 * Admin Contact Submissions API — Wedabime Pramukayo CMS
 * List, mark as read, and delete contact form submissions
 *
 * Converted from Prisma to Neon direct SQL for Cloudflare Workers compatibility.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSql, requireAuth, unauthorized, badRequest, serverError } from "@/lib/neon-sql";

// GET /api/admin/contact — List submissions
export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const sql = getSql();
    const searchParams = req.nextUrl.searchParams;
    const unreadOnly = searchParams.get("unread") === "true";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    const whereFragment = unreadOnly
      ? sql`WHERE "isRead" = false`
      : sql``;

    const [submissions, countRows, unreadCountRows] = await Promise.all([
      sql`
        SELECT id, name, email, phone, subject, message, "isRead", "isReplied", "repliedAt", "createdAt", "updatedAt"
        FROM "ContactSubmission"
        ${whereFragment}
        ORDER BY "createdAt" DESC
        LIMIT ${limit} OFFSET ${offset}
      `,
      sql`
        SELECT COUNT(*)::int AS count
        FROM "ContactSubmission"
        ${whereFragment}
      `,
      sql`
        SELECT COUNT(*)::int AS count
        FROM "ContactSubmission"
        WHERE "isRead" = false
      `,
    ]);

    const total = countRows[0]?.count ?? 0;
    const unreadCount = unreadCountRows[0]?.count ?? 0;

    return NextResponse.json({
      submissions,
      total,
      unreadCount,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Contact submissions list error:", error);
    return serverError("Failed to fetch submissions");
  }
}

// PATCH /api/admin/contact — Mark as read/replied
export async function PATCH(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const sql = getSql();
    const body = await req.json();
    const { id, isRead, isReplied } = body;

    if (!id) return badRequest("Submission ID is required");

    // Fetch current submission for merge
    const existingRows = await sql`
      SELECT id, name, email, phone, subject, message, "isRead", "isReplied", "repliedAt", "createdAt", "updatedAt"
      FROM "ContactSubmission"
      WHERE id = ${id}
    `;

    if (existingRows.length === 0) {
      return badRequest("Submission not found");
    }

    const current = existingRows[0] as Record<string, unknown>;

    // Merge provided values with current values
    const newIsRead = typeof isRead === "boolean" ? isRead : current.isRead;
    const newIsReplied = typeof isReplied === "boolean" ? isReplied : current.isReplied;

    // Set repliedAt to NOW() if isReplied is being set to true (either newly or already)
    const newRepliedAt = (typeof isReplied === "boolean" && isReplied)
      ? new Date().toISOString()
      : current.repliedAt;

    const updated = await sql`
      UPDATE "ContactSubmission"
      SET "isRead" = ${newIsRead}, "isReplied" = ${newIsReplied}, "repliedAt" = ${newRepliedAt}, "updatedAt" = NOW()
      WHERE id = ${id}
      RETURNING id, name, email, phone, subject, message, "isRead", "isReplied", "repliedAt", "createdAt", "updatedAt"
    `;

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("Contact submission update error:", error);
    return serverError("Failed to update submission");
  }
}

// DELETE /api/admin/contact — Delete submission
export async function DELETE(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const sql = getSql();
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) return badRequest("Submission ID is required");

    await sql`DELETE FROM "ContactSubmission" WHERE id = ${id}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact submission delete error:", error);
    return serverError("Failed to delete submission");
  }
}
