/**
 * API: Single Social Account — DELETE and PATCH operations
 * Wedabime Pramukayo CMS
 *
 * DELETE: Remove a social account and its posts
 * PATCH: Update account (toggle active, update tokens, etc.)
 *
 * Converted from Prisma to Neon direct SQL for Cloudflare Workers compatibility.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSql, requireAuth, unauthorized, notFound, serverError } from "@/lib/neon-sql";

/** Mask a token for display */
function maskToken(token: string | null): string | null {
  if (!token) return null;
  if (token.length <= 8) return "****";
  return "*".repeat(token.length - 4) + token.slice(-4);
}

// DELETE /api/admin/social-accounts/[id] — Remove account
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const sql = getSql();
    const { id } = await params;

    // Check account exists
    const existing = await sql`
      SELECT id FROM "SocialAccount" WHERE id = ${id}
    `;

    if (existing.length === 0) return notFound("Social account not found");

    // Delete all associated posts first, then the account
    await sql`DELETE FROM "SocialPost" WHERE "socialAccountId" = ${id}`;
    await sql`DELETE FROM "SocialAccount" WHERE id = ${id}`;

    return NextResponse.json({ message: "Social account removed successfully" });
  } catch (error) {
    console.error("Social account DELETE error:", error);
    return serverError("Failed to delete social account");
  }
}

// PATCH /api/admin/social-accounts/[id] — Update account
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const sql = getSql();
    const { id } = await params;
    const body = await request.json();

    // Fetch existing account (needed for merge + existence check)
    const existingRows = await sql`
      SELECT id, platform, "accessToken", "refreshToken", "accountId", "accountName", "isActive", "lastUsedAt", "createdAt", "updatedAt"
      FROM "SocialAccount"
      WHERE id = ${id}
    `;

    if (existingRows.length === 0) return notFound("Social account not found");

    const current = existingRows[0] as Record<string, unknown>;

    // Merge: use provided values or keep current values
    const newIsActive = body.isActive !== undefined ? body.isActive : current.isActive;
    const newAccessToken = body.accessToken !== undefined ? body.accessToken : current.accessToken;
    const newRefreshToken = body.refreshToken !== undefined ? body.refreshToken : current.refreshToken;
    const newAccountId = body.accountId !== undefined ? body.accountId : current.accountId;
    const newAccountName = body.accountName !== undefined ? body.accountName : current.accountName;

    const rows = await sql`
      UPDATE "SocialAccount"
      SET
        "isActive" = ${newIsActive},
        "accessToken" = ${newAccessToken},
        "refreshToken" = ${newRefreshToken},
        "accountId" = ${newAccountId},
        "accountName" = ${newAccountName},
        "updatedAt" = NOW()
      WHERE id = ${id}
      RETURNING id, platform, "accessToken", "refreshToken", "accountId", "accountName", "isActive", "lastUsedAt", "createdAt", "updatedAt"
    `;

    const updated = rows[0] as Record<string, unknown>;

    return NextResponse.json({
      account: {
        ...updated,
        accessToken: maskToken(updated.accessToken as string | null),
        refreshToken: maskToken(updated.refreshToken as string | null),
      },
    });
  } catch (error) {
    console.error("Social account PATCH error:", error);
    return serverError("Failed to update social account");
  }
}
