/**
 * Contact Page — Wedabime Pramukayo
 * Contact form, business information, and map placeholder
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MapPin, Clock, Phone, Mail, Send, CheckCircle, Loader2, TreePine, Shield } from "lucide-react";

export default function ContactPage() {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    // Simulate sending (actual email integration would go here)
    await new Promise((res) => setTimeout(res, 1500));
    setSending(false);
    setSent(true);
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative py-20 text-white" style={{ background: "linear-gradient(135deg, #1B4332 0%, #2D6A4F 60%, #40916C 100%)" }}>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold">Contact Us</h1>
          <p className="text-lg text-brand-sage/80 mt-4 max-w-2xl mx-auto">
            Get in touch for a free consultation, quote, or any questions about our i-Panel solutions.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16 bg-brand-cream">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-10">
            {/* Contact Form */}
            <div className="p-8 rounded-xl border border-brand-emerald/10 bg-white">
              <h2 className="text-2xl font-bold text-brand-primary mb-6">Send Us a Message</h2>

              {sent ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-16 w-16 text-brand-spring mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-foreground mb-2">Message Sent!</h3>
                  <p className="text-muted-foreground">Thank you for reaching out. We&apos;ll get back to you within 24 hours.</p>
                  <Button onClick={() => setSent(false)} variant="outline" className="mt-4">
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input id="name" name="name" placeholder="Your name" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" name="phone" type="tel" placeholder="+94 XX XXX XXXX" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input id="email" name="email" type="email" placeholder="your@email.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input id="subject" name="subject" placeholder="e.g. Quote for ceiling installation" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea id="message" name="message" rows={5} placeholder="Tell us about your project..." required />
                  </div>
                  <Button
                    type="submit"
                    disabled={sending}
                    className="w-full bg-brand-primary hover:bg-brand-primary/90 py-3"
                  >
                    {sending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                    {sending ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              )}
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              {/* Business Info Cards */}
              <div className="p-6 rounded-xl border border-brand-emerald/10 bg-white space-y-5">
                <h2 className="text-xl font-bold text-brand-primary">Business Information</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-5 w-5 text-brand-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">Address</div>
                      <div className="text-sm text-muted-foreground">Gampaha District, Sri Lanka</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-brand-emerald/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-5 w-5 text-brand-emerald" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">Business Hours</div>
                      <div className="text-sm text-muted-foreground">Monday - Saturday: 8:00 AM - 6:00 PM</div>
                      <div className="text-sm text-muted-foreground">Sunday: Closed</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-brand-teal/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="h-5 w-5 text-brand-teal" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">Phone</div>
                      <div className="text-sm text-muted-foreground">Call us for immediate assistance</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-brand-gold/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="h-5 w-5 text-brand-gold" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">Email</div>
                      <div className="text-sm text-muted-foreground">We respond within 24 hours</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Eco Badge */}
              <div className="p-6 rounded-xl border border-brand-emerald/10 bg-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-brand-spring/10 flex items-center justify-center">
                    <TreePine className="h-5 w-5 text-brand-spring" />
                  </div>
                  <div>
                    <div className="font-bold text-foreground">Eco Impact</div>
                    <div className="text-sm text-muted-foreground">Choosing i-Panel saves trees</div>
                  </div>
                </div>
                <div className="text-3xl font-bold text-brand-spring">1,875+</div>
                <div className="text-sm text-muted-foreground">Trees saved every month</div>
              </div>

              {/* Warranty Badge */}
              <div className="p-6 rounded-xl border border-brand-gold/10 bg-brand-gold/5">
                <div className="flex items-center gap-3">
                  <Shield className="h-8 w-8 text-brand-gold" />
                  <div>
                    <div className="font-bold text-foreground">Up to 15 Years Warranty</div>
                    <div className="text-sm text-muted-foreground">Quality you can trust, backed by our comprehensive warranty.</div>
                  </div>
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="rounded-xl border border-brand-emerald/10 bg-brand-mint/20 h-48 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-8 w-8 text-brand-emerald/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Gampaha District, Sri Lanka</p>
                  <p className="text-xs text-muted-foreground/60">Map integration available in production</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
