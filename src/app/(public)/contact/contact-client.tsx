"use client";

/**
 * Contact Form Client Component — Wedabime Pramukayo
 * Handles form submission with client-side state
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Send, CheckCircle, Loader2, AlertCircle } from "lucide-react";

export default function ContactClient() {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSending(true);

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value,
      subject: (form.elements.namedItem("subject") as HTMLInputElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || "Something went wrong. Please try again.");
        return;
      }

      setSent(true);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-8 rounded-xl border border-brand-emerald/10 bg-white">
      <h2 className="text-2xl font-bold text-brand-primary mb-6">Send Us a Message</h2>

      {sent ? (
        <div className="text-center py-12">
          <CheckCircle className="h-16 w-16 text-brand-spring mx-auto mb-4" />
          <h3 className="text-xl font-bold text-foreground mb-2">Message Sent!</h3>
          <p className="text-muted-foreground mb-6">
            Thank you for reaching out. We&apos;ll get back to you within 24 hours.
          </p>
          <Button onClick={() => setSent(false)} variant="outline" className="mt-4">
            Send Another Message
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" name="name" placeholder="Your name" required disabled={sending} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" name="phone" type="tel" placeholder="+94 XX XXX XXXX" disabled={sending} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input id="email" name="email" type="email" placeholder="your@email.com" required disabled={sending} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input id="subject" name="subject" placeholder="e.g. Quote for ceiling installation" required disabled={sending} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea id="message" name="message" rows={5} placeholder="Tell us about your project..." required disabled={sending} />
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
  );
}
