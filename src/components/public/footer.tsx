/**
 * Public Site Footer — Wedabime Pramukayo
 * Multi-column footer with company info, services, and eco badge
 */

import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Clock,
  TreePine,
  Shield,
  Phone,
  Mail,
  Facebook,
  Instagram,
  Youtube,
} from "lucide-react";

const serviceLinks = [
  { label: "i-Panel Heavy Flat", href: "/services/i-panel-heavy-flat" },
  { label: "i-Panel Designer Profile", href: "/services/i-panel-designer-profile" },
  { label: "i-Panel Lite / Project", href: "/services/i-panel-lite-project" },
  { label: "i-Panel Finishing Series", href: "/services/i-panel-finishing" },
  { label: "i-Panel Luxury Wall", href: "/services/i-panel-luxury-wall" },
];

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "All Services", href: "/services" },
  { label: "Advantages", href: "/advantages" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export function PublicFooter() {
  return (
    <footer className="bg-brand-dark text-brand-sage/80">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative h-10 w-10 rounded-lg overflow-hidden ring-1 ring-brand-emerald/20">
                <Image
                  src="/logo.png"
                  alt="Wedabime Pramukayo"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <div className="font-bold text-white text-sm">
                  Wedabime Pramukayo
                </div>
                <div className="text-[10px] text-brand-sage/60">
                  Premium i-Panel Solutions
                </div>
              </div>
            </Link>
            <p className="text-sm text-brand-sage/60 leading-relaxed">
              Sri Lanka&apos;s trusted provider of premium i-Panel ceiling systems, wall
              cladding, and roofing solutions. Built for generations.
            </p>

            {/* Eco Badge */}
            <div className="p-3 rounded-lg bg-brand-emerald/10 border border-brand-emerald/20">
              <div className="flex items-center gap-2 text-brand-spring">
                <TreePine className="h-4 w-4" />
                <span className="text-xs font-semibold">Eco Impact</span>
              </div>
              <p className="text-[10px] text-brand-sage/50 mt-1">
                1,875+ trees saved every month by choosing i-Panel
              </p>
            </div>
          </div>

          {/* Our Services */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Our Services</h3>
            <ul className="space-y-2">
              {serviceLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-brand-sage/60 hover:text-brand-spring transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-brand-sage/60 hover:text-brand-spring transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-brand-spring flex-shrink-0 mt-0.5" />
                <span className="text-sm text-brand-sage/60">
                  Gampaha District, Sri Lanka
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-brand-teal flex-shrink-0" />
                <span className="text-sm text-brand-sage/60">
                  Mon-Sat: 8:00 AM - 6:00 PM
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-brand-gold flex-shrink-0" />
                <span className="text-sm text-brand-sage/60">
                  Up to 15 years warranty
                </span>
              </li>
            </ul>

            {/* Social Links Placeholder */}
            <div className="flex items-center gap-3 mt-4">
              <a
                href="#"
                className="h-8 w-8 rounded-lg bg-brand-emerald/10 flex items-center justify-center hover:bg-brand-emerald/20 transition-colors"
              >
                <Facebook className="h-4 w-4 text-brand-sage/60" />
              </a>
              <a
                href="#"
                className="h-8 w-8 rounded-lg bg-brand-emerald/10 flex items-center justify-center hover:bg-brand-emerald/20 transition-colors"
              >
                <Instagram className="h-4 w-4 text-brand-sage/60" />
              </a>
              <a
                href="#"
                className="h-8 w-8 rounded-lg bg-brand-emerald/10 flex items-center justify-center hover:bg-brand-emerald/20 transition-colors"
              >
                <Youtube className="h-4 w-4 text-brand-sage/60" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-brand-emerald/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-brand-sage/40">
            &copy; {new Date().getFullYear()} Wedabime Pramukayo. All rights reserved.
          </p>
          <p className="text-xs text-brand-sage/40">
            Premium i-Panel Solutions — Built for Generations
          </p>
        </div>
      </div>
    </footer>
  );
}
