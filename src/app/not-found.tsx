/**
 * Custom 404 Not Found Page — Wedabime Pramukayo
 * Brand-styled error page with helpful navigation
 */

import Link from "next/link";
import { ArrowLeft, Home, Search, TreePine } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        {/* 404 Number */}
        <div className="relative mb-6">
          <div className="text-[120px] md:text-[160px] font-bold text-brand-primary/10 leading-none select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <TreePine className="h-16 w-16 text-brand-emerald/40" />
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
          Page Not Found
        </h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          It looks like the page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let us help you find what you need — explore our services or head back to the homepage.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-primary/90 transition-colors"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Link>
          <Link
            href="/services"
            className="inline-flex items-center gap-2 px-6 py-3 border border-brand-primary text-brand-primary font-semibold rounded-lg hover:bg-brand-mint/30 transition-colors"
          >
            <Search className="h-4 w-4" />
            Browse Services
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 text-muted-foreground font-medium hover:text-brand-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
