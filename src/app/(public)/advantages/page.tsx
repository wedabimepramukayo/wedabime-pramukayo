/**
 * Advantages Page — Wedabime Pramukayo
 * CMS-driven page content showing i-Panel benefits (Waasi)
 * All content fetched from ContentSection table
 */

// Force dynamic rendering — page queries database at request time
export const dynamic = 'force-dynamic';

import { db } from "@/lib/db";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { getIcon } from "@/lib/icon-map";

export const revalidate = 60;

interface SectionItem {
  icon?: string;
  title?: string;
  desc?: string;
  color?: string;
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

export async function generateMetadata() {
  try {
    const page = await db.page.findUnique({ where: { slug: "advantages" } });
    return {
      title: page?.metaTitle || "Advantages | Why Choose i-Panel",
      description: page?.metaDesc || "Discover why i-Panel is the smartest choice — waterproof, fire-retardant, termite-proof, maintenance-free.",
    };
  } catch (error) {
    console.error("Failed to fetch advantages metadata:", error);
    return {
      title: "Advantages | Why Choose i-Panel",
      description: "Discover why i-Panel is the smartest choice — waterproof, fire-retardant, termite-proof, maintenance-free.",
    };
  }
}

export default async function AdvantagesPage() {
  let page: any = null;
  let sectionsMap: Record<string, ContentSectionData> = {};

  try {
    const [pageData, sections] = await Promise.all([
      db.page.findUnique({ where: { slug: "advantages" } }),
      db.contentSection.findMany({
        where: { pageSlug: "advantages", isActive: true },
        orderBy: { sortOrder: "asc" },
      }),
    ]);

    page = pageData;
    sections.forEach((s) => {
      sectionsMap[s.sectionKey] = {
        ...s,
        items: s.items as SectionItem[] | null,
        settings: s.settings as Record<string, any> | null,
      };
    });
  } catch (error) {
    console.error("Failed to fetch advantages page data:", error);
  }

  const hero = sectionsMap["hero"];
  const advantagesList = sectionsMap["advantages-list"];
  const ctaSection = sectionsMap["cta"];

  const advantageItems = (advantagesList?.items || []) as SectionItem[];

  return (
    <div>
      <Breadcrumbs items={[{ label: "Advantages" }]} />
      {/* Hero */}
      <section className="relative py-20 text-white" style={{ background: "linear-gradient(135deg, #1B4332 0%, #2D6A4F 60%, #40916C 100%)" }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-20 w-72 h-72 bg-brand-spring/20 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold">{hero?.title || page?.heroTitle || "Why Choose i-Panel?"}</h1>
          <p className="text-lg text-brand-sage/80 mt-4 max-w-2xl mx-auto">
            {hero?.subtitle || page?.heroSubtitle || "Built for generations — discover the advantages that make i-Panel the smartest choice for Sri Lankan homes and businesses."}
          </p>
        </div>
      </section>

      {/* Advantages Grid */}
      {advantagesList && advantageItems.length > 0 && (
        <section className="py-16 bg-brand-cream">
          <div className="max-w-7xl mx-auto px-4">
            {advantagesList.title && (
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-brand-primary">{advantagesList.title}</h2>
                {advantagesList.subtitle && (
                  <p className="text-muted-foreground mt-2 max-w-lg mx-auto">{advantagesList.subtitle}</p>
                )}
              </div>
            )}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {advantageItems.map((adv, i) => {
                const Icon = getIcon(adv.icon);
                return (
                  <div key={i} className="p-6 rounded-xl border border-brand-emerald/10 bg-white hover:border-brand-emerald/30 hover:shadow-lg transition-all">
                    <div className={`h-14 w-14 rounded-xl ${adv.color || "bg-brand-primary/10 text-brand-primary"} flex items-center justify-center mb-4`}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-3">{adv.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{adv.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      {ctaSection && (
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-brand-primary mb-4">
              {ctaSection.title || "Experience the i-Panel Advantage"}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              {ctaSection.subtitle || "Ready to transform your home with premium, maintenance-free i-Panel solutions? Get in touch for a free consultation."}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href={ctaSection.linkUrl || "/contact"} className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-primary/90 transition-colors">
                {ctaSection.linkText || "Get Free Quote"} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href={ctaSection.settings?.secondaryLinkUrl || "/services"} className="inline-flex items-center gap-2 px-6 py-3 border border-brand-primary text-brand-primary font-semibold rounded-lg hover:bg-brand-mint/30 transition-colors">
                {ctaSection.settings?.secondaryLinkText || "Browse Services"}
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
