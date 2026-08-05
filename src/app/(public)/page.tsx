/**
 * Home Page — Wedabime Pramukayo
 * CMS-driven homepage with hero, featured services, advantages, and CTA
 * All section content is fetched from ContentSection table
 */

// Force dynamic rendering — page queries database at request time
export const dynamic = 'force-dynamic';

import { db } from "@/lib/db";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  CheckCircle,
  Star,
} from "lucide-react";
import { getIcon } from "@/lib/icon-map";

export const revalidate = 60; // Revalidate every 60 seconds

interface SectionItem {
  icon?: string;
  title?: string;
  desc?: string;
  value?: string;
  label?: string;
  color?: string;
  imageUrl?: string;
}

interface ContentSectionData {
  id: string;
  sectionKey: string;
  type: string;
  title: string | null;
  subtitle: string | null;
  content: string | null;
  items: SectionItem[] | null;
  imageUrl: string | null;
  linkUrl: string | null;
  linkText: string | null;
  sortOrder: number;
  isActive: boolean;
  settings: Record<string, any> | null;
}

async function getHomeData() {
  try {
    const [sections, featuredServices, categories] = await Promise.all([
      db.contentSection.findMany({
        where: { pageSlug: "home", isActive: true },
        orderBy: { sortOrder: "asc" },
      }),
      db.product.findMany({
        where: { isPublished: true, isFeatured: true },
        orderBy: { sortOrder: "asc" },
        take: 4,
        include: { category: { select: { name: true, slug: true } } },
      }),
      db.productCategory.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        include: { _count: { select: { products: true } } },
      }),
    ]);

    // Map sections by sectionKey for easy access
    const sectionsMap: Record<string, ContentSectionData> = {};
    sections.forEach((s) => {
      sectionsMap[s.sectionKey] = {
        ...s,
        items: s.items as SectionItem[] | null,
        settings: s.settings as Record<string, any> | null,
      };
    });

    return { sectionsMap, featuredServices, categories };
  } catch (error) {
    console.error("Homepage data fetch error:", error);
    return {
      sectionsMap: {} as Record<string, ContentSectionData>,
      featuredServices: [] as any[],
      categories: [] as any[],
    };
  }
}

