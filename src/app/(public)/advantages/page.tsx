/**
 * Advantages Page — Wedabime Pramukayo
 * Dynamic page content showing i-Panel benefits (Waasi)
 */

// Force dynamic rendering — page queries database at request time
export const dynamic = 'force-dynamic';

import { db } from "@/lib/db";
import Link from "next/link";
import { ArrowRight, Droplets, Flame, Bug, Wrench, Shield, TreePine, Clock, Award, ThumbsUp } from "lucide-react";
import { Breadcrumbs } from "@/components/public/breadcrumbs";

export const revalidate = 60;

export async function generateMetadata() {
  const page = await db.page.findUnique({ where: { slug: "advantages" } });
  return {
    title: page?.metaTitle || "Advantages | Why Choose i-Panel",
    description: page?.metaDesc || "Discover why i-Panel is the smartest choice — waterproof, fire-retardant, termite-proof, maintenance-free.",
  };
}

const advantageCards = [
  { icon: Shield, title: "Built for Generations", desc: "i-Panel products are not just built for today — they are built for generations. The superior engineering and premium raw materials ensure that your investment stands the test of time, providing reliable performance year after year without degradation.", color: "bg-brand-primary/10 text-brand-primary" },
  { icon: Clock, title: "Engineered for Tropical Climates", desc: "Sri Lanka's tropical climate demands materials that can withstand intense heat, heavy monsoon rains, and high humidity. i-Panel products are specifically engineered to tolerate these conditions, maintaining their structural integrity and appearance regardless of weather extremes.", color: "bg-brand-emerald/10 text-brand-emerald" },
  { icon: Droplets, title: "100% Waterproof", desc: "Water damage is one of the leading causes of deterioration in traditional building materials. i-Panel's waterproof construction ensures that your ceilings, walls, and roofs remain pristine and damage-free even in the heaviest downpours and most humid conditions.", color: "bg-brand-teal/10 text-brand-teal" },
  { icon: Flame, title: "Fire-Retardant", desc: "Safety is paramount. i-Panel products feature fire-retardant properties that provide an additional layer of protection for your family and property. This critical safety feature meets international standards and offers peace of mind that conventional materials simply cannot match.", color: "bg-red-500/10 text-red-500" },
  { icon: Bug, title: "100% Termite & Moth Proof", desc: "In a tropical country like Sri Lanka, termite damage is a constant threat to traditional wood-based materials. i-Panel products are 100% termite and moth proof, eliminating one of the most costly and frustrating maintenance issues that homeowners face.", color: "bg-brand-gold/10 text-brand-gold" },
  { icon: Wrench, title: "Click-it System", desc: "The innovative Click-it System allows for quick, seamless installation with no extra trims required. This revolutionary approach means faster project completion and significantly lower labor costs, without compromising on the quality or appearance of the finished installation.", color: "bg-brand-spring/10 text-brand-spring" },
  { icon: ThumbsUp, title: "Completely Maintenance-Free", desc: "Say goodbye to sanding, priming, and painting forever. i-Panel products are completely maintenance-free, featuring washability and color stability that keeps them looking new for years. This saves you both time and money over the life of the product.", color: "bg-brand-lime/10 text-brand-lime" },
  { icon: Award, title: "Up to 15 Years Warranty", desc: "Our confidence in i-Panel products is backed by a warranty of up to 15 years — one of the longest in the industry. This warranty reflects the exceptional quality and durability built into every product, giving you complete confidence in your investment.", color: "bg-brand-warm/10 text-brand-warm" },
  { icon: TreePine, title: "Eco-Friendly — 1,875+ Trees Monthly", desc: "Choosing i-Panel isn't just smart for your home — it's smart for the planet. Our products save over 1,875 trees every month by providing a sustainable alternative to traditional wood-based construction materials. Every installation contributes to preserving Sri Lanka's precious forests.", color: "bg-brand-spring/10 text-brand-spring" },
];

export default async function AdvantagesPage() {
  const page = await db.page.findUnique({ where: { slug: "advantages" } });

  return (
    <div>
      <Breadcrumbs items={[{ label: "Advantages" }]} />
      {/* Hero */}
      <section className="relative py-20 text-white" style={{ background: "linear-gradient(135deg, #1B4332 0%, #2D6A4F 60%, #40916C 100%)" }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-20 w-72 h-72 bg-brand-spring/20 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold">{page?.heroTitle || "Why Choose i-Panel?"}</h1>
          <p className="text-lg text-brand-sage/80 mt-4 max-w-2xl mx-auto">
            {page?.heroSubtitle || "Built for generations — discover the advantages that make i-Panel the smartest choice for Sri Lankan homes and businesses."}
          </p>
        </div>
      </section>

      {/* Advantages Grid */}
      <section className="py-16 bg-brand-cream">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {advantageCards.map((adv) => {
              const Icon = adv.icon;
              return (
                <div key={adv.title} className="p-6 rounded-xl border border-brand-emerald/10 bg-white hover:border-brand-emerald/30 hover:shadow-lg transition-all">
                  <div className={`h-14 w-14 rounded-xl ${adv.color} flex items-center justify-center mb-4`}>
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

      {/* CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-brand-primary mb-4">Experience the i-Panel Advantage</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Ready to transform your home with premium, maintenance-free i-Panel solutions? Get in touch for a free consultation.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-primary/90 transition-colors">
              Get Free Quote <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/services" className="inline-flex items-center gap-2 px-6 py-3 border border-brand-primary text-brand-primary font-semibold rounded-lg hover:bg-brand-mint/30 transition-colors">
              Browse Services
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
