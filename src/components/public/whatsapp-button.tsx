"use client";

/**
 * WhatsApp Floating Button — Wedabime Pramukayo
 * Fixed-position WhatsApp chat button (common for Sri Lankan businesses)
 * Appears in bottom-right corner with pulse animation
 */

import { MessageCircle } from "lucide-react";

// Default WhatsApp number — can be overridden from CMS settings
const WHATSAPP_NUMBER = "94XXXXXXXXX"; // Replace with actual number
const WHATSAPP_MESSAGE = "Hello! I'm interested in your i-Panel solutions. Can you help me?";

export function WhatsAppButton({ phone }: { phone?: string }) {
  const number = phone || WHATSAPP_NUMBER;
  const url = `https://wa.me/${number}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 h-14 w-14 bg-[#25D366] text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center group"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-6 w-6" />
      {/* Pulse ring */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20" />
    </a>
  );
}