export default async function HomePage() {
  const { sectionsMap, featuredServices, categories } = await getHomeData();

  const hero = sectionsMap["hero"];
  const categoriesSection = sectionsMap["categories"];
  const featuredSection = sectionsMap["featured-services"];
  const advantagesSection = sectionsMap["advantages"];
  const ctaSection = sectionsMap["cta"];
  const statsSection = sectionsMap["stats"];

  const heroItems = (hero?.items || []) as SectionItem[];
  const advantageItems = (advantagesSection?.items || []) as SectionItem[];
  const statItems = (statsSection?.items || []) as SectionItem[];

  return (
    <div>
      {/* ─── Hero Section ──────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(135deg, #081C15 0%, #1B4332 40%, #2D6A4F 80%, #40916C 100%)",
          }}
        />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-brand-spring/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-brand-teal/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-28">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-brand-spring/20 text-brand-spring px-4 py-1.5 rounded-full text-sm font-semibold">
                <span className="h-2 w-2 rounded-full bg-brand-spring animate-pulse" />
                Built for Generations
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                {hero?.title || "Premium i-Panel Solutions for Sri Lanka"}
              </h1>
              <p className="text-lg text-brand-sage/80 max-w-xl leading-relaxed">
                {hero?.subtitle || "Waterproof, fire-retardant, and 100% termite proof ceiling, wall cladding & roofing solutions with up to 15 years warranty."}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href={hero?.linkUrl || "/services"}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-brand-spring text-brand-dark font-semibold rounded-lg hover:bg-brand-spring/90 transition-colors shadow-lg"
                >
                  {hero?.linkText || "Explore Services"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/advantages"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
                >
                  Why i-Panel?
                </Link>
              </div>

              {/* Quick Stats from hero items */}
              {heroItems.length > 0 && (
                <div className="flex items-center gap-6 pt-4">
                  {heroItems.map((item, i) => (
                    <div key={i} className="contents">
                      {i > 0 && <div className="w-px h-10 bg-white/10" />}
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${item.color || "text-brand-spring"}`}>{item.value}</div>
                        <div className="text-[10px] text-brand-sage/60">{item.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Hero Visual */}
            <div className="hidden md:flex justify-center">
              <div className="relative">
                <div className="w-80 h-80 rounded-3xl bg-brand-emerald/20 backdrop-blur-sm border border-brand-emerald/30 flex items-center justify-center">
                  <div className="relative h-48 w-48">
                    <Image
                      src="/logo.png"
                      alt="Wedabime Pramukayo"
                      fill
                      className="object-contain drop-shadow-2xl"
                      priority
                    />
                  </div>
                </div>
                {/* Floating badges */}
                <div className="absolute -top-4 -right-4 bg-brand-spring/90 text-brand-dark px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg">
                  Eco-Friendly
                </div>
                <div className="absolute -bottom-4 -left-4 bg-brand-gold/90 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg">
                  15 Yr Warranty
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Categories Section ────────────────────────── */}
      <section className="py-16 bg-brand-cream">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-brand-primary">
              {categoriesSection?.title || "Our Product Categories"}
            </h2>
            <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
              {categoriesSection?.subtitle || "Discover our comprehensive range of i-Panel solutions, organized by series to help you find the perfect product for your project."}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/services?category=${cat.slug}`}
                className="group p-5 rounded-xl border border-brand-emerald/10 bg-white hover:border-brand-emerald/30 hover:shadow-lg hover:shadow-brand-emerald/5 transition-all text-center"
              >
                <div className="h-12 w-12 rounded-lg bg-brand-mint/40 flex items-center justify-center mx-auto mb-3 group-hover:bg-brand-spring/20 transition-colors">
                  <Award className="h-6 w-6 text-brand-emerald group-hover:text-brand-spring transition-colors" />
                </div>
                <h3 className="font-semibold text-sm text-foreground group-hover:text-brand-primary transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {cat._count.products} {cat._count.products === 1 ? "service" : "services"}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Services ─────────────────────────── */}
      {featuredServices.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold text-brand-primary">
                  {featuredSection?.title || "Featured Services"}
                </h2>
                <p className="text-muted-foreground mt-2">
                  {featuredSection?.subtitle || "Our most popular i-Panel solutions trusted across Sri Lanka"}
                </p>
              </div>
              <Link
                href={featuredSection?.linkUrl || "/services"}
                className="hidden md:inline-flex items-center gap-2 text-sm font-semibold text-brand-primary hover:text-brand-emerald transition-colors"
              >
                View All Services
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredServices.map((service) => {
                const features: string[] = (() => {
                  try { return JSON.parse(service.features); } catch { return []; }
                })();

                return (
                  <Link
                    key={service.id}
                    href={`/services/${service.slug}`}
                    className="group rounded-xl border border-brand-emerald/10 bg-white p-6 hover:border-brand-emerald/30 hover:shadow-xl hover:shadow-brand-emerald/5 transition-all"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      {service.isFeatured && (
                        <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-brand-gold/20 text-brand-gold font-medium">
                          <Star className="h-3 w-3" />
                          Featured
                        </span>
                      )}
                      {service.category && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-mint/30 text-brand-emerald font-medium">
                          {service.category.name}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-foreground group-hover:text-brand-primary transition-colors mb-1">
                      {service.name}
                    </h3>
                    {service.subtitle && (
                      <p className="text-xs text-muted-foreground mb-3">{service.subtitle}</p>
                    )}
                    <ul className="space-y-1.5">
                      {features.slice(0, 4).map((f, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                          <CheckCircle className="h-3 w-3 text-brand-spring flex-shrink-0 mt-0.5" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      Learn More <ArrowRight className="h-3 w-3" />
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="mt-8 text-center md:hidden">
              <Link
                href={featuredSection?.linkUrl || "/services"}
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand-primary"
              >
                View All Services <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── Advantages Section ────────────────────────── */}
      {advantagesSection && (
        <section className="py-16 bg-brand-cream">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-brand-primary">
                {advantagesSection.title || "Why Choose i-Panel?"}
              </h2>
              <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
                {advantagesSection.subtitle || ""}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {advantageItems.map((adv, i) => {
                const Icon = getIcon(adv.icon);
                return (
                  <div
                    key={i}
                    className="p-6 rounded-xl border border-brand-emerald/10 bg-white hover:border-brand-emerald/30 hover:shadow-lg transition-all text-center"
                  >
                    <div className={`h-14 w-14 rounded-xl ${adv.color || "bg-brand-mint/30"} flex items-center justify-center mx-auto mb-4`}>
                      <Icon className="h-7 w-7 text-brand-primary" />
                    </div>
                    <h3 className="font-bold text-foreground mb-2">{adv.title}</h3>
                    <p className="text-sm text-muted-foreground">{adv.desc}</p>
                  </div>
                );
              })}
            </div>

            <div className="text-center mt-8">
              <Link
                href="/advantages"
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-primary/90 transition-colors"
              >
                See All Advantages
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── Stats Section ─────────────────────────────── */}
      {statsSection && statItems.length > 0 && (
        <section className="py-12 bg-white">
          <div className="max-w-5xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {statItems.map((stat, i) => {
                const Icon = getIcon(stat.icon);
                return (
                  <div key={i} className="text-center">
                    <Icon className={`h-8 w-8 ${stat.color || "text-brand-primary"} mx-auto mb-3`} />
                    <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ─── CTA Section ───────────────────────────────── */}
      {ctaSection && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div
              className="rounded-2xl p-10 md:p-14 text-center text-white relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #1B4332 0%, #2D6A4F 50%, #40916C 100%)",
              }}
            >
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-brand-spring/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-brand-teal/10 rounded-full blur-3xl" />

              <div className="relative">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  {ctaSection.title || "Ready to Transform Your Home?"}
                </h2>
                <p className="text-brand-sage/80 max-w-lg mx-auto mb-8">
                  {ctaSection.subtitle || "Get in touch with our team for a free consultation."}
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link
                    href={ctaSection.linkUrl || "/contact"}
                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-spring text-brand-dark font-bold rounded-lg hover:bg-brand-spring/90 transition-colors shadow-lg"
                  >
                    {ctaSection.linkText || "Get Free Quote"}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href={ctaSection.settings?.secondaryLinkUrl || "/services"}
                    className="inline-flex items-center gap-2 px-8 py-3.5 border border-white/20 text-white font-bold rounded-lg hover:bg-white/10 transition-colors"
                  >
                    {ctaSection.settings?.secondaryLinkText || "Browse Services"}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
