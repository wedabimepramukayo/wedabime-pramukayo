/**
 * Seed Additional Products — Wedabime Pramukayo CMS
 *
 * Adds new product categories and products beyond i-Panel:
 * - S-lon Ceiling (PE+ PVC ceiling panels & wall panels)
 * - Gutter Systems (Union-Steel Korean gutters)
 * - Steel Roofing (i-roof, Anton, JL roofing sheets)
 *
 * Run: DATABASE_URL="..." npx tsx prisma/seed-additional-products.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding additional products...\n");

  // ─── Create Categories ───────────────────────────────────────

  const slonCeiling = await prisma.productCategory.upsert({
    where: { slug: "s-lon-ceiling" },
    update: {},
    create: {
      slug: "s-lon-ceiling",
      name: "S-lon Ceiling",
      description: "PE+ S-lon PVC ceiling panels — Sri Lanka's leading ceiling solution",
      icon: "LayoutGrid",
      sortOrder: 10,
      isActive: true,
    },
  });
  console.log(`✅ Category: ${slonCeiling.name}`);

  const gutterSystems = await prisma.productCategory.upsert({
    where: { slug: "gutter-systems" },
    update: {},
    create: {
      slug: "gutter-systems",
      name: "Gutter Systems",
      description: "Union-Steel Korean gutter systems — premium rainwater management",
      icon: "Droplets",
      sortOrder: 20,
      isActive: true,
    },
  });
  console.log(`✅ Category: ${gutterSystems.name}`);

  const steelRoofing = await prisma.productCategory.upsert({
    where: { slug: "steel-roofing" },
    update: {},
    create: {
      slug: "steel-roofing",
      name: "Steel Roofing",
      description: "Pre-coated & galvanized steel roofing sheets — i-roof, Anton, JL",
      icon: "Home",
      sortOrder: 30,
      isActive: true,
    },
  });
  console.log(`✅ Category: ${steelRoofing.name}`);

  // ─── Create Products ────────────────────────────────────────

  // 1. PE+ S-lon Ceiling Panel
  const slonCeilingPanel = await prisma.product.upsert({
    where: { slug: "pe-plus-s-lon-ceiling-panel" },
    update: {},
    create: {
      slug: "pe-plus-s-lon-ceiling-panel",
      name: "PE+ S-lon Ceiling Panel",
      subtitle: "Sri Lanka's Leading PVC Ceiling Solution",
      description: `<h2>PE+ S-lon Ceiling Panel — Sri Lanka's #1 PVC Ceiling</h2>
<p>The PE+ S-lon Ceiling Panel is the most trusted and widely used PVC ceiling solution in Sri Lanka. Manufactured with Japanese technology and stringent quality controls, these panels deliver exceptional durability, aesthetic appeal, and value for both residential and commercial construction.</p>
<h3>Why Choose S-lon Ceiling?</h3>
<p>S-lon ceiling panels have earned the confidence of builders, architects, and homeowners across Sri Lanka for over two decades. The PE+ designation represents the premium grade with enhanced polymer formulation for superior strength and longevity.</p>
<h3>සිංහලෙන්</h3>
<p>PE+ S-lon සීලිං පැනල් යනු ශ්‍රී ලංකාවේ පුරෝජනය වූ ප්‍රමුඛතම PVC සීලිං විසඳුනයි. ජපන් තාක්ෂණයෙන් නිෂපාදිත මෙම පැනල් සාමාන්‍යයෙන් දශකයකට වඩා කාලයක් පැවතීමට නිර්මාණය කර ඇත.</p>`,
      features: JSON.stringify([
        "100% Waterproof — Zero water absorption",
        "Termite Proof — No insect damage ever",
        "Fire Retardant — Self-extinguishing, safety rated",
        "Easy Install — Interlocking system, no special tools",
        "Lightweight — Reduced structural load",
        "Cost Effective — Long-term savings vs alternatives",
      ]),
      advantages: JSON.stringify([
        "20+ year lifespan with zero maintenance",
        "Available in 8+ designer colors and wood-grain finishes",
        "No painting or refinishing required",
        "Mold and mildew resistant",
        "Eco-friendly — lead-free formulation",
      ]),
      categoryId: slonCeiling.id,
      isFeatured: true,
      isPublished: true,
      publishedAt: new Date(),
      sortOrder: 1,
    },
  });
  console.log(`✅ Product: ${slonCeilingPanel.name}`);

  // 2. S-lon Wall Panel
  const slonWallPanel = await prisma.product.upsert({
    where: { slug: "s-lon-wall-panel" },
    update: {},
    create: {
      slug: "s-lon-wall-panel",
      name: "S-lon Wall Panel",
      subtitle: "Premium PVC Wall Cladding Solution",
      description: `<h2>S-lon Wall Panel — Versatile Wall Cladding</h2>
<p>The S-lon Wall Panel extends the trusted S-lon brand to wall cladding applications. Perfect for both interior and exterior use, these panels provide a clean, modern aesthetic while delivering the same waterproof and termite-proof guarantees that have made S-lon the household name in Sri Lankan construction.</p>
<h3>Interior & Exterior Applications</h3>
<p>From bathroom and kitchen walls to exterior facades and boundary walls, S-lon Wall Panels offer a maintenance-free finish that looks beautiful for decades. UV-resistant formulation ensures colors stay vibrant even under the tropical Sri Lankan sun.</p>
<h3>සිංහලෙන්</h3>
<p>S-lon වෝල් පැනල් යනු අභ්‍යන්තර සහ බාහිර භාවිතය සඳහා සුදුසු වන PVC වෝල් ක්ලැඩිං විසඳුනකි. ජලයෙන් සහ කෘමින් වෙන් ආරක්ෂා කරන මෙම පැනල් දශක ගණයක් පැවතුණු සුන්දරතාවයක් ලබා දෙයි.</p>`,
      features: JSON.stringify([
        "Interior & Exterior Use — Versatile application",
        "UV Resistant — Colors stay vibrant under tropical sun",
        "Low Maintenance — No painting or refinishing",
        "Durability — 20+ year lifespan guaranteed",
        "Waterproof — Ideal for wet areas",
        "Quick Installation — Tongue & groove system",
      ]),
      advantages: JSON.stringify([
        "Reduces construction time by 60%",
        "No plastering or painting required",
        "Available in marble and wood-grain designs",
        "Thermal insulation properties",
        "Sound dampening for interior comfort",
      ]),
      categoryId: slonCeiling.id,
      isFeatured: true,
      isPublished: true,
      publishedAt: new Date(),
      sortOrder: 2,
    },
  });
  console.log(`✅ Product: ${slonWallPanel.name}`);

  // 3. Union-Steel Korean Gutter
  const koreanGutter = await prisma.product.upsert({
    where: { slug: "union-steel-korean-gutter" },
    update: {},
    create: {
      slug: "union-steel-korean-gutter",
      name: "Union-Steel Korean Gutter",
      subtitle: "Premium Korean Technology Gutter System",
      description: `<h2>Union-Steel Korean Gutter — Engineered for Excellence</h2>
<p>The Union-Steel Korean Gutter system brings world-class Korean rainwater management technology to Sri Lankan construction. Manufactured with heavy-gauge galvanized steel and precision Korean engineering, this gutter system delivers unmatched durability and performance in the tropical monsoon climate.</p>
<h3>Korean Precision Engineering</h3>
<p>Developed by Union-Steel using proprietary Korean manufacturing processes, these gutters feature seamless construction, superior corrosion resistance, and precision-fit joints that eliminate leaks. The 10-year warranty reflects the confidence in this product's longevity.</p>
<h3>සිංහලෙන්</h3>
<p>Union-Steel කොරියානු ගටර් යනු කොරියානු තාක්ෂණයෙන් නිෂපාදිත ප්‍රමුඛතම වැස්බැහිර කළමාණා කළමැටියකි. බර ගේජ් ස්ටීල් වලින් නිෂපාදිත මෙය ශ්‍රී ලංකාවේ නිවර්දෙෂන කාලගතයට ඔරොත්තුව කළමැටි කරයි.</p>`,
      features: JSON.stringify([
        "Korean Technology — World-class engineering",
        "Heavy Gauge Steel — Superior structural strength",
        "Corrosion Resistant — Hot-dip galvanized coating",
        "Precision Fit — Seamless joints, zero leaks",
        "10 Year Warranty — Industry-leading guarantee",
        "High Capacity — Handles monsoon rainfall",
      ]),
      advantages: JSON.stringify([
        "Tested for 200+ km/h wind resistance",
        "Pre-painted in 5 popular colors",
        "Easy bracket system for fast installation",
        "Compatible with standard downpipe sizes",
        "Low noise design during rainfall",
      ]),
      categoryId: gutterSystems.id,
      isFeatured: true,
      isPublished: true,
      publishedAt: new Date(),
      sortOrder: 1,
    },
  });
  console.log(`✅ Product: ${koreanGutter.name}`);

  // 4. Union-Steel Box Gutter
  const boxGutter = await prisma.product.upsert({
    where: { slug: "union-steel-box-gutter" },
    update: {},
    create: {
      slug: "union-steel-box-gutter",
      name: "Union-Steel Box Gutter",
      subtitle: "Contemporary High-Capacity Box Gutter",
      description: `<h2>Union-Steel Box Gutter — Modern Design, Maximum Capacity</h2>
<p>The Union-Steel Box Gutter offers a contemporary flat-bottomed design that maximizes water capacity while providing a sleek, modern aesthetic. Ideal for commercial buildings, modern homes, and structures with large roof areas that require efficient rainwater management.</p>
<h3>Contemporary Architecture</h3>
<p>Box gutters are the preferred choice for modern flat and low-pitch roof designs. The rectangular profile provides significantly higher water capacity compared to traditional half-round profiles, making them essential for Sri Lanka's heavy monsoon rainfall.</p>
<h3>සිංහලෙන්</h3>
<p>Union-Steel බොක්ස් ගටර් යනු නූතන නිර්මාණ සඳහා සුදුසු ඉහළ ධාති බහාරයක් සහිත ගටර් කළමැටියකි. විශාල වහස් ප්‍රදේශ සහිත ගොඩනැඟිලි සඳහා අත්‍යවශ්‍ය වේ.</p>`,
      features: JSON.stringify([
        "Modern Design — Flat-bottomed rectangular profile",
        "High Capacity — 40% more than half-round gutters",
        "Custom Sizes Available — Tailored to project needs",
        "Pre-Painted Finish — Color-matched to roof",
        "Heavy Gauge Steel — Built to last",
        "Seamless Joints — Leak-proof connections",
      ]),
      advantages: JSON.stringify([
        "Ideal for commercial and modern residential buildings",
        "Custom lengths reduce joint count",
        "Internal brackets for clean exterior look",
        "Suitable for flat and low-pitch roofs",
        "Professional installation support available",
      ]),
      categoryId: gutterSystems.id,
      isFeatured: false,
      isPublished: true,
      publishedAt: new Date(),
      sortOrder: 2,
    },
  });
  console.log(`✅ Product: ${boxGutter.name}`);

  // 5. i-Roof Steel Sheet
  const iRoof = await prisma.product.upsert({
    where: { slug: "i-roof-steel-sheet" },
    update: {},
    create: {
      slug: "i-roof-steel-sheet",
      name: "i-Roof Steel Sheet",
      subtitle: "Premium Pre-Coated Steel Roofing",
      description: `<h2>i-Roof Steel Sheet — The Premium Roofing Choice</h2>
<p>i-Roof is the flagship pre-coated steel roofing brand from Wedabime Pramukayo. Manufactured using state-of-the-art coil coating technology, i-Roof sheets deliver a perfect combination of aesthetic beauty, weather resistance, and structural integrity backed by a 20-year warranty.</p>
<h3>Pre-Coated Excellence</h3>
<p>Unlike post-painted roofing, i-Roof uses coil coating technology where paint is applied under controlled factory conditions before forming. This results in superior paint adhesion, consistent color, and a finish that lasts decades without fading — even under Sri Lanka's intense tropical sun.</p>
<h3>සිංහලෙන්</h3>
<p>i-Roof යනු Wedabime Pramukayo හි ප්‍රධාන ප්‍රී-කෝට් ස්ටීල් වහස් බ්‍රෑන්ඩය වේ. කෝයිල් කෝටිං තාක්ෂණයෙන් නිෂපාදිත මෙම ෂීට් වසර 20 ක වගවුමක් සහිත කල් බහාරයක් ලබා දෙයි.</p>`,
      features: JSON.stringify([
        "Pre-Coated — Factory-applied paint, superior adhesion",
        "20 Year Warranty — Confidence in quality",
        "Heat Reflective — Reduces indoor temperature by 5°C",
        "Multiple Profiles — Corrugated, IBR, Standing Seam",
        "UV Resistant — No fading for 20+ years",
        "Wide Color Range — 15+ standard colors",
      ]),
      advantages: JSON.stringify([
        "Coil coating = 4x better paint adhesion vs post-paint",
        "Reduces cooling costs by up to 15%",
        "Lightweight — Less structural support needed",
        "Fire resistant — Class A rating",
        "Recyclable — Eco-friendly at end of life",
      ]),
      categoryId: steelRoofing.id,
      isFeatured: true,
      isPublished: true,
      publishedAt: new Date(),
      sortOrder: 1,
    },
  });
  console.log(`✅ Product: ${iRoof.name}`);

  // 6. Anton Roofing Sheet
  const antonRoofing = await prisma.product.upsert({
    where: { slug: "anton-roofing-sheet" },
    update: {},
    create: {
      slug: "anton-roofing-sheet",
      name: "Anton Roofing Sheet",
      subtitle: "Trusted Galvanized Roofing Since 1950s",
      description: `<h2>Anton Roofing Sheet — The Trusted Classic</h2>
<p>Anton galvanized roofing sheets have been a trusted name in Sri Lankan construction for generations. Known for proven quality and reliability, Anton sheets provide excellent corrosion resistance through hot-dip galvanization and are available in multiple thickness options to suit every budget and application.</p>
<h3>Proven Track Record</h3>
<p>With decades of installations across Sri Lanka — from village homes to industrial complexes — Anton roofing has earned its reputation through consistent quality. Every sheet undergoes rigorous quality testing to ensure it meets the standards that builders have trusted for generations.</p>
<h3>සිංහලෙන්</h3>
<p>Anton ගැල්වැනයිස්ඩ් වහස් ෂීට් යනු ශ්‍රී ලංකාවේ දශක ගණයක් පුරා විශ්වාසභාග්‍ය ලැබූ වහස් බ්‍රෑන්ඩයකි. හොට්-ඩිප් ගැල්වැනයිසිං තාක්ෂණයෙන් නිෂපාදිත මෙම ෂීට් විවිධ මහද විකල්ප වලින් ලැබේ.</p>`,
      features: JSON.stringify([
        "Galvanized — Hot-dip zinc coating for corrosion resistance",
        "Corrosion Resistant — 275g/m² zinc coating standard",
        "Multiple Thickness Options — 0.38mm to 0.80mm",
        "Proven Quality — Decades of field performance data",
        "Standard Profiles — Corrugated and IBR available",
        "Cost Effective — Best value galvanized option",
      ]),
      advantages: JSON.stringify([
        "Sri Lanka's most recognized galvanized roofing brand",
        "Self-healing zinc coating — scratches don't rust",
        "Available island-wide through dealer network",
        "Suitable for all climate zones in Sri Lanka",
        "Compatible with standard roofing accessories",
      ]),
      categoryId: steelRoofing.id,
      isFeatured: false,
      isPublished: true,
      publishedAt: new Date(),
      sortOrder: 2,
    },
  });
  console.log(`✅ Product: ${antonRoofing.name}`);

  // 7. JL Roofing Sheet
  const jlRoofing = await prisma.product.upsert({
    where: { slug: "jl-roofing-sheet" },
    update: {},
    create: {
      slug: "jl-roofing-sheet",
      name: "JL Roofing Sheet",
      subtitle: "Affordable Quality Roofing",
      description: `<h2>JL Roofing Sheet — Quality Within Reach</h2>
<p>JL Roofing Sheets offer an affordable quality roofing solution for budget-conscious builders who don't want to compromise on reliability. Galvanized for corrosion protection and available in multiple attractive colors, JL sheets are the smart choice for residential projects across Sri Lanka.</p>
<h3>Smart Economics</h3>
<p>JL roofing sheets are designed to deliver the essential quality features at an accessible price point. The lightweight design reduces structural requirements and transportation costs, while the easy-install profile cuts labor time — saving money at every stage of construction.</p>
<h3>සිංහලෙන්</h3>
<p>JL වහස් ෂීට් යනු අඩු මිලෙන් ගුණාත්කාර වහස් සෙවිල් සෙවීම නිවැකයකි. ගැල්වැනයිස්ඩ් ආරක්ෂාවක් සහ විවිධ වර්ණ වලින් යුත් මෙය නිවැසි නිර්මාණ සඳහා සුදුසු වේ.</p>`,
      features: JSON.stringify([
        "Cost Effective — Best value for residential roofing",
        "Light Weight — Reduced structural load & transport cost",
        "Easy Installation — Standard corrugated profile",
        "Various Colors — 8 pre-painted color options",
        "Galvanized Coating — Basic corrosion protection",
        "Standard Sizing — Compatible with common accessories",
      ]),
      advantages: JSON.stringify([
        "Lowest price point in quality roofing category",
        "Lightweight saves on structural timber/steel",
        "Quick installation reduces labor costs",
        "Color options match popular Sri Lankan home designs",
        "Widely available at hardware stores island-wide",
      ]),
      categoryId: steelRoofing.id,
      isFeatured: false,
      isPublished: true,
      publishedAt: new Date(),
      sortOrder: 3,
    },
  });
  console.log(`✅ Product: ${jlRoofing.name}`);

  console.log("\n✨ Seeding complete!");
  console.log(`   Categories: 3 (S-lon Ceiling, Gutter Systems, Steel Roofing)`);
  console.log(`   Products: 7 (3 featured)`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
