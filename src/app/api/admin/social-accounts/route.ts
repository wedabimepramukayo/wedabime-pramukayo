/**
 * API: Social Accounts — List and create social media accounts
 * Wedabime Pramukayo CMS
 *
 * GET: List all accounts (tokens masked for security)
 * POST: Add/connect a social media account
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const VALID_PLATFORMS = ["facebook", "threads", "instagram", "blogger", "medium", "reddit"];

/** Mask a token for display — show only last 4 chars */
function maskToken(token: string | null): string | null {
  if (!token) return null;
  if (token.length <= 8) return "****";
  return "*".repeat(token.length - 4) + token.slice(-4);
}

// GET /api/admin/social-accounts — List all accounts (tokens masked)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accounts = await db.socialAccount.findMany({
      orderBy: [{ platform: "asc" }, { createdAt: "desc" }],
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    // Mask tokens for security
    const masked = accounts.map((account) => ({
      ...account,
      accessToken: maskToken(account.accessToken),
      refreshToken: maskToken(account.refreshToken),
      postCount: account._count.posts,
    }));

    return NextResponse.json({ accounts: masked });
  } catch (error) {
    console.error("Social accounts GET error:", error);
    return NextResponse.json({ error: "Failed to fetch social accounts" }, { status: 500 });
  }
}

// POST /api/admin/social-accounts — Add/connect a social account
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { platform, accessToken, refreshToken, accountId, accountName, isActive } = body;

    if (!platform || !VALID_PLATFORMS.includes(platform)) {
      return NextResponse.json(
        { error: `Invalid platform. Must be one of: ${VALID_PLATFORMS.join(", ")}` },
        { status: 400 }
      );
    }

    const account = await db.socialAccount.create({
      data: {
        platform,
        accessToken: accessToken || null,
        refreshToken: refreshToken || null,
        accountId: accountId || null,
        accountName: accountName || null,
        isActive: isActive ?? true,
      },
    });

    // Return with masked tokens
    return NextResponse.json(
      {
        account: {
          ...account,
          accessToken: maskToken(account.accessToken),
          refreshToken: maskToken(account.refreshToken),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Social accounts POST error:", error);
    return NextResponse.json({ error: "Failed to create social account" }, { status: 500 });
  }
}
