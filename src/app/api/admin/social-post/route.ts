/**
 * API: Social Post — Manual trigger for posting blog post to social platforms
 * Wedabime Pramukayo CMS
 *
 * POST: Trigger posting for a blog post to selected/all platforms
 * Body: { blogPostId: string, platforms?: string[] }
 *       - If platforms array is provided, post only to those platforms
 *       - If omitted, post to all active accounts
 *
 * Converted from Prisma to Neon direct SQL for Cloudflare Workers compatibility.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSql, requireAuth, unauthorized, badRequest, notFound, serverError } from "@/lib/neon-sql";
import { publishToAllPlatforms } from "@/lib/social-posting";

const VALID_PLATFORMS = ["facebook", "threads", "instagram", "blogger", "medium", "reddit"];

// POST /api/admin/social-post — Trigger social posting
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const sql = getSql();
    const body = await request.json();
    const { blogPostId, platforms } = body;

    if (!blogPostId) return badRequest("blogPostId is required");

    // Validate platforms if provided
    if (platforms && Array.isArray(platforms)) {
      const invalid = platforms.filter((p: string) => !VALID_PLATFORMS.includes(p));
      if (invalid.length > 0) {
        return badRequest(`Invalid platforms: ${invalid.join(", ")}. Valid: ${VALID_PLATFORMS.join(", ")}`);
      }
    }

    // Fetch the blog post
    const rows = await sql`
      SELECT id, slug, title, excerpt, content, "coverImageUrl", tags, "isPublished", "publishedAt", "createdAt", "updatedAt"
      FROM "BlogPost"
      WHERE id = ${blogPostId}
    `;

    if (rows.length === 0) return notFound("Blog post not found");

    const blogPost = rows[0] as Record<string, unknown>;

    if (!blogPost.isPublished) {
      return badRequest("Blog post must be published before sharing on social media");
    }

    // Trigger posting
    const results = await publishToAllPlatforms(
      {
        id: blogPost.id as string,
        slug: blogPost.slug as string,
        title: blogPost.title as string,
        excerpt: blogPost.excerpt as string | null,
        content: blogPost.content as string,
        coverImageUrl: blogPost.coverImageUrl as string | null,
        tags: blogPost.tags as string | null,
      },
      platforms
    );

    const successCount = results.filter((r) => r.result.success).length;
    const failCount = results.filter((r) => !r.result.success).length;

    return NextResponse.json({
      message: `Posted to ${successCount} platform(s)${failCount > 0 ? `, ${failCount} failed` : ""}`,
      results,
      summary: { total: results.length, success: successCount, failed: failCount },
    });
  } catch (error) {
    console.error("Social post trigger error:", error);
    return serverError("Failed to trigger social posting");
  }
}
