import { db } from "@/lib/db";
import Image from "next/image";

export default async function Home() {
  let dbStatus = "Connected";
  let pageCount = 0;
  let productCount = 0;
  let settingsCount = 0;

  try {
    pageCount = await db.page.count();
    productCount = await db.product.count();
    settingsCount = await db.siteSetting.count();
  } catch {
    dbStatus = "Error";
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: "linear-gradient(135deg, #081C15 0%, #1B4332 40%, #2D6A4F 100%)" }}>
      <div className="max-w-3xl w-full text-center space-y-10">

        {/* Logo */}
        <div className="flex justify-center">
          <div className="relative h-28 w-28 rounded-2xl overflow-hidden shadow-2xl ring-2 ring-brand-spring/30">
            <Image
              src="/logo.png"
              alt="Wedabime Pramukayo Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Brand Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 bg-brand-spring/20 text-brand-spring px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide">
            <span className="h-2 w-2 rounded-full bg-brand-spring animate-pulse" />
            Phase 1 — Complete
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white">
            Wedabime Pramukayo
          </h1>
          <p className="text-lg md:text-xl text-brand-sage">
            Premium i-Panel & Home Improvement Solutions — Sri Lanka
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-brand-emerald/30 bg-brand-dark/50 backdrop-blur p-5 text-left space-y-2">
            <div className="text-sm text-brand-sage font-medium">Pages</div>
            <div className="text-3xl font-bold text-brand-spring">{pageCount}</div>
            <div className="text-xs text-brand-sage/70">Home, About, Services, Advantages</div>
          </div>
          <div className="rounded-xl border border-brand-emerald/30 bg-brand-dark/50 backdrop-blur p-5 text-left space-y-2">
            <div className="text-sm text-brand-sage font-medium">Services</div>
            <div className="text-3xl font-bold text-brand-emerald">{productCount}</div>
            <div className="text-xs text-brand-sage/70">i-Panel Series & Categories</div>
          </div>
          <div className="rounded-xl border border-brand-emerald/30 bg-brand-dark/50 backdrop-blur p-5 text-left space-y-2">
            <div className="text-sm text-brand-sage font-medium">Settings</div>
            <div className="text-3xl font-bold text-brand-gold">{settingsCount}</div>
            <div className="text-xs text-brand-sage/70">Site config & SEO</div>
          </div>
        </div>

        {/* DB Status */}
        <div className="flex items-center justify-center gap-2 text-sm">
          <span className={`h-2 w-2 rounded-full ${dbStatus === "Connected" ? "bg-brand-spring" : "bg-red-500"}`} />
          <span className="text-brand-sage/80">Database: <span className="font-semibold text-white">{dbStatus}</span></span>
        </div>

        {/* Color Psychology Palette */}
        <div className="space-y-4">
          <p className="text-xs text-brand-sage/60 uppercase tracking-widest font-semibold">
            Brand Palette — Color Psychology
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            {[
              { name: "Forest", color: "bg-brand-primary", hex: "#2D6A4F", psych: "Trust & Authority" },
              { name: "Deep Forest", color: "bg-brand-secondary", hex: "#1B4332", psych: "Stability" },
              { name: "Emerald", color: "bg-brand-emerald", hex: "#40916C", psych: "Vitality" },
              { name: "Spring", color: "bg-brand-spring", hex: "#7DD857", psych: "Innovation" },
              { name: "Lime", color: "bg-brand-lime", hex: "#68CB66", psych: "Freshness" },
              { name: "Teal-Green", color: "bg-brand-teal", hex: "#53C275", psych: "Sophistication" },
              { name: "Sage", color: "bg-brand-sage", hex: "#95D5B2", psych: "Reassurance" },
              { name: "Mint", color: "bg-brand-mint", hex: "#D8F3DC", psych: "Clean & Eco" },
              { name: "Gold", color: "bg-brand-gold", hex: "#D4A843", psych: "Premium Value" },
            ].map(({ name, color, hex, psych }) => (
              <div key={name} className="flex flex-col items-center gap-1.5">
                <div className={`h-9 w-9 rounded-lg ${color} ring-1 ring-white/10 shadow-lg`} />
                <span className="text-[10px] text-brand-sage/80 font-medium">{name}</span>
                <span className="text-[8px] text-brand-sage/50">{psych}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Eco Stats */}
        <div className="flex justify-center gap-8 text-center">
          <div>
            <div className="text-2xl font-bold text-brand-spring">1,875+</div>
            <div className="text-xs text-brand-sage/60">Trees Saved / Month</div>
          </div>
          <div className="w-px bg-brand-emerald/30" />
          <div>
            <div className="text-2xl font-bold text-brand-gold">15 Yrs</div>
            <div className="text-xs text-brand-sage/60">Warranty</div>
          </div>
          <div className="w-px bg-brand-emerald/30" />
          <div>
            <div className="text-2xl font-bold text-brand-teal">100%</div>
            <div className="text-xs text-brand-sage/60">Termite Proof</div>
          </div>
        </div>

        {/* Phase Info */}
        <div className="text-sm text-brand-sage/50 space-y-1 pt-4 border-t border-brand-emerald/20">
          <p>Phase 1: Project Initialization & Environment Setup ✓</p>
          <p>Next: Phase 2 — Secure Admin Authentication & Base Layout</p>
        </div>
      </div>
    </div>
  );
}
