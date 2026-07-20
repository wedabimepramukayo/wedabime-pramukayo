import { db } from "@/lib/db";

export default async function Home() {
  // Quick verification that DB connection works
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Brand Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 bg-brand-primary/10 text-brand-primary px-4 py-1.5 rounded-full text-sm font-medium">
            <span className="h-2 w-2 rounded-full bg-brand-teal animate-pulse" />
            Phase 1 Complete
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Wedabime Pramukayo
          </h1>
          <p className="text-lg text-muted-foreground">
            Premium i-Panel & Home Improvement Solutions — Sri Lanka
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-border bg-card p-5 text-left space-y-2">
            <div className="text-sm text-muted-foreground font-medium">Pages</div>
            <div className="text-3xl font-bold text-brand-primary">{pageCount}</div>
            <div className="text-xs text-muted-foreground">Home, About, Services, Advantages</div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 text-left space-y-2">
            <div className="text-sm text-muted-foreground font-medium">Products</div>
            <div className="text-3xl font-bold text-brand-secondary">{productCount}</div>
            <div className="text-xs text-muted-foreground">i-Panel Series & Categories</div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 text-left space-y-2">
            <div className="text-sm text-muted-foreground font-medium">Settings</div>
            <div className="text-3xl font-bold text-brand-teal">{settingsCount}</div>
            <div className="text-xs text-muted-foreground">Site config & SEO</div>
          </div>
        </div>

        {/* DB Status */}
        <div className="flex items-center justify-center gap-2 text-sm">
          <span className={`h-2 w-2 rounded-full ${dbStatus === "Connected" ? "bg-green-500" : "bg-red-500"}`} />
          <span className="text-muted-foreground">Database: <span className="font-medium text-foreground">{dbStatus}</span></span>
        </div>

        {/* Brand Colors Preview */}
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Brand Palette</p>
          <div className="flex justify-center gap-2 flex-wrap">
            {[
              { name: "Primary", color: "bg-brand-primary" },
              { name: "Secondary", color: "bg-brand-secondary" },
              { name: "Teal", color: "bg-brand-teal" },
              { name: "Sage", color: "bg-brand-sage" },
              { name: "Olive", color: "bg-brand-olive" },
              { name: "Blue", color: "bg-brand-blue" },
              { name: "Light", color: "bg-brand-light" },
              { name: "Gold", color: "bg-brand-gold" },
            ].map(({ name, color }) => (
              <div key={name} className="flex flex-col items-center gap-1">
                <div className={`h-8 w-8 rounded-lg ${color} ring-1 ring-black/5`} />
                <span className="text-[10px] text-muted-foreground">{name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Phase Info */}
        <div className="text-sm text-muted-foreground space-y-1">
          <p>Phase 1: Project Initialization & Environment Setup ✓</p>
          <p>Next: Phase 2 — Secure Admin Authentication & Base Layout</p>
        </div>
      </div>
    </div>
  );
}
