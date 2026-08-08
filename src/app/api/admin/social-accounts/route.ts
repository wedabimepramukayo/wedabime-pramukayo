/**
 * API: Social Accounts — List and create social media accounts
 * Wedabime Pramukayo CMS
 *
 * GET: List all accounts (tokens masked for security) with post count
 * POST: Add/connect a social media account
 *
 * Converted from Prisma to Neon direct SQL for Cloudflare Workers compatibility.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSql, generateId, requireAuth, unauthorized, badRequest, serverError } from "@/lib/neon-sql";

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
    const session = await requireAuth();
    if (!session) return unauthorized();

    const sql = getSql();

    // LEFT JOIN with SocialPost for post count per account
    const rows = await sql`
      SELECT
        sa.id,
        sa.platform,
        sa."accessToken",
        sa."refreshToken",
        sa."accountId",
        sa."accountName",
        sa."isActive",
        sa."lastUsedAt",
        sa."createdAt",
        sa."updatedAt",
        COUNT(sp.id)::int AS "postCount"
      FROM "SocialAccount" sa
      LEFT JOIN "SocialPost" sp ON sp."socialAccountId" = sa.id
      GROUP BY sa.id, sa.platform, sa."accessToken", sa."refreshToken", sa."accountId", sa."accountName", sa."isActive", sa."lastUsedAt", sa."createdAt", sa."updatedAt"
      ORDER BY sa.platform ASC, sa."createdAt" DESC
    `;

    // Mask tokens for security
    const accounts = (rows as Record<string, unknown>[]).map((account) => ({
      ...account,
      accessToken: maskToken(account.accessToken as string | null),
      refreshToken: maskToken(account.refreshToken as string | null),
      postCount: account.postCount,
    }));

    return NextResponse.json({ accounts });
  } catch (error) {
    console.error("Social accounts GET error:", error);
    return serverError("Failed to fetch social accounts");
  }
}

// POST /api/admin/social-accounts — Add/connect a social account
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const sql = getSql();
    const body = await request.json();
    const { platform, accessToken, refreshToken, accountId, accountName, isActive } = body;

    if (!platform || !VALID_PLATFORMS.includes(platform)) {
      return badRequest(`Invalid platform. Must be one of: ${VALID_PLATFORMS.join(", ")}`);
    }

    const id = generateId();
    const active = isActive ?? true;

    const rows = await sql`
      INSERT INTO "SocialAccount" (id, platform, "accessToken", "refreshToken", "accountId", "accountName", "isActive", "lastUsedAt", "createdAt", "updatedAt")
      VALUES (${id}, ${platform}, ${accessToken || null}, ${refreshToken || null}, ${accountId || null}, ${accountName || null}, ${active}, NULL, NOW(), NOW())
      RETURNING id, platform, "accessToken", "refreshToken", "accountId", "accountName", "isActive", "lastUsedAt", "createdAt", "updatedAt"
    `;

    const account = rows[0] as Record<string, unknown>;

    // Return with masked tokens
    return NextResponse.json(
      {
        account: {
          ...account,
          accessToken: maskToken(account.accessToken as string | null),
          refreshToken: maskToken(account.refreshToken as string | null),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Social accounts POST error:", error);
    return serverError("Failed to create social account");
  }
}
