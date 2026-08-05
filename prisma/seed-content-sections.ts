/**
 * Seed ContentSection table with all hardcoded content from public pages
 * Run: DATABASE_URL="..." npx tsx prisma/seed-content-sections.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding ContentSections...");

  // Helper: upsert by unique [pageSlug, sectionKey]
  const upsert = (
    pageSlug: string,
    sectionKey: string,
    data: {
      type: string;
      title?: string | null;
      subtitle?: string | null;
      content?: string | null;
      items?: any;
      imageUrl?: string | null;
      linkUrl?: string | null;
      linkText?: string | null;
      sortOrder?: number;
      isActive?: boolean;
      settings?: any;
    }
  ) =>
    prisma.contentSection.upsert({
      where: { pageSlug_sectionKey: { pageSlug, sectionKey } },
      update: data,
      create: { pageSlug, sectionKey, ...data },
    });

  // ─── HOME PAGE ────────────────────────────────────────────────
  console.log("  → Home page sections...");

  await upsert("home", "hero", {
    type: "hero",
    title: "Sri Lanka's #1 i-Panel & Home Improvement Solution",
    subtitle:
      "Waterproof, fire-retardant, and 100% termite proof ceiling, wall cladding & roofing solutions with up to 15 years warranty.",
    linkUrl: "/services",
    linkText: "Explore Our Services",
    items: [
      { value: "1,875+", label: "Trees Saved/Month", color: "text-brand-spring" },
      { value: "15 Year", label: "Warranty", color: "text-brand-gold" },
      { value: "100%", label: "Termite Proof", color: "text-brand-teal" },
    ],
    sortOrder: 0,
  });

  await upsert("home", "categories", {
    type: "cards",
    title: "Our Product Categories",
    subtitle:
      "Discover our comprehensive range of i-Panel solutions, organized by series to help you find the perfect product for your project.",
    sortOrder: 1,
  });

  await upsert("home", "featured-services", {
    type: "features",
    title: "Featured Services",
    subtitle: "Our most popular i-Panel solutions trusted across Sri Lanka",
    linkUrl: "/services",
    linkText: "View All Services",
    sortOrder: 2,
  });

  await upsert("home", "advantages", {
    type: "cards",
    title: "Why Choose i-Panel?",
    subtitle:
      "Engineered for Sri Lanka's tropical climate with advantages that make i-Panel the smartest choice for your home.",
    items: [
      { icon: "Droplets", title: "100% Waterproof", desc: "No warping, no mold, no water damage — ever", color: "bg-brand-teal/10 text-brand-teal" },
      { icon: "Flame", title: "Fire-Retardant", desc: "Certified fire safety for your family and property", color: "bg-red-500/10 text-red-500" },
      { icon: "Bug", title: "100% Termite Proof", desc: "Complete protection against termites and moths", color: "bg-brand-gold/10 text-brand-gold" },
      { icon: "Wrench", title: "Click-it System", desc: "Fast, seamless installation with no extra trims", color: "bg-brand-spring/10 text-brand-spring" },
      { icon: "Shield", title: "15 Year Warranty", desc: "One of the longest warranties in the industry", color: "bg-brand-primary/10 text-brand-primary" },
      { icon: "TreePine", title: "Eco-Friendly", desc: "Saves 1,875+ trees every month", color: "bg-brand-spring/10 text-brand-spring" },
    ],
    sortOrder: 3,
  });

  await upsert("home", "cta", {
    type: "cta",
    title: "Ready to Transform Your Home?",
    subtitle:
      "Get in touch with our team for a free consultation and discover how i-Panel can elevate your living space with premium, maintenance-free solutions.",
    linkUrl: "/contact",
    linkText: "Get Free Quote",
    settings: { secondaryLinkUrl: "/services", secondaryLinkText: "Browse Services" },
    sortOrder: 4,
  });

  await upsert("home", "stats", {
    type: "stats",
    items: [
      { value: "1,875+", label: "Trees Saved Monthly", icon: "TreePine", color: "text-brand-spring" },
      { value: "15+", label: "Year Warranty", icon: "Shield", color: "text-brand-gold" },
      { value: "100%", label: "Termite Proof", icon: "Shield", color: "text-brand-teal" },
      { value: "500+", label: "Happy Customers", icon: "Users", color: "text-brand-emerald" },
    ],
    sortOrder: 5,
  });

  // ─── ABOUT PAGE ───────────────────────────────────────────────
  console.log("  → About page sections...");

  await upsert("about", "hero", {
    type: "hero",
    title: "About Wedabime Pramukayo",
    subtitle:
      "Total focus on the needs of our clients — delivering quality construction solutions across Sri Lanka.",
    sortOrder: 0,
  });

  await upsert("about", "intro", {
    type: "text",
    title: "Our Story",
    content:
      "<h2>Who We Are</h2><p>Wedabime Pramukayo is Sri Lanka's leading provider of premium i-Panel solutions for ceiling, wall cladding, and roofing applications. With a total focus on the needs of our clients, we deliver quality construction solutions that stand the test of time.</p><h3>Our Commitment</h3><p>Every product we offer is engineered for Sri Lanka's tropical climate — waterproof, fire-retardant, and 100% termite proof. We believe in building for generations, not just for today.</p>",
    sortOrder: 1,
  });

  await upsert("about", "values", {
    type: "cards",
    title: "Our Core Values",
    items: [
      { icon: "Eye", title: "Vision", desc: "Committed to delivering excellence in every project we undertake.", color: "text-brand-primary bg-brand-primary/10" },
      { icon: "Target", title: "Mission", desc: "Committed to delivering excellence in every project we undertake.", color: "text-brand-emerald bg-brand-emerald/10" },
      { icon: "Heart", title: "Integrity", desc: "Committed to delivering excellence in every project we undertake.", color: "text-brand-teal bg-brand-teal/10" },
      { icon: "Zap", title: "Fast & Quality", desc: "Committed to delivering excellence in every project we undertake.", color: "text-brand-gold bg-brand-gold/10" },
    ],
    sortOrder: 2,
  });

  await upsert("about", "stats", {
    type: "stats",
    items: [
      { value: "1,875+", label: "Trees Saved Monthly", icon: "TreePine", color: "text-brand-spring" },
      { value: "15 Yrs", label: "Maximum Warranty", icon: "Shield", color: "text-brand-gold" },
      { value: "100%", label: "Termite Proof", icon: "Shield", color: "text-brand-teal" },
      { value: "5+", label: "Product Series", icon: "Users", color: "text-brand-emerald" },
    ],
    sortOrder: 3,
  });

  await upsert("about", "cta", {
    type: "cta",
    title: "Ready to Work With Us?",
    subtitle: "Contact our team for a free consultation.",
    linkUrl: "/contact",
    linkText: "Get in Touch",
    sortOrder: 4,
  });

  // ─── ADVANTAGES PAGE ──────────────────────────────────────────
  console.log("  → Advantages page sections...");

  await upsert("advantages", "hero", {
    type: "hero",
    title: "The Wedabime Pramukayo Advantage",
    subtitle:
      "Built for generations — discover the advantages that make i-Panel the smartest choice for Sri Lankan homes and businesses.",
    sortOrder: 0,
  });

  await upsert("advantages", "advantages-list", {
    type: "cards",
    title: "Why Choose i-Panel?",
    items: [
      { icon: "Shield", title: "Built for Generations", desc: "i-Panel products are not just built for today — they are built for generations. The superior engineering and premium raw materials ensure that your investment stands the test of time, providing reliable performance year after year without degradation.", color: "bg-brand-primary/10 text-brand-primary" },
      { icon: "Clock", title: "Engineered for Tropical Climates", desc: "Sri Lanka's tropical climate demands materials that can withstand intense heat, heavy monsoon rains, and high humidity. i-Panel products are specifically engineered to tolerate these conditions, maintaining their structural integrity and appearance regardless of weather extremes.", color: "bg-brand-emerald/10 text-brand-emerald" },
      { icon: "Droplets", title: "100% Waterproof", desc: "Water damage is one of the leading causes of deterioration in traditional building materials. i-Panel's waterproof construction ensures that your ceilings, walls, and roofs remain pristine and damage-free even in the heaviest downpours and most humid conditions.", color: "bg-brand-teal/10 text-brand-teal" },
      { icon: "Flame", title: "Fire-Retardant", desc: "Safety is paramount. i-Panel products feature fire-retardant properties that provide an additional layer of protection for your family and property. This critical safety feature meets international standards and offers peace of mind that conventional materials simply cannot match.", color: "bg-red-500/10 text-red-500" },
      { icon: "Bug", title: "100% Termite & Moth Proof", desc: "In a tropical country like Sri Lanka, termite damage is a constant threat to traditional wood-based materials. i-Panel products are 100% termite and moth proof, eliminating one of the most costly and frustrating maintenance issues that homeowners face.", color: "bg-brand-gold/10 text-brand-gold" },
      { icon: "Wrench", title: "Click-it System", desc: "The innovative Click-it System allows for quick, seamless installation with no extra trims required. This revolutionary approach means faster project completion and significantly lower labor costs, without compromising on the quality or appearance of the finished installation.", color: "bg-brand-spring/10 text-brand-spring" },
      { icon: "ThumbsUp", title: "Completely Maintenance-Free", desc: "Say goodbye to sanding, priming, and painting forever. i-Panel products are completely maintenance-free, featuring washability and color stability that keeps them looking new for years. This saves you both time and money over the life of the product.", color: "bg-brand-lime/10 text-brand-lime" },
      { icon: "Award", title: "Up to 15 Years Warranty", desc: "Our confidence in i-Panel products is backed by a warranty of up to 15 years — one of the longest in the industry. This warranty reflects the exceptional quality and durability built into every product, giving you complete confidence in your investment.", color: "bg-brand-warm/10 text-brand-warm" },
      { icon: "TreePine", title: "Eco-Friendly — 1,875+ Trees Monthly", desc: "Choosing i-Panel isn't just smart for your home — it's smart for the planet. Our products save over 1,875 trees every month by providing a sustainable alternative to traditional wood-based construction materials. Every installation contributes to preserving Sri Lanka's precious forests.", color: "bg-brand-spring/10 text-brand-spring" },
    ],
    sortOrder: 1,
  });

  await upsert("advantages", "cta", {
    type: "cta",
    title: "Experience the i-Panel Advantage",
    subtitle:
      "Ready to transform your home with premium, maintenance-free i-Panel solutions? Get in touch for a free consultation.",
    linkUrl: "/contact",
    linkText: "Get Free Quote",
    settings: { secondaryLinkUrl: "/services", secondaryLinkText: "Browse Services" },
    sortOrder: 2,
  });

  // ─── CONTACT PAGE ─────────────────────────────────────────────
  console.log("  → Contact page sections...");

  await upsert("contact", "hero", {
    type: "hero",
    title: "Get In Touch",
    subtitle:
      "Get in touch for a free consultation, quote, or any questions about our i-Panel solutions.",
    sortOrder: 0,
  });

  await upsert("contact", "info", {
    type: "cards",
    title: "Business Information",
    items: [
      { icon: "MapPin", title: "Address", desc: "Gampaha District, Sri Lanka", color: "bg-brand-primary/10 text-brand-primary" },
      { icon: "Clock", title: "Business Hours", desc: "Monday - Saturday: 8:00 AM - 6:00 PM\nSunday: Closed", color: "bg-brand-emerald/10 text-brand-emerald" },
      { icon: "Phone", title: "Phone", desc: "Call us for immediate assistance", color: "bg-brand-teal/10 text-brand-teal" },
      { icon: "Mail", title: "Email", desc: "We respond within 24 hours", color: "bg-brand-gold/10 text-brand-gold" },
    ],
    sortOrder: 1,
  });

  await upsert("contact", "eco-badge", {
    type: "cards",
    title: "Eco Impact",
    subtitle: "Choosing i-Panel saves trees",
    items: [
      { value: "1,875+", label: "Trees saved every month", icon: "TreePine" },
    ],
    sortOrder: 2,
  });

  await upsert("contact", "warranty-badge", {
    type: "cards",
    title: "Up to 15 Years Warranty",
    subtitle: "Quality you can trust, backed by our comprehensive warranty.",
    items: [],
    sortOrder: 3,
  });

  // ─── SERVICES PAGE ────────────────────────────────────────────
  console.log("  → Services page sections...");

  await upsert("services", "hero", {
    type: "hero",
    title: "Our Services & Products",
    subtitle:
      "Explore our comprehensive range of i-Panel solutions designed for Sri Lanka.",
    sortOrder: 0,
  });

  // ─── BLOG PAGE ────────────────────────────────────────────────
  console.log("  → Blog page sections...");

  await upsert("blog", "hero", {
    type: "hero",
    title: "Latest Insights & Tips",
    subtitle:
      "Tips, guides, and insights about i-Panel solutions for Sri Lankan homes and businesses.",
    sortOrder: 0,
  });

  console.log("✅ All ContentSections seeded!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
