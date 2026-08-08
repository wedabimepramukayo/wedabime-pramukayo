/**
 * API: Single Blog Post — GET, PUT, DELETE by ID
 * Wedabime Pramukayo CMS
 * Uses @neondatabase/serverless directly (Cloudflare Workers compatible)
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getSql,
  requireAuth,
  unauthorized,
  notFound,
  conflict,
  serverError,
  jsonStringify,
} from "@/lib/neon-sql";

// GET /api/admin/blog/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const { id } = await params;
    const sql = getSql();

    const [post] = await sql`
      SELECT
        id, slug, title, excerpt, content,
        "coverImageUrl", author, tags,
        "metaTitle", "metaDesc", "metaKeywords", "ogImageUrl",
        "isPublished", "publishedAt", "createdAt", "updatedAt"
      FROM "BlogPost"
      WHERE id = ${id}
    `;

    if (!post) {
      return notFound("Blog post not found");
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Blog post GET error:", error);
    return serverError("Failed to fetch blog post");
  }
}

// PUT /api/admin/blog/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const { id } = await params;
    const body = await request.json();
    const sql = getSql();

    // Fetch existing post
    const [existing] = await sql`
      SELECT
        id, slug, title, excerpt, content,
        "coverImageUrl", author, tags,
        "metaTitle", "metaDesc", "metaKeywords", "ogImageUrl",
        "isPublished", "publishedAt", "createdAt", "updatedAt"
      FROM "BlogPost"
      WHERE id = ${id}
    `;
    if (!existing) {
      return notFound("Blog post not found");
    }

    // Check slug conflict if changing slug
    if (body.slug && body.slug !== existing.slug) {
      const [slugConflict] = await sql`
        SELECT id FROM "BlogPost" WHERE slug = ${body.slug}
      `;
      if (slugConflict) {
        return conflict("A blog post with this slug already exists");
      }
    }

    // Determine if we should set publishedAt (first publish)
    const wasUnpublished = !existing.isPublished;
    const nowPublishing = body.isPublished === true;
    const shouldSetPublishedAt = wasUnpublished && nowPublishing;

    // Build SET clauses dynamically
    const setClauses: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    const addField = (column: string, value: unknown) => {
      setClauses.push(`${column} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    };

    if (body.slug !== undefined) addField("slug", body.slug);
    if (body.title !== undefined) addField("title", body.title);
    if (body.excerpt !== undefined) addField("excerpt", body.excerpt || null);
    if (body.content !== undefined) addField("content", body.content);
    if (body.coverImageUrl !== undefined) addField('"coverImageUrl"', body.coverImageUrl || null);
    if (body.author !== undefined) addField("author", body.author || null);
    if (body.tags !== undefined) {
      addField("tags", jsonStringify(body.tags));
    }
    if (body.metaTitle !== undefined) addField('"metaTitle"', body.metaTitle || null);
    if (body.metaDesc !== undefined) addField('"metaDesc"', body.metaDesc || null);
    if (body.metaKeywords !== undefined) addField('"metaKeywords"', body.metaKeywords || null);
    if (body.ogImageUrl !== undefined) addField('"ogImageUrl"', body.ogImageUrl || null);
    if (body.isPublished !== undefined) addField('"isPublished"', body.isPublished);
    if (shouldSetPublishedAt) addField('"publishedAt"', new Date().toISOString());

    // Always update updatedAt
    setClauses.push(`"updatedAt" = NOW()`);

    // If no fields to update besides updatedAt, just return existing
    if (setClauses.length === 1) {
      return NextResponse.json({ post: existing });
    }

    const setClause = setClauses.join(", ");
    values.push(id); // last param for WHERE

    const [post] = await sql.unsafe(
      `UPDATE "BlogPost" SET ${setClause} WHERE id = $${paramIndex} RETURNING id, slug, title, excerpt, content, "coverImageUrl", author, tags, "metaTitle", "metaDesc", "metaKeywords", "ogImageUrl", "isPublished", "publishedAt", "createdAt", "updatedAt"`,
      values
    );

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Blog post PUT error:", error);
    return serverError("Failed to update blog post");
  }
}

// DELETE /api/admin/blog/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const { id } = await params;
    const sql = getSql();

    const [existing] = await sql`
      SELECT id FROM "BlogPost" WHERE id = ${id}
    `;
    if (!existing) {
      return notFound("Blog post not found");
    }

    await sql`
      DELETE FROM "BlogPost" WHERE id = ${id}
    `;

    return NextResponse.json({ message: "Blog post deleted successfully" });
  } catch (error) {
    console.error("Blog post DELETE error:", error);
    return serverError("Failed to delete blog post");
  }
}
