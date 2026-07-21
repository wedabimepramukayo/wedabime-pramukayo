/**
 * Public Site Layout — Wedabime Pramukayo
 * Wraps all public-facing pages with Header + Footer
 * Uses route group (public) to separate from admin layout
 */

// Force dynamic rendering — footer queries database for contact info
export const dynamic = 'force-dynamic';

import { PublicHeader } from "@/components/public/header";
import { PublicFooter } from "@/components/public/footer";
import { ScrollToTop } from "@/components/public/scroll-to-top";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
      <ScrollToTop />
    </div>
  );
}
