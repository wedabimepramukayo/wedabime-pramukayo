/**
 * Admin Categories Manager — Placeholder for Phase 3
 */

import { db } from "@/lib/db";

export default async function AdminCategories() {
  const categories = await db.productCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Category Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Organize products into categories
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-brand-emerald/10 bg-white overflow-hidden">
        <div className="p-6 border-b border-brand-emerald/10 bg-brand-mint/20">
          <p className="text-sm text-muted-foreground">
            🚧 Full category editor coming in Phase 3 — Dynamic Admin CMS Development
          </p>
        </div>

        <div className="divide-y divide-brand-emerald/10">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between p-4 hover:bg-brand-mint/10 transition-colors">
              <div className="min-w-0">
                <div className="font-medium text-foreground">{cat.name}</div>
                <div className="text-xs text-muted-foreground">/{cat.slug} • {cat._count.products} products</div>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                cat.isActive
                  ? "bg-brand-spring/20 text-brand-emerald"
                  : "bg-red-100 text-red-600"
              }`}>
                {cat.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
