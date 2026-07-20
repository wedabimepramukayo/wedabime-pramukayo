/**
 * Admin Blog Manager — Placeholder for Phase 3
 */

import { db } from "@/lib/db";

export default async function AdminBlog() {
  const posts = await db.blogPost.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Blog Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage blog posts for SEO
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-brand-emerald/10 bg-white overflow-hidden">
        <div className="p-6 border-b border-brand-emerald/10 bg-brand-mint/20">
          <p className="text-sm text-muted-foreground">
            🚧 Full blog editor coming in Phase 3 — Dynamic Admin CMS Development
          </p>
        </div>

        <div className="divide-y divide-brand-emerald/10">
          {posts.map((post) => (
            <div key={post.id} className="flex items-center justify-between p-4 hover:bg-brand-mint/10 transition-colors">
              <div className="min-w-0">
                <div className="font-medium text-foreground">{post.title}</div>
                <div className="text-xs text-muted-foreground">/blog/{post.slug} • by {post.author || "Unknown"}</div>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                post.isPublished
                  ? "bg-brand-spring/20 text-brand-emerald"
                  : "bg-brand-gold/20 text-brand-gold"
              }`}>
                {post.isPublished ? "Published" : "Draft"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
