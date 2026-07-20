/**
 * Seed Script - Wedabime Pramukayo CMS
 * Populates the database with initial admin user, default pages,
 * product categories, i-Panel products, and site settings.
 *
 * Usage: bun run scripts/seed.ts
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Wedabime Pramukayo CMS database...\n");

  // ─── 1. Create Admin User ──────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL || "admin@wedabimepramukayo.site";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@2025Secure!";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash, name: "Administrator" },
    create: {
      email: adminEmail,
      name: "Administrator",
      passwordHash,
      role: "admin",
      isActive: true,
    },
  });
  console.log(`✅ Admin user created: ${admin.email}`);

  // ─── 2. Create Default Pages ──────────────────────────────
  const pages = [
    {
      slug: "home",
      title: "Home",
      heroTitle: "Built for Generations",
      heroSubtitle:
        "Premium i-Panel ceiling, wall cladding & roofing solutions engineered for Sri Lanka's tropical climate. Waterproof, fire-retardant, and 100% termite proof.",
      content: `<section>
  <h2>Welcome to Wedabime Pramukayo</h2>
  <p>Wedabime Pramukayo is Sri Lanka's premier provider of innovative home improvement and construction solutions. Specializing in i-Panel ceiling systems, wall cladding, and roofing, we deliver products that are engineered to withstand the demands of tropical climates while offering unmatched durability and aesthetic appeal.</p>
  <p>Our commitment to quality is reflected in every product we offer — from the Heavy Flat Series to the Luxury Wall Series, each solution is designed to provide long-lasting performance with zero maintenance requirements.</p>
</section>`,
      metaTitle: "Wedabime Pramukayo | Premium i-Panel & Home Improvement Solutions Sri Lanka",
      metaDesc:
        "Sri Lanka's trusted provider of premium i-Panel ceiling systems, wall cladding, and roofing. Fire-retardant, waterproof, termite-proof. Up to 15 years warranty.",
      metaKeywords:
        "i-Panel, ceiling systems, wall cladding, roofing, Sri Lanka, construction, home improvement",
      sortOrder: 1,
      isPublished: true,
      publishedAt: new Date(),
    },
    {
      slug: "about",
      title: "About Us",
      heroTitle: "Business, Together",
      heroSubtitle:
        "Total focus on the needs of our clients — delivering quality construction solutions across Sri Lanka.",
      content: `<section>
  <h2>Our Vision</h2>
  <p>Total focus on the needs of clients. At Wedabime Pramukayo, we envision a future where every Sri Lankan home is built with materials that last for generations. Our vision drives us to continuously innovate and source the finest construction products that combine durability, aesthetics, and sustainability.</p>
  
  <h2>Our Mission</h2>
  <p>We are committed to providing affordable, high-quality construction solutions that meet the unique demands of Sri Lanka's tropical environment. Our mission is to ensure that every project we undertake reflects our core values of integrity, excellence, and customer satisfaction.</p>
  
  <h2>What We Believe</h2>
  <p>We believe that quality construction materials should be accessible to everyone. Through our partnerships with leading manufacturers and our dedication to efficient installation methods, we make premium products available at competitive prices without compromising on quality or safety standards.</p>
  
  <h2>Fast & Quality</h2>
  <p>Our streamlined approach ensures that from planning to completion, every project is delivered on time and to the highest standards. The Click-it System used in our i-Panel products allows for quick, seamless installation with no extra trims required, ensuring faster completion and lower labor costs.</p>
</section>`,
      metaTitle: "About Us | Wedabime Pramukayo",
      metaDesc:
        "Learn about Wedabime Pramukayo — Sri Lanka's trusted construction solutions provider with a vision for quality, durability, and customer focus.",
      metaKeywords: "about, construction, Sri Lanka, home improvement, quality, mission",
      sortOrder: 2,
      isPublished: true,
      publishedAt: new Date(),
    },
    {
      slug: "services",
      title: "Our Services",
      heroTitle: "Premium Construction Solutions",
      heroSubtitle:
        "From ceiling systems to wall cladding and roofing — we deliver quality products with expert installation across Sri Lanka.",
      content: `<section>
  <h2>Our Services</h2>
  <p>Wedabime Pramukayo offers a comprehensive range of construction and home improvement services tailored to the Sri Lankan market. Our expertise spans across multiple product categories, ensuring that every client receives the perfect solution for their specific needs.</p>
  
  <h3>Ceiling Solutions</h3>
  <p>Our i-Panel ceiling systems revolutionize interior design with products that are completely maintenance-free. Eliminating the need for sanding, priming, or painting, our ceilings feature washability and color stability that lasts for decades.</p>
  
  <h3>Wall Cladding</h3>
  <p>Transform your walls with our Luxury Wall Series cladding — the new moisture-resistant solution that combines aesthetic elegance with practical durability. Available in multiple profiles and finishes to suit any architectural style.</p>
  
  <h3>Roofing Solutions</h3>
  <p>Our roofing products are built for generations, engineered to tolerate tropical climates with exceptional waterproof and fire-retardant properties. Every roof we install is backed by our commitment to quality and longevity.</p>
</section>`,
      metaTitle: "Services | Wedabime Pramukayo",
      metaDesc:
        "Explore our range of premium construction services — i-Panel ceilings, wall cladding, and roofing solutions designed for Sri Lanka.",
      metaKeywords: "services, ceiling, wall cladding, roofing, i-Panel, installation",
      sortOrder: 3,
      isPublished: true,
      publishedAt: new Date(),
    },
    {
      slug: "advantages",
      title: "Advantages (Waasi)",
      heroTitle: "Why Choose i-Panel?",
      heroSubtitle:
        "Built for generations — discover the advantages that make i-Panel the smartest choice for Sri Lankan homes and businesses.",
      content: `<section>
  <h2>The i-Panel Advantage</h2>
  <p>i-Panel products are engineered with cutting-edge technology to deliver superior performance in Sri Lanka's demanding tropical climate. Every advantage is designed to save you time, money, and worry — for generations to come.</p>
  
  <h3>Built for Generations</h3>
  <p>i-Panel products are not just built for today — they are built for generations. The superior engineering and premium raw materials ensure that your investment stands the test of time, providing reliable performance year after year without degradation or compromise.</p>
  
  <h3>Engineered for Tropical Climates</h3>
  <p>Sri Lanka's tropical climate demands materials that can withstand intense heat, heavy monsoon rains, and high humidity. i-Panel products are specifically engineered to tolerate these conditions, maintaining their structural integrity and appearance regardless of weather extremes.</p>
  
  <h3>100% Waterproof</h3>
  <p>Water damage is one of the leading causes of deterioration in traditional building materials. i-Panel's waterproof construction ensures that your ceilings, walls, and roofs remain pristine and damage-free even in the heaviest downpours and most humid conditions.</p>
  
  <h3>Fire-Retardant</h3>
  <p>Safety is paramount. i-Panel products feature fire-retardant properties that provide an additional layer of protection for your family and property. This critical safety feature meets international standards and offers peace of mind that conventional materials simply cannot match.</p>
  
  <h3>100% Termite & Moth Proof</h3>
  <p>In a tropical country like Sri Lanka, termite damage is a constant threat to traditional wood-based materials. i-Panel products are 100% termite and moth proof, eliminating one of the most costly and frustrating maintenance issues that homeowners face.</p>
  
  <h3>Click-it System — Quick & Seamless Installation</h3>
  <p>The innovative Click-it System allows for quick, seamless installation with no extra trims required. This revolutionary approach means faster project completion and significantly lower labor costs, without compromising on the quality or appearance of the finished installation.</p>
  
  <h3>Completely Maintenance-Free</h3>
  <p>Say goodbye to sanding, priming, and painting forever. i-Panel products are completely maintenance-free, featuring washability and color stability that keeps them looking new for years. This saves you both time and money over the life of the product.</p>
  
  <h3>Up to 15 Years Warranty</h3>
  <p>Our confidence in i-Panel products is backed by a warranty of up to 15 years — one of the longest in the industry. This warranty reflects the exceptional quality and durability built into every product, giving you complete confidence in your investment.</p>
  
  <h3>Eco-Friendly — Saves 1,875+ Trees Every Month</h3>
  <p>Choosing i-Panel isn't just smart for your home — it's smart for the planet. Our products save over 1,875 trees every month by providing a sustainable alternative to traditional wood-based construction materials. Every installation contributes to preserving Sri Lanka's precious forests for future generations.</p>
</section>`,
      metaTitle: "Advantages | Why Choose i-Panel | Wedabime Pramukayo",
      metaDesc:
        "Discover why i-Panel is the smartest choice — waterproof, fire-retardant, termite-proof, maintenance-free with up to 15 years warranty and eco-friendly.",
      metaKeywords:
        "advantages, i-Panel benefits, waterproof, fire-retardant, termite-proof, maintenance-free, eco-friendly, warranty, Click-it System",
      sortOrder: 4,
      isPublished: true,
      publishedAt: new Date(),
    },
  ];

  for (const page of pages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: page,
      create: page,
    });
    console.log(`✅ Page created/updated: ${page.title}`);
  }

  // ─── 3. Create Product Categories ─────────────────────────
  const categories = [
    {
      slug: "heavy-flat-series",
      name: "Heavy Flat Series",
      description:
        "Premium heavy-duty flat panels designed for maximum durability and impact resistance. Ideal for high-traffic commercial and residential applications.",
      icon: "Layers",
      sortOrder: 1,
    },
    {
      slug: "designer-profile-series",
      name: "Designer Profile Series",
      description:
        "Elegantly profiled panels that combine aesthetic appeal with structural performance. Available in multiple designer patterns for sophisticated interiors.",
      icon: "Palette",
      sortOrder: 2,
    },
    {
      slug: "lite-project-series",
      name: "Lite / Project Series",
      description:
        "Lightweight yet robust panels optimized for large-scale projects. Cost-effective without compromising on quality, perfect for bulk installations.",
      icon: "Lightbulb",
      sortOrder: 3,
    },
    {
      slug: "finishing-series",
      name: "Finishing Series",
      description:
        "Precision finishing profiles and trims that complete any installation with professional detail. Covers transitions, edges, and corners seamlessly.",
      icon: "Ruler",
      sortOrder: 4,
    },
    {
      slug: "luxury-wall-series",
      name: "Luxury Wall Series",
      description:
        "The new moisture-resistant cladding solution that redefines interior wall design. Combines luxury aesthetics with practical moisture protection for Sri Lankan homes.",
      icon: "Crown",
      sortOrder: 5,
    },
  ];

  for (const cat of categories) {
    await prisma.productCategory.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
    console.log(`✅ Category created: ${cat.name}`);
  }

  // ─── 4. Create Featured Products ──────────────────────────
  const products = [
    {
      slug: "i-panel-heavy-flat",
      name: "i-Panel Heavy Flat",
      subtitle: "Maximum Durability Flat Panel",
      description:
        "The i-Panel Heavy Flat Series represents the pinnacle of flat panel engineering. Designed for environments that demand maximum durability and impact resistance, these panels excel in both commercial and high-traffic residential applications. The flat profile provides a clean, modern aesthetic that complements any architectural style while delivering the full range of i-Panel advantages: waterproof construction, fire-retardant properties, and 100% termite resistance.",
      features: JSON.stringify([
        "Built for generations of use",
        "Engineered for tropical climates",
        "100% waterproof construction",
        "Fire-retardant certified",
        "100% termite & moth proof",
        "Click-it System for fast installation",
        "No extra trims required",
        "Completely maintenance-free",
        "Washable surface with color stability",
        "Up to 15 years warranty",
      ]),
      advantages: JSON.stringify([
        "Maximum impact resistance for high-traffic areas",
        "Clean modern flat profile aesthetic",
        "Fastest installation in its class",
        "Lowest total cost of ownership",
      ]),
      slug2: undefined,
      isFeatured: true,
      categoryId: (await prisma.productCategory.findUnique({ where: { slug: "heavy-flat-series" } }))!.id,
    },
    {
      slug: "i-panel-designer-profile",
      name: "i-Panel Designer Profile",
      subtitle: "Elegant Profiled Panel System",
      description:
        "The Designer Profile Series elevates interior design with elegantly profiled panels that create depth and visual interest. Each profile pattern is carefully designed to catch and play with light, adding a sophisticated dimension to any room. Despite their decorative appeal, these panels deliver the same uncompromising performance as all i-Panel products — waterproof, fire-retardant, termite-proof, and maintenance-free.",
      features: JSON.stringify([
        "Multiple designer profile patterns",
        "Light-interactive surface design",
        "100% waterproof & fire-retardant",
        "Termite & moth proof",
        "Click-it System installation",
        "Maintenance-free with washability",
        "Color stability guaranteed",
        "Up to 15 years warranty",
      ]),
      isFeatured: true,
      categoryId: (await prisma.productCategory.findUnique({ where: { slug: "designer-profile-series" } }))!.id,
    },
    {
      slug: "i-panel-lite-project",
      name: "i-Panel Lite / Project",
      subtitle: "Lightweight Bulk Installation Panel",
      description:
        "The Lite / Project Series is engineered for efficiency and scale. Lightweight yet robust, these panels are optimized for large-scale projects where cost-effectiveness is essential without any compromise on quality. Perfect for housing developments, commercial complexes, and renovation projects that demand consistent quality across hundreds of installations.",
      features: JSON.stringify([
        "Lightweight design for easy handling",
        "Optimized for bulk installations",
        "Cost-effective without quality compromise",
        "Click-it System for rapid installation",
        "Waterproof, fire-retardant, termite-proof",
        "Low labor costs due to easy installation",
        "Maintenance-free operation",
        "Up to 15 years warranty",
      ]),
      isFeatured: true,
      categoryId: (await prisma.productCategory.findUnique({ where: { slug: "lite-project-series" } }))!.id,
    },
    {
      slug: "i-panel-finishing",
      name: "i-Panel Finishing Series",
      subtitle: "Professional Finishing Profiles & Trims",
      description:
        "The Finishing Series provides the precision profiles and trims that transform a good installation into a perfect one. Designed to complement all i-Panel product lines, these finishing elements handle transitions, edges, and corners with seamless professional detail. Every piece maintains the same quality standards — waterproof, durable, and maintenance-free.",
      features: JSON.stringify([
        "Precision-engineered finishing profiles",
        "Seamless transitions and edge coverage",
        "Compatible with all i-Panel series",
        "Waterproof and durable construction",
        "Professional installation finish",
        "No painting or maintenance required",
        "Color-matched to i-Panel products",
        "Up to 15 years warranty",
      ]),
      isFeatured: false,
      categoryId: (await prisma.productCategory.findUnique({ where: { slug: "finishing-series" } }))!.id,
    },
    {
      slug: "i-panel-luxury-wall",
      name: "i-Panel Luxury Wall Series",
      subtitle: "Moisture-Resistant Luxury Cladding",
      description:
        "The new Luxury Wall Series redefines what wall cladding can achieve. Specifically engineered with advanced moisture-resistant technology, this cladding solution is perfect for bathrooms, kitchens, and any area exposed to humidity. The luxury finish options create stunning visual effects while the practical benefits — waterproof, fire-retardant, termite-proof — ensure lasting performance in Sri Lanka's tropical conditions.",
      features: JSON.stringify([
        "Advanced moisture-resistant technology",
        "Luxury finish options for premium interiors",
        "Ideal for bathrooms and kitchens",
        "Waterproof, fire-retardant, termite-proof",
        "Click-it System for seamless installation",
        "No grouting required — hygienic surface",
        "Completely maintenance-free",
        "Washable with color stability",
        "Eco-friendly — saves 1,875+ trees monthly",
        "Up to 15 years warranty",
      ]),
      isFeatured: true,
      categoryId: (await prisma.productCategory.findUnique({ where: { slug: "luxury-wall-series" } }))!.id,
    },
  ];

  for (const product of products) {
    const { categoryId, ...productData } = product;
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: { ...productData, category: { connect: { id: categoryId } } },
      create: { ...productData, category: { connect: { id: categoryId } } },
    });
    console.log(`✅ Product created: ${product.name}`);
  }

  // ─── 5. Create Site Settings ──────────────────────────────
  const settings = [
    { key: "site_name", value: "Wedabime Pramukayo", category: "general", description: "Website display name" },
    { key: "site_tagline", value: "Premium i-Panel & Home Improvement Solutions", category: "general", description: "Site tagline" },
    { key: "meta_description", value: "Wedabime Pramukayo - Sri Lanka's trusted provider of premium i-Panel ceiling systems, wall cladding, and roofing solutions. Fire-retardant, waterproof, termite-proof with up to 15 years warranty.", category: "seo", description: "Default meta description" },
    { key: "meta_keywords", value: "i-Panel, ceiling systems, wall cladding, roofing, Sri Lanka, construction, home improvement, waterproof, fire-retardant, termite-proof", category: "seo", description: "Default meta keywords" },
    { key: "primary_color", value: "#4E65CE", category: "theme", description: "Primary brand color (Deep Blue)" },
    { key: "secondary_color", value: "#215387", category: "theme", description: "Secondary brand color (Navy)" },
    { key: "accent_color", value: "#43E9D1", category: "theme", description: "Accent brand color (Teal)" },
    { key: "sage_color", value: "#6DCF9D", category: "theme", description: "Sage highlight color" },
    { key: "olive_color", value: "#BBC7A7", category: "theme", description: "Olive muted color" },
    { key: "facebook_url", value: "", category: "social", description: "Facebook page URL" },
    { key: "instagram_url", value: "", category: "social", description: "Instagram profile URL" },
    { key: "youtube_url", value: "", category: "social", description: "YouTube channel URL" },
    { key: "address_line", value: "Gampaha District, Sri Lanka", category: "contact", description: "Business address" },
    { key: "business_hours", value: "Mon-Sat: 8:00 AM - 6:00 PM", category: "contact", description: "Business hours" },
    { key: "trees_saved_monthly", value: "1875", category: "general", description: "Trees saved per month (eco stat)" },
    { key: "warranty_years", value: "15", category: "general", description: "Maximum warranty years" },
  ];

  for (const setting of settings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value, category: setting.category, description: setting.description },
      create: setting,
    });
  }
  console.log(`✅ Site settings created: ${settings.length} entries`);

  // ─── 6. Create Sample Blog Post ───────────────────────────
  await prisma.blogPost.upsert({
    where: { slug: "why-ipanel-best-ceiling-solution-sri-lanka" },
    update: {},
    create: {
      slug: "why-ipanel-best-ceiling-solution-sri-lanka",
      title: "Why i-Panel is the Best Ceiling Solution for Sri Lankan Homes",
      excerpt:
        "Discover why thousands of Sri Lankan homeowners are choosing i-Panel ceiling systems over traditional materials. From waterproof performance to the revolutionary Click-it System, learn what makes i-Panel the superior choice.",
      content: `<p>Sri Lanka's tropical climate presents unique challenges for building materials. High humidity, heavy monsoon rains, and constant exposure to heat can rapidly degrade conventional ceiling materials. This is where i-Panel ceiling systems make a transformative difference.</p>

<h2>The Tropical Climate Challenge</h2>
<p>Traditional ceiling materials like gypsum board, plywood, and even some PVC panels struggle in Sri Lanka's environment. Moisture absorption leads to warping, sagging, and mold growth. Termite infestations can destroy wooden ceilings within years. And the constant need for repainting and maintenance adds significant long-term costs that many homeowners don't anticipate.</p>

<h2>How i-Panel Solves These Problems</h2>
<p>i-Panel products are specifically engineered for tropical conditions. The 100% waterproof construction means no warping, no sagging, and no mold — ever. The fire-retardant properties provide an additional safety layer that conventional materials cannot match. And being 100% termite and moth proof eliminates one of the most costly maintenance issues in tropical construction.</p>

<h3>The Click-it System Advantage</h3>
<p>One of the most innovative features of i-Panel is the Click-it System. This revolutionary installation method allows panels to be connected quickly and seamlessly without any additional trims or specialized tools. The result is faster project completion, lower labor costs, and a cleaner finished appearance.</p>

<h2>Eco-Friendly Choice</h2>
<p>Every month, choosing i-Panel products saves over 1,875 trees. By providing a sustainable alternative to wood-based materials, i-Panel helps preserve Sri Lanka's precious forests while delivering superior performance. This eco-friendly approach, combined with the up to 15-year warranty, makes i-Panel not just the best choice for your home — but the best choice for the planet.</p>`,
      author: "Wedabime Pramukayo Team",
      tags: JSON.stringify(["i-Panel", "ceiling", "Sri Lanka", "tropical climate", "waterproof", "eco-friendly"]),
      metaTitle: "Why i-Panel is the Best Ceiling Solution for Sri Lankan Homes",
      metaDesc:
        "Discover why i-Panel ceiling systems outperform traditional materials in Sri Lanka's tropical climate. Waterproof, fire-retardant, termite-proof.",
      metaKeywords: "i-Panel ceiling, Sri Lanka, tropical climate, waterproof, fire-retardant, Click-it System",
      isPublished: true,
      publishedAt: new Date(),
    },
  });
  console.log("✅ Sample blog post created");

  console.log("\n🎉 Seeding complete! Wedabime Pramukayo CMS is ready.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
