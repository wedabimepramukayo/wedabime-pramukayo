/**
 * Breadcrumb Navigation — Wedabime Pramukayo
 * Accessible breadcrumb trail for inner pages
 */

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="py-3 bg-brand-cream/50 border-b border-brand-emerald/5">
      <div className="max-w-7xl mx-auto px-4">
        <ol className="flex items-center gap-1.5 text-sm">
          <li className="flex items-center gap-1.5">
            <Home className="h-3.5 w-3.5 text-muted-foreground" />
            <Link href="/" className="text-muted-foreground hover:text-brand-primary transition-colors">
              Home
            </Link>
          </li>
          {items.map((item, i) => {
            const isLast = i === items.length - 1;
            return (
              <li key={i} className="flex items-center gap-1.5">
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
                {isLast || !item.href ? (
                  <span className="text-brand-primary font-medium">{item.label}</span>
                ) : (
                  <Link
                    href={item.href}
                    className="text-muted-foreground hover:text-brand-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
