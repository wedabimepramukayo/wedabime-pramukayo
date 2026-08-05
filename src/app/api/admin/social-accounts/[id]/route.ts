/**
 * API: Single Social Account — DELETE and PATCH operations
 * Wedabime Pramukayo CMS
 *
 * DELETE: Remove a social account and its posts
 * PATCH: Update account (toggle active, update tokens, etc.)
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const account = await db.socialAccount.findUnique({ where: { id } });

    if (!account) {
      return NextResponse.json({ error: "Social account not found" }, { status: 404 });
    }

    // Delete all associated posts first, then the account
    await db.socialPost.deleteMany({ where: { socialAccountId: id } });
    await db.socialAccount.delete({ where: { id } });

    return NextResponse.json({ message: "Social account removed successfully" });
  } catch (error) {
    console.error("Social account DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete social account" }, { status: 500 });
  }
}

// PATCH /api/admin/social-accounts/[id] — Update account
export async function PATCH(
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

    const account = await db.socialAccount.findUnique({ where: { id } });
    if (!account) {
      return NextResponse.json({ error: "Social account not found" }, { status: 404 });
    }

    // Build update data (only allow specific fields)
    const data: any = {};
    if (body.isActive !== undefined) data.isActive = body.isActive;
    if (body.accessToken !== undefined) data.accessToken = body.accessToken;
    if (body.refreshToken !== undefined) data.refreshToken = body.refreshToken;
    if (body.accountId !== undefined) data.accountId = body.accountId;
    if (body.accountName !== undefined) data.accountName = body.accountName;

    const updated = await db.socialAccount.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      account: {
        ...updated,
        accessToken: maskToken(updated.accessToken),
        refreshToken: maskToken(updated.refreshToken),
      },
    });
  } catch (error) {
    console.error("Social account PATCH error:", error);
    return NextResponse.json({ error: "Failed to update social account" }, { status: 500 });
  }
}
