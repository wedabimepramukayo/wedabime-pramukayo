/**
 * Admin Site Settings — Placeholder for Phase 3
 */

import { db } from "@/lib/db";

export default async function AdminSettings() {
  const settings = await db.siteSetting.findMany({
    orderBy: [{ category: "asc" }, { key: "asc" }],
  });

  const grouped = settings.reduce((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {} as Record<string, typeof settings>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Site Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure global site settings, SEO, and theme options
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-brand-emerald/10 bg-white overflow-hidden">
        <div className="p-6 border-b border-brand-emerald/10 bg-brand-mint/20">
          <p className="text-sm text-muted-foreground">
            🚧 Full settings editor coming in Phase 3 — Dynamic Admin CMS Development
          </p>
        </div>

        <div className="p-6 space-y-8">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-primary mb-3">
                {category}
              </h2>
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-brand-mint/10">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-foreground">{item.key}</div>
                      {item.description && (
                        <div className="text-xs text-muted-foreground">{item.description}</div>
                      )}
                    </div>
                    <div className="text-sm text-foreground font-mono truncate max-w-[200px]">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
