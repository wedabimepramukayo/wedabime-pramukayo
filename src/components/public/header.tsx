"use client";

/**
 * Public Site Header — Wedabime Pramukayo
 * Sticky navigation with brand logo, menu links, and CTA button
 * Contact info (phone, email) pulled dynamically from CMS settings
 */

import Link from "next/link";
import Image from "next/image";
import {
  Menu,
  X,
  Phone,
  TreePine,
  Mail,
} from "lucide-react";
import { useState, useEffect } from "react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Advantages", href: "/advantages" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

interface PublicSettings {
  contact?: {
    phone?: string;
    email?: string;
    address?: string;
    business_hours?: string;
  };
  social?: {
    whatsapp?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
  };
}

export function PublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settings, setSettings] = useState<PublicSettings>({});
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    fetch("/api/public/settings")
      .then((r) => r.json())
      .then((data) => setSettings(data.settings || {}))
      .catch(() => {});

    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const phone = settings.contact?.phone;
  const email = settings.contact?.email;

  return (
    <header className={`sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-brand-emerald/10 transition-shadow ${scrolled ? "shadow-md" : "shadow-sm"}`}>
      {/* Top bar — eco stats & contact */}
      <div className="bg-brand-dark text-brand-sage/80 text-xs py-1.5">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <TreePine className="h-3 w-3 text-brand-spring" />
              1,875+ trees saved monthly
            </span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:flex items-center gap-1.5">
              Up to <strong className="text-brand-gold">15 years warranty</strong>
            </span>
          </div>
          <div className="flex items-center gap-4">
            {phone && (
              <a
                href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                <Phone className="h-3 w-3" />
                <span className="hidden sm:inline">{phone}</span>
              </a>
            )}
            {email && (
              <a
                href={`mailto:${email}`}
                className="hidden md:flex items-center gap-1 hover:text-white transition-colors"
              >
                <Mail className="h-3 w-3" />
                <span>{email}</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative h-10 w-10 rounded-lg overflow-hidden ring-1 ring-brand-emerald/20 group-hover:ring-brand-spring/40 transition-all">
              <Image
                src="/logo.png"
                alt="Wedabime Pramukayo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div>
              <div className="font-bold text-brand-primary text-sm leading-tight">
                Wedabime Pramukayo
              </div>
              <div className="text-[10px] text-brand-emerald leading-tight">
                Premium i-Panel Solutions
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-foreground/70 hover:text-brand-primary hover:bg-brand-mint/30 rounded-lg transition-all"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA + Mobile Toggle */}
          <div className="flex items-center gap-3">
            <Link
              href="/contact"
              className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white text-sm font-semibold rounded-lg hover:bg-brand-primary/90 transition-colors shadow-sm"
            >
              Get a Quote
            </Link>
            <button
              className="md:hidden p-2 rounded-lg hover:bg-brand-mint/30 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? (
                <X className="h-5 w-5 text-foreground" />
              ) : (
                <Menu className="h-5 w-5 text-foreground" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileOpen && (
        <div className="md:hidden border-t border-brand-emerald/10 bg-white animate-in slide-in-from-top-2 duration-200">
          <nav className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2.5 text-sm font-medium text-foreground/70 hover:text-brand-primary hover:bg-brand-mint/20 rounded-lg transition-all"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 space-y-2">
              <Link
                href="/contact"
                className="block px-3 py-2.5 text-sm font-semibold text-white bg-brand-primary rounded-lg text-center"
                onClick={() => setMobileOpen(false)}
              >
                Get a Quote
              </Link>
              {phone && (
                <a
                  href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-brand-primary hover:bg-brand-mint/20 rounded-lg transition-all"
                  onClick={() => setMobileOpen(false)}
                >
                  <Phone className="h-4 w-4" />
                  Call Us: {phone}
                </a>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
