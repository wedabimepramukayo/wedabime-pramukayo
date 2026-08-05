/**
 * Contact Page — Wedabime Pramukayo
 * CMS-driven contact page with form, business information from ContentSection
 */

import { db } from "@/lib/db";
import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { getIcon } from "@/lib/icon-map";
import ContactClient from "./contact-client";
import { MapPin, Shield, TreePine } from "lucide-react";

export const dynamic = 'force-dynamic';
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

export default async function ContactPage() {
  let sectionsMap: Record<string, ContentSectionData> = {};

  try {
    const sections = await db.contentSection.findMany({
      where: { pageSlug: "contact", isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    sections.forEach((s) => {
      sectionsMap[s.sectionKey] = {
        ...s,
        items: s.items as SectionItem[] | null,
        settings: s.settings as Record<string, any> | null,
      };
    });
  } catch (error) {
    console.error("Failed to fetch contact page sections:", error);
  }

  const hero = sectionsMap["hero"];
  const infoSection = sectionsMap["info"];
  const ecoBadge = sectionsMap["eco-badge"];
  const warrantyBadge = sectionsMap["warranty-badge"];

  const infoItems = (infoSection?.items || []) as SectionItem[];
  const ecoItems = (ecoBadge?.items || []) as SectionItem[];

  return (
    <div>
      <Breadcrumbs items={[{ label: "Contact Us" }]} />
      {/* Hero */}
      <section className="relative py-20 text-white" style={{ background: "linear-gradient(135deg, #1B4332 0%, #2D6A4F 60%, #40916C 100%)" }}>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold">{hero?.title || "Contact Us"}</h1>
          <p className="text-lg text-brand-sage/80 mt-4 max-w-2xl mx-auto">
            {hero?.subtitle || "Get in touch for a free consultation, quote, or any questions about our i-Panel solutions."}
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16 bg-brand-cream">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-10">
            {/* Contact Form (Client Component) */}
            <ContactClient />

            {/* Contact Info (Server-Rendered from CMS) */}
            <div className="space-y-6">
              {/* Business Info Cards */}
              <div className="p-6 rounded-xl border border-brand-emerald/10 bg-white space-y-5">
                <h2 className="text-xl font-bold text-brand-primary">
                  {infoSection?.title || "Business Information"}
                </h2>
                <div className="space-y-4">
                  {infoItems.map((item, i) => {
                    const Icon = getIcon(item.icon);
                    const descLines = (item.desc || "").split("\n");
                    return (
                      <div key={i} className="flex items-start gap-3">
                        <div className={`h-10 w-10 rounded-lg ${item.color || "bg-brand-primary/10 text-brand-primary"} flex items-center justify-center flex-shrink-0`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{item.title}</div>
                          {descLines.map((line, li) => (
                            <div key={li} className="text-sm text-muted-foreground">{line}</div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Eco Badge */}
              {ecoBadge && ecoItems.length > 0 && (
                <div className="p-6 rounded-xl border border-brand-emerald/10 bg-white">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-lg bg-brand-spring/10 flex items-center justify-center">
                      <TreePine className="h-5 w-5 text-brand-spring" />
                    </div>
                    <div>
                      <div className="font-bold text-foreground">{ecoBadge.title || "Eco Impact"}</div>
                      <div className="text-sm text-muted-foreground">{ecoBadge.subtitle || "Choosing i-Panel saves trees"}</div>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-brand-spring">{ecoItems[0]?.value || "1,875+"}</div>
                  <div className="text-sm text-muted-foreground">{ecoItems[0]?.label || "Trees saved every month"}</div>
                </div>
              )}

              {/* Warranty Badge */}
              {warrantyBadge && (
                <div className="p-6 rounded-xl border border-brand-gold/10 bg-brand-gold/5">
                  <div className="flex items-center gap-3">
                    <Shield className="h-8 w-8 text-brand-gold" />
                    <div>
                      <div className="font-bold text-foreground">{warrantyBadge.title || "Up to 15 Years Warranty"}</div>
                      <div className="text-sm text-muted-foreground">{warrantyBadge.subtitle || "Quality you can trust, backed by our comprehensive warranty."}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Map Placeholder */}
              <div className="rounded-xl border border-brand-emerald/10 bg-brand-mint/20 h-48 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-8 w-8 text-brand-emerald/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Set address in Site Settings</p>
                  <p className="text-xs text-muted-foreground/60">Map integration available in production</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
