/**
 * Services Listing Page — Wedabime Pramukayo
 * CMS-driven hero section + DB-driven services list
 */

// Force dynamic rendering — page queries database at request time
export const dynamic = 'force-dynamic';

import { getSql } from "@/lib/neon-sql";
import Link from "next/link";
import { ArrowRight, CheckCircle, Star, Filter } from "lucide-react";
import { Breadcrumbs } from "@/components/public/breadcrumbs";

export const revalidate = 60;

async function getServicesData(categorySlug?: string) {
  try {
    const sql = getSql();

    const [categoryRows, serviceRows, sectionsRows] = await Promise.all([
      sql`
        SELECT pc.id, pc.slug, pc.name, pc.description, pc.icon, pc."imageUrl",
               pc."sortOrder", pc."isActive", pc."createdAt", pc."updatedAt",
               COALESCE(cnt.product_count, 0) AS "_count.products"
        FROM "ProductCategory" pc
        LEFT JOIN (
          SELECT "categoryId", COUNT(*)::int AS product_count
          FROM "Product"
          GROUP BY "categoryId"
        ) cnt ON pc.id = cnt."categoryId"
        WHERE pc."isActive" = true
        ORDER BY pc."sortOrder" ASC
      `,
      sql`
        SELECT p.id, p.slug, p.name, p.subtitle, p.description, p.features,
               p.advantages, p.specifications, p."mainImageUrl", p.gallery,
               p."categoryId", p."metaTitle", p."metaDesc", p."metaKeywords",
               p."ogImageUrl", p."isFeatured", p."isPublished", p."publishedAt",
               p."sortOrder", p."createdAt", p."updatedAt",
               c.name AS "category.name", c.slug AS "category.slug"
        FROM "Product" p
        LEFT JOIN "ProductCategory" c ON p."categoryId" = c.id
        WHERE p."isPublished" = true
          ${categorySlug ? sql`AND c.slug = ${categorySlug}` : sql``}
        ORDER BY p."sortOrder" ASC
      `,
      sql`
        SELECT id, "sectionKey", type, title, subtitle, content, items, "imageUrl",
               "linkUrl", "linkText", "sortOrder", "isActive", settings
        FROM "ContentSection"
        WHERE "pageSlug" = 'services' AND "isActive" = true
        ORDER BY "sortOrder" ASC
      `,
    ]);

    // Reconstruct categories with _count
    const categories = categoryRows.map((row: any) => {
      const { '_count.products': productCount, ...rest } = row;
      return { ...rest, _count: { products: productCount } };
    });

    // Reconstruct services with nested category
    const services = serviceRows.map((row: any) => {
      const { 'category.name': catName, 'category.slug': catSlug, ...rest } = row;
      return { ...rest, category: catName ? { name: catName, slug: catSlug } : null };
    });

    const heroSection = sectionsRows.find((s: any) => s.sectionKey === "hero");
    return { categories, services, heroSection };
  } catch (error) {
    console.error("Failed to fetch services data:", error);
    return { categories: [] as any[], services: [] as any[], heroSection: null as any };
  }
}

export async function generateMetadata() {
  try {
    const sql = getSql();
    const rows = await sql`
      SELECT "metaTitle", "metaDesc"
      FROM "Page"
      WHERE slug = 'services'
    `;
    const page = rows[0] || null;
    return {
      title: page?.metaTitle || "Our Services",
      description: page?.metaDesc || "Explore our range of premium i-Panel services for Sri Lanka.",
    };
  } catch (error) {
    console.error("Failed to fetch services metadata:", error);
    return {
      title: "Our Services",
      description: "Explore our range of premium i-Panel services for Sri Lanka.",
    };
  }
}

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const categorySlug = params.category;
  const { categories, services, heroSection } = await getServicesData(categorySlug);
  const activeCategory = categories.find((c) => c.slug === categorySlug);

  return (
    <div>
      <Breadcrumbs items={[{ label: "Services", href: "/services" }, ...(activeCategory ? [{ label: activeCategory.name }] : [])]} />
      {/* Hero */}
      <section
        className="relative py-20 text-white"
        style={{ background: "linear-gradient(135deg, #1B4332 0%, #2D6A4F 60%, #40916C 100%)" }}
      >
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold">
            {activeCategory ? activeCategory.name : (heroSection?.title || "Our Services")}
          </h1>
          <p className="text-lg text-brand-sage/80 mt-4 max-w-2xl mx-auto">
            {activeCategory?.description || (heroSection?.subtitle || "Explore our comprehensive range of i-Panel solutions designed for Sri Lanka.")}
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-6 bg-white border-b border-brand-emerald/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <Link href="/services" className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${!categorySlug ? "bg-brand-primary text-white" : "bg-brand-mint/30 text-foreground/70 hover:bg-brand-mint/50"}`}>
              All Services
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/services?category=${cat.slug}`}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${categorySlug === cat.slug ? "bg-brand-primary text-white" : "bg-brand-mint/30 text-foreground/70 hover:bg-brand-mint/50"}`}
              >
                {cat.name} <span className="ml-1 text-xs opacity-60">({cat._count.products})</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 bg-brand-cream">
        <div className="max-w-7xl mx-auto px-4">
          {services.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No services found in this category.</p>
              <Link href="/services" className="text-brand-primary font-semibold mt-2 inline-block">View all services →</Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => {
                const features: string[] = (() => { try { return JSON.parse(service.features); } catch { return []; } })();
                return (
                  <Link key={service.id} href={`/services/${service.slug}`} className="group rounded-xl border border-brand-emerald/10 bg-white p-6 hover:border-brand-emerald/30 hover:shadow-xl transition-all">
                    <div className="flex items-center gap-2 mb-4">
                      {service.category && <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-mint/30 text-brand-emerald font-medium">{service.category.name}</span>}
                      {service.isFeatured && <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-brand-gold/20 text-brand-gold font-medium"><Star className="h-3 w-3" />Featured</span>}
                    </div>
                    <h3 className="text-lg font-bold text-foreground group-hover:text-brand-primary transition-colors mb-1">{service.name}</h3>
                    {service.subtitle && <p className="text-sm text-muted-foreground mb-3">{service.subtitle}</p>}
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{service.description.replace(/<[^>]*>/g, "").substring(0, 150)}...</p>
                    {features.length > 0 && (
                      <ul className="space-y-1.5 mb-4">
                        {features.slice(0, 4).map((f, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground"><CheckCircle className="h-3 w-3 text-brand-spring flex-shrink-0 mt-0.5" />{f}</li>
                        ))}
                        {features.length > 4 && <li className="text-xs text-brand-primary font-medium">+{features.length - 4} more features</li>}
                      </ul>
                    )}
                    <div className="flex items-center gap-1 text-sm font-semibold text-brand-primary group-hover:gap-2 transition-all">View Details <ArrowRight className="h-4 w-4" /></div>
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
