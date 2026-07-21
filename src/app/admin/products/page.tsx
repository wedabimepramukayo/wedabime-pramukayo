/**
 * Admin Services Manager — Placeholder for Phase 3
 */

import { db } from "@/lib/db";

export default async function AdminServices() {
  const services = await db.product.findMany({
    orderBy: { sortOrder: "asc" },
    include: { category: { select: { name: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Service Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage i-Panel services, descriptions, and categories
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-brand-emerald/10 bg-white overflow-hidden">
        <div className="p-6 border-b border-brand-emerald/10 bg-brand-mint/20">
          <p className="text-sm text-muted-foreground">
            🚧 Full service editor coming in Phase 3 — Dynamic Admin CMS Development
          </p>
        </div>

        <div className="divide-y divide-brand-emerald/10">
          {services.map((service) => (
            <div key={service.id} className="flex items-center justify-between p-4 hover:bg-brand-mint/10 transition-colors">
              <div className="min-w-0">
                <div className="font-medium text-foreground">{service.name}</div>
                <div className="text-xs text-muted-foreground">
                  /service/{service.slug} • {service.category?.name || "Uncategorized"}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {service.isFeatured && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-gold/20 text-brand-gold font-medium">
                    Featured
                  </span>
                )}
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  service.isPublished
                    ? "bg-brand-spring/20 text-brand-emerald"
                    : "bg-brand-gold/20 text-brand-gold"
                }`}>
                  {service.isPublished ? "Published" : "Draft"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
