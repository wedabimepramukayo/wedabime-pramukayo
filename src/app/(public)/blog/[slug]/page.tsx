/**
 * Blog Post Detail Page — Wedabime Pramukayo
 */

// Force dynamic rendering — page queries database at request time
export const dynamic = 'force-dynamic';

import { db } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, User, Tag } from "lucide-react";
import { Breadcrumbs } from "@/components/public/breadcrumbs";

export const revalidate = 60;

async function getPost(slug: string) {
  return db.blogPost.findUnique({ where: { slug, isPublished: true } });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Not Found" };
  return {
    title: post.metaTitle || `${post.title} | Wedabime Pramukayo`,
    description: post.metaDesc || post.excerpt || post.content.replace(/<[^>]*>/g, "").substring(0, 160),
  };
}

function parseTags(val: string | null): string[] {
  if (!val) return [];
  try { const p = JSON.parse(val); return Array.isArray(p) ? p : []; } catch { return []; }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const tags = parseTags(post.tags);

  return (
    <div>
      <Breadcrumbs items={[{ label: "Blog", href: "/blog" }, { label: post.title }]} />
      {/* Hero */}
      <section className="relative py-16 text-white" style={{ background: "linear-gradient(135deg, #1B4332 0%, #2D6A4F 60%, #40916C 100%)" }}>
        <div className="relative max-w-4xl mx-auto px-4">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-brand-sage/70 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" />Back to Blog
          </Link>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">{post.title}</h1>
          <div className="flex items-center gap-4 mt-4 text-sm text-brand-sage/70">
            {post.author && <span className="flex items-center gap-1"><User className="h-4 w-4" />{post.author}</span>}
            {post.publishedAt && <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{new Date(post.publishedAt).toLocaleDateString("en-LK", { year: "numeric", month: "long", day: "numeric" })}</span>}
          </div>
          {tags.length > 0 && (
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <Tag className="h-4 w-4 text-brand-sage/50" />
              {tags.map((tag, i) => (
                <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/80">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <article
            className="prose prose-lg max-w-none text-foreground/80 leading-relaxed [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-brand-primary [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-brand-emerald [&_h3]:mt-8 [&_h3]:mb-3 [&_p]:mb-5 [&_p]:leading-relaxed [&_ul]:space-y-2 [&_ol]:space-y-2"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-brand-cream">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-brand-primary mb-4">Interested in i-Panel Solutions?</h2>
          <p className="text-muted-foreground mb-6">Get in touch with our team for a free consultation.</p>
          <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-primary/90 transition-colors">
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  );
}
