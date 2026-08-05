/**
 * About Page — Wedabime Pramukayo
 * CMS-driven page content from ContentSection table
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
  value?: string;
  label?: string;
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

async function getAboutData() {
  try {
    const [page, sections] = await Promise.all([
      db.page.findUnique({ where: { slug: "about" } }),
      db.contentSection.findMany({
        where: { pageSlug: "about", isActive: true },
        orderBy: { sortOrder: "asc" },
      }),
    ]);

    const sectionsMap: Record<string, ContentSectionData> = {};
    sections.forEach((s) => {
      sectionsMap[s.sectionKey] = {
        ...s,
        items: s.items as SectionItem[] | null,
        settings: s.settings as Record<string, any> | null,
      };
    });

    return { page, sectionsMap };
  } catch (error) {
    console.error("Failed to fetch about page data:", error);
    return { page: null, sectionsMap: {} as Record<string, ContentSectionData> };
  }
}

export async function generateMetadata() {
  try {
    const page = await db.page.findUnique({ where: { slug: "about" } });
    return {
      title: page?.metaTitle || "About Us",
      description: page?.metaDesc || "Learn about Wedabime Pramukayo — Sri Lanka's trusted construction solutions provider.",
    };
  } catch (error) {
    console.error("Failed to fetch about metadata:", error);
    return {
      title: "About Us",
      description: "Learn about Wedabime Pramukayo — Sri Lanka's trusted construction solutions provider.",
    };
  }
}

export default async function AboutPage() {
  const { page, sectionsMap } = await getAboutData();

  const hero = sectionsMap["hero"];
  const intro = sectionsMap["intro"];
  const valuesSection = sectionsMap["values"];
  const statsSection = sectionsMap["stats"];
  const ctaSection = sectionsMap["cta"];

  const valueItems = (valuesSection?.items || []) as SectionItem[];
  const statItems = (statsSection?.items || []) as SectionItem[];

  return (
    <div>
      <Breadcrumbs items={[{ label: "About Us" }]} />
      {/* Hero */}
      <section
        className="relative py-20 text-white"
        style={{ background: "linear-gradient(135deg, #1B4332 0%, #2D6A4F 60%, #40916C 100%)" }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-20 w-72 h-72 bg-brand-spring/20 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold">{hero?.title || page?.heroTitle || "About Us"}</h1>
          <p className="text-lg text-brand-sage/80 mt-4 max-w-2xl mx-auto">
            {hero?.subtitle || page?.heroSubtitle || "Total focus on the needs of our clients — delivering quality construction solutions across Sri Lanka."}
          </p>
        </div>
      </section>

      {/* Intro / CMS Content */}
      {(intro?.content || page?.content) && (
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            {intro?.title && (
              <h2 className="text-3xl font-bold text-brand-primary text-center mb-8">{intro.title}</h2>
            )}
            <div
              className="prose prose-lg max-w-none text-foreground/80 leading-relaxed [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-brand-primary [&_h2]:mt-8 [&_h2]:mb-4 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-brand-emerald [&_h3]:mt-6 [&_h3]:mb-3 [&_p]:mb-4"
              dangerouslySetInnerHTML={{ __html: intro?.content || page?.content || "" }}
            />
          </div>
        </section>
      )}

      {/* Our Values */}
      {valuesSection && valueItems.length > 0 && (
        <section className="py-16 bg-brand-cream">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-brand-primary text-center mb-10">
              {valuesSection.title || "Our Core Values"}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {valueItems.map((v, i) => {
                const Icon = getIcon(v.icon);
                return (
                  <div key={i} className="p-6 rounded-xl bg-white border border-brand-emerald/10 text-center hover:shadow-lg transition-shadow">
                    <div className={`h-14 w-14 rounded-xl ${v.color || "bg-brand-primary/10 text-brand-primary"} flex items-center justify-center mx-auto mb-4`}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="font-bold text-foreground mb-2">{v.title}</h3>
                    <p className="text-sm text-muted-foreground">{v.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Stats */}
      {statsSection && statItems.length > 0 && (
        <section className="py-16 bg-white">
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

      {/* CTA */}
      {ctaSection && (
        <section className="py-12 bg-brand-cream">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-brand-primary mb-4">
              {ctaSection.title || "Ready to Work With Us?"}
            </h2>
            <p className="text-muted-foreground mb-6">
              {ctaSection.subtitle || "Contact our team for a free consultation."}
            </p>
            <Link
              href={ctaSection.linkUrl || "/contact"}
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-primary/90 transition-colors"
            >
              {ctaSection.linkText || "Get in Touch"} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
