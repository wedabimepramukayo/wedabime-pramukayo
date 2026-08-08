/**
 * API: Blog Posts — CRUD endpoints for blog management
 * Wedabime Pramukayo CMS
 * Uses @neondatabase/serverless directly (Cloudflare Workers compatible)
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getSql,
  generateId,
  requireAuth,
  unauthorized,
  badRequest,
  conflict,
  serverError,
  jsonStringify,
} from "@/lib/neon-sql";

// GET /api/admin/blog — List all blog posts
export async function GET() {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const sql = getSql();
    const posts = await sql`
      SELECT
        id, slug, title, excerpt, content,
        "coverImageUrl", author, tags,
        "metaTitle", "metaDesc", "metaKeywords", "ogImageUrl",
        "isPublished", "publishedAt", "createdAt", "updatedAt"
      FROM "BlogPost"
      ORDER BY "updatedAt" DESC
    `;

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Blog GET error:", error);
    return serverError("Failed to fetch blog posts");
  }
}

// POST /api/admin/blog — Create a new blog post
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const body = await request.json();
    const {
      slug,
      title,
      excerpt,
      content,
      coverImageUrl,
      author,
      tags,
      metaTitle,
      metaDesc,
      metaKeywords,
      ogImageUrl,
      isPublished,
    } = body;

    if (!slug || !title || !content) {
      return badRequest("Slug, title, and content are required");
    }

    const sql = getSql();

    // Check for duplicate slug
    const [existing] = await sql`
      SELECT id FROM "BlogPost" WHERE slug = ${slug}
    `;
    if (existing) {
      return conflict("A blog post with this slug already exists");
    }

    const id = generateId();
    const tagsValue = jsonStringify(tags);
    const authorValue = author || session.user?.name || "Admin";
    const published = isPublished ?? false;

    const [post] = await sql`
      INSERT INTO "BlogPost" (
        id, slug, title, excerpt, content,
        "coverImageUrl", author, tags,
        "metaTitle", "metaDesc", "metaKeywords", "ogImageUrl",
        "isPublished", "publishedAt", "createdAt", "updatedAt"
      ) VALUES (
        ${id}, ${slug}, ${title}, ${excerpt || null}, ${content},
        ${coverImageUrl || null}, ${authorValue}, ${tagsValue},
        ${metaTitle || null}, ${metaDesc || null}, ${metaKeywords || null}, ${ogImageUrl || null},
        ${published}, ${published ? new Date().toISOString() : null}, NOW(), NOW()
      )
      RETURNING
        id, slug, title, excerpt, content,
        "coverImageUrl", author, tags,
        "metaTitle", "metaDesc", "metaKeywords", "ogImageUrl",
        "isPublished", "publishedAt", "createdAt", "updatedAt"
    `;

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error("Blog POST error:", error);
    return serverError("Failed to create blog post");
  }
}
