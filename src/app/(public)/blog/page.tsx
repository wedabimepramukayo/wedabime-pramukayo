/**
 * Blog Listing Page — Wedabime Pramukayo
 * Shows published blog posts with tags and excerpts
 */

import { db } from "@/lib/db";
import Link from "next/link";
import { Calendar, User, ArrowRight, Tag, NotebookPen } from "lucide-react";
import { Breadcrumbs } from "@/components/public/breadcrumbs";

export const revalidate = 60;

export const metadata = {
  title: "Blog | Wedabime Pramukayo",
  description: "Tips, guides, and insights about i-Panel ceiling, wall cladding, and roofing solutions in Sri Lanka.",
};

function parseTags(val: string | null): string[] {
  if (!val) return [];
  try { const p = JSON.parse(val); return Array.isArray(p) ? p : []; } catch { return []; }
}

export default async function BlogPage() {
  const posts = await db.blogPost.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div>
      <Breadcrumbs items={[{ label: "Blog" }]} />
      {/* Hero */}
      <section className="relative py-20 text-white" style={{ background: "linear-gradient(135deg, #1B4332 0%, #2D6A4F 60%, #40916C 100%)" }}>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold">Blog</h1>
          <p className="text-lg text-brand-sage/80 mt-4 max-w-2xl mx-auto">
            Tips, guides, and insights about i-Panel solutions for Sri Lankan homes and businesses.
          </p>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-16 bg-brand-cream">
        <div className="max-w-4xl mx-auto px-4">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <NotebookPen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No blog posts yet. Check back soon!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => {
                const tags = parseTags(post.tags);
                return (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group block p-6 rounded-xl border border-brand-emerald/10 bg-white hover:border-brand-emerald/30 hover:shadow-xl transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-bold text-foreground group-hover:text-brand-primary transition-colors mb-2">
                          {post.title}
                        </h2>
                        {post.excerpt && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {post.excerpt}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {post.author && (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {post.author}
                            </span>
                          )}
                          {post.publishedAt && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(post.publishedAt).toLocaleDateString("en-LK", { year: "numeric", month: "long", day: "numeric" })}
                            </span>
                          )}
                        </div>
                        {tags.length > 0 && (
                          <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                            <Tag className="h-3 w-3 text-muted-foreground" />
                            {tags.map((tag, i) => (
                              <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-brand-mint/30 text-brand-emerald font-medium">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-sm font-semibold text-brand-primary group-hover:gap-2 transition-all md:self-center">
                        Read More <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
