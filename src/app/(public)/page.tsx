/**
 * Home Page — Wedabime Pramukayo
 * Dynamic homepage with hero, featured services, advantages, and CTA
 */

// Force dynamic rendering — page queries database at request time
export const dynamic = 'force-dynamic';

import { db } from "@/lib/db";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Shield,
  Droplets,
  Flame,
  Bug,
  Wrench,
  TreePine,
  Award,
  CheckCircle,
  Star,
} from "lucide-react";

export const revalidate = 60; // Revalidate every 60 seconds

async function getHomeData() {
  const [pages, featuredServices, categories, settings] = await Promise.all([
    db.page.findUnique({ where: { slug: "home" } }),
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
    db.siteSetting.findMany({ where: { category: "general" } }),
  ]);

  const settingsMap: Record<string, string> = {};
  settings.forEach((s) => { settingsMap[s.key] = s.value; });

  return { pages, featuredServices, categories, settingsMap };
}

const advantages = [
  { icon: Droplets, title: "100% Waterproof", desc: "No warping, no mold, no water damage — ever" },
  { icon: Flame, title: "Fire-Retardant", desc: "Certified fire safety for your family and property" },
  { icon: Bug, title: "100% Termite Proof", desc: "Complete protection against termites and moths" },
  { icon: Wrench, title: "Click-it System", desc: "Fast, seamless installation with no extra trims" },
  { icon: Shield, title: "15 Year Warranty", desc: "One of the longest warranties in the industry" },
  { icon: TreePine, title: "Eco-Friendly", desc: "Saves 1,875+ trees every month" },
];

export default async function HomePage() {
  const { pages, featuredServices, categories, settingsMap } = await getHomeData();
  const homePage = pages;

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
                {homePage?.heroTitle || "Premium i-Panel Solutions for Sri Lanka"}
              </h1>
              <p className="text-lg text-brand-sage/80 max-w-xl leading-relaxed">
                {homePage?.heroSubtitle || "Waterproof, fire-retardant, and 100% termite proof ceiling, wall cladding & roofing solutions with up to 15 years warranty."}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/services"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-brand-spring text-brand-dark font-semibold rounded-lg hover:bg-brand-spring/90 transition-colors shadow-lg"
                >
                  Explore Services
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/advantages"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
                >
                  Why i-Panel?
                </Link>
              </div>

              {/* Quick Stats */}
              <div className="flex items-center gap-6 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-brand-spring">1,875+</div>
                  <div className="text-[10px] text-brand-sage/60">Trees Saved/Mo</div>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-brand-gold">15 Yrs</div>
                  <div className="text-[10px] text-brand-sage/60">Warranty</div>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-brand-teal">100%</div>
                  <div className="text-[10px] text-brand-sage/60">Termite Proof</div>
                </div>
              </div>
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
            <h2 className="text-3xl font-bold text-brand-primary">Our Product Categories</h2>
            <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
              Discover our comprehensive range of i-Panel solutions, organized by series to help you find the perfect product for your project.
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
                <h2 className="text-3xl font-bold text-brand-primary">Featured Services</h2>
                <p className="text-muted-foreground mt-2">
                  Our most popular i-Panel solutions trusted across Sri Lanka
                </p>
              </div>
              <Link
                href="/services"
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
                href="/services"
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand-primary"
              >
                View All Services <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── Advantages Section ────────────────────────── */}
      <section className="py-16 bg-brand-cream">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-brand-primary">Why Choose i-Panel?</h2>
            <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
              Engineered for Sri Lanka&apos;s tropical climate with advantages that make i-Panel the smartest choice for your home.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {advantages.map((adv) => {
              const Icon = adv.icon;
              return (
                <div
                  key={adv.title}
                  className="p-6 rounded-xl border border-brand-emerald/10 bg-white hover:border-brand-emerald/30 hover:shadow-lg transition-all text-center"
                >
                  <div className="h-14 w-14 rounded-xl bg-brand-mint/30 flex items-center justify-center mx-auto mb-4">
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

      {/* ─── CTA Section ───────────────────────────────── */}
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
                Ready to Transform Your Home?
              </h2>
              <p className="text-brand-sage/80 max-w-lg mx-auto mb-8">
                Get in touch with our team for a free consultation and discover how i-Panel can elevate your living space with premium, maintenance-free solutions.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-spring text-brand-dark font-bold rounded-lg hover:bg-brand-spring/90 transition-colors shadow-lg"
                >
                  Get Free Quote
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/services"
                  className="inline-flex items-center gap-2 px-8 py-3.5 border border-white/20 text-white font-bold rounded-lg hover:bg-white/10 transition-colors"
                >
                  Browse Services
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
