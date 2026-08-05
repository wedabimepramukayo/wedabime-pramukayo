/**
 * API: Social Post — Manual trigger for posting blog post to social platforms
 * Wedabime Pramukayo CMS
 *
 * POST: Trigger posting for a blog post to selected/all platforms
 * Body: { blogPostId: string, platforms?: string[] }
 *       - If platforms array is provided, post only to those platforms
 *       - If omitted, post to all active accounts
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { publishToAllPlatforms } from "@/lib/social-posting";

const VALID_PLATFORMS = ["facebook", "threads", "instagram", "blogger", "medium", "reddit"];

// POST /api/admin/social-post — Trigger social posting
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { blogPostId, platforms } = body;

    if (!blogPostId) {
      return NextResponse.json(
        { error: "blogPostId is required" },
        { status: 400 }
      );
    }

    // Validate platforms if provided
    if (platforms && Array.isArray(platforms)) {
      const invalid = platforms.filter((p: string) => !VALID_PLATFORMS.includes(p));
      if (invalid.length > 0) {
        return NextResponse.json(
          { error: `Invalid platforms: ${invalid.join(", ")}. Valid: ${VALID_PLATFORMS.join(", ")}` },
          { status: 400 }
        );
      }
    }

    // Fetch the blog post
    const blogPost = await db.blogPost.findUnique({ where: { id: blogPostId } });
    if (!blogPost) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }

    if (!blogPost.isPublished) {
      return NextResponse.json(
        { error: "Blog post must be published before sharing on social media" },
        { status: 400 }
      );
    }

    // Trigger posting
    const results = await publishToAllPlatforms(
      {
        id: blogPost.id,
        slug: blogPost.slug,
        title: blogPost.title,
        excerpt: blogPost.excerpt,
        content: blogPost.content,
        coverImageUrl: blogPost.coverImageUrl,
        tags: blogPost.tags,
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
    return NextResponse.json(
      { error: "Failed to trigger social posting" },
      { status: 500 }
    );
  }
}
