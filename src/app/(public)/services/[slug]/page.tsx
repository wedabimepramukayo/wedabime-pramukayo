/**
 * Service Detail Page — Wedabime Pramukayo
 */

// Force dynamic rendering — page queries database at request time
export const dynamic = 'force-dynamic';

import { db } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle, Star, ArrowLeft, Shield, Award } from "lucide-react";
import { Breadcrumbs } from "@/components/public/breadcrumbs";

export const revalidate = 60;

async function getService(slug: string) {
  return db.product.findUnique({
    where: { slug, isPublished: true },
    include: { category: { select: { name: true, slug: true } } },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) return { title: "Not Found" };
  return {
    title: service.metaTitle || `${service.name} | Wedabime Pramukayo`,
    description: service.metaDesc || service.description.replace(/<[^>]*>/g, "").substring(0, 160),
  };
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) notFound();

  const features: string[] = (() => { try { return JSON.parse(service.features); } catch { return []; } })();
  const advantages: string[] = (() => { try { return JSON.parse(service.advantages || "[]"); } catch { return []; } })();

  const related = await db.product.findMany({
    where: { isPublished: true, categoryId: service.categoryId, id: { not: service.id } },
    take: 3, orderBy: { sortOrder: "asc" },
    include: { category: { select: { name: true } } },
  });

  return (
    <div>
      <Breadcrumbs items={[{ label: "Services", href: "/services" }, { label: service.name }]} />
      {/* Hero */}
      <section className="relative py-20 text-white" style={{ background: "linear-gradient(135deg, #1B4332 0%, #2D6A4F 60%, #40916C 100%)" }}>
        <div className="relative max-w-7xl mx-auto px-4">
          <Link href="/services" className="inline-flex items-center gap-2 text-sm text-brand-sage/70 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" />Back to Services
          </Link>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {service.category && <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-white/80">{service.category.name}</span>}
            {service.isFeatured && <span className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-brand-gold/30 text-brand-gold"><Star className="h-3 w-3" />Featured</span>}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">{service.name}</h1>
          {service.subtitle && <p className="text-xl text-brand-sage/80 mt-3">{service.subtitle}</p>}
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-10">
              <div>
                <h2 className="text-2xl font-bold text-brand-primary mb-4">Description</h2>
                <div className="prose prose-lg max-w-none text-foreground/80 leading-relaxed [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-brand-primary [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-brand-emerald [&_p]:mb-4" dangerouslySetInnerHTML={{ __html: service.description }} />
              </div>
              {features.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-brand-primary mb-4">Key Features</h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {features.map((f, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-brand-mint/20">
                        <CheckCircle className="h-5 w-5 text-brand-spring flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {advantages.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-brand-primary mb-4">Advantages</h2>
                  <div className="space-y-3">
                    {advantages.map((a, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 rounded-lg border border-brand-spring/20 bg-brand-spring/5">
                        <Award className="h-5 w-5 text-brand-spring flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground font-medium">{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-6">
              <div className="p-6 rounded-xl border border-brand-gold/20 bg-brand-gold/5 text-center">
                <Shield className="h-10 w-10 text-brand-gold mx-auto mb-2" />
                <div className="text-2xl font-bold text-brand-gold">Up to 15 Years</div>
                <div className="text-sm text-muted-foreground">Warranty</div>
              </div>
              {service.category && (
                <div className="p-5 rounded-xl border border-brand-emerald/10 bg-white">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Category</div>
                  <Link href={`/services?category=${service.category.slug}`} className="text-brand-primary font-semibold hover:text-brand-emerald transition-colors">{service.category.name}</Link>
                </div>
              )}
              <div className="p-6 rounded-xl bg-brand-primary text-white text-center">
                <h3 className="font-bold mb-2">Interested?</h3>
                <p className="text-sm text-brand-sage/80 mb-4">Get a free quote for your project</p>
                <Link href="/contact" className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-spring text-brand-dark font-semibold rounded-lg hover:bg-brand-spring/90 transition-colors w-full justify-center">Get a Quote <ArrowRight className="h-4 w-4" /></Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="py-16 bg-brand-cream">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-brand-primary mb-8">Related Services</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {related.map((r) => (
                <Link key={r.id} href={`/services/${r.slug}`} className="group p-5 rounded-xl border border-brand-emerald/10 bg-white hover:border-brand-emerald/30 hover:shadow-lg transition-all">
                  <h3 className="font-bold text-foreground group-hover:text-brand-primary transition-colors mb-1">{r.name}</h3>
                  {r.subtitle && <p className="text-xs text-muted-foreground">{r.subtitle}</p>}
                  <div className="mt-3 flex items-center gap-1 text-sm font-semibold text-brand-primary">View Details <ArrowRight className="h-3 w-3" /></div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
