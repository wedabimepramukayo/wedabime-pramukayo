/**
 * About Page — Wedabime Pramukayo
 * Dynamic page content from CMS with vision, mission, and company info
 */

import { db } from "@/lib/db";
import Link from "next/link";
import { ArrowRight, Eye, Target, Heart, Zap, TreePine, Shield, Users } from "lucide-react";
import { Breadcrumbs } from "@/components/public/breadcrumbs";

export const revalidate = 60;

async function getAboutData() {
  const page = await db.page.findUnique({ where: { slug: "about" } });
  return { page };
}

export async function generateMetadata() {
  const page = await db.page.findUnique({ where: { slug: "about" } });
  return {
    title: page?.metaTitle || "About Us",
    description: page?.metaDesc || "Learn about Wedabime Pramukayo — Sri Lanka's trusted construction solutions provider.",
  };
}

const values = [
  { icon: Eye, title: "Vision", color: "text-brand-primary bg-brand-primary/10" },
  { icon: Target, title: "Mission", color: "text-brand-emerald bg-brand-emerald/10" },
  { icon: Heart, title: "Integrity", color: "text-brand-teal bg-brand-teal/10" },
  { icon: Zap, title: "Fast & Quality", color: "text-brand-gold bg-brand-gold/10" },
];

const stats = [
  { value: "1,875+", label: "Trees Saved Monthly", icon: TreePine, color: "text-brand-spring" },
  { value: "15 Yrs", label: "Maximum Warranty", icon: Shield, color: "text-brand-gold" },
  { value: "100%", label: "Termite Proof", icon: Shield, color: "text-brand-teal" },
  { value: "5+", label: "Product Series", icon: Users, color: "text-brand-emerald" },
];

export default async function AboutPage() {
  const { page } = await getAboutData();

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
          <h1 className="text-4xl md:text-5xl font-bold">{page?.heroTitle || "About Us"}</h1>
          <p className="text-lg text-brand-sage/80 mt-4 max-w-2xl mx-auto">
            {page?.heroSubtitle || "Total focus on the needs of our clients — delivering quality construction solutions across Sri Lanka."}
          </p>
        </div>
      </section>

      {/* CMS Content */}
      {page?.content && (
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <div
              className="prose prose-lg max-w-none text-foreground/80 leading-relaxed [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-brand-primary [&_h2]:mt-8 [&_h2]:mb-4 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-brand-emerald [&_h3]:mt-6 [&_h3]:mb-3 [&_p]:mb-4"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          </div>
        </section>
      )}

      {/* Our Values */}
      <section className="py-16 bg-brand-cream">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-brand-primary text-center mb-10">Our Core Values</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.title} className="p-6 rounded-xl bg-white border border-brand-emerald/10 text-center hover:shadow-lg transition-shadow">
                  <div className={`h-14 w-14 rounded-xl ${v.color} flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{v.title}</h3>
                  <p className="text-sm text-muted-foreground">Committed to delivering excellence in every project we undertake.</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center">
                  <Icon className={`h-8 w-8 ${stat.color} mx-auto mb-3`} />
                  <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-brand-cream">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-brand-primary mb-4">Ready to Work With Us?</h2>
          <p className="text-muted-foreground mb-6">Contact our team for a free consultation.</p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-primary/90 transition-colors"
          >
            Get in Touch <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
