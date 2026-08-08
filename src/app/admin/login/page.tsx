"use client";

/**
 * Admin Login Page — Wedabime Pramukayo CMS
 * Elegant green-themed login with brand identity
 *
 * Uses a custom login API endpoint instead of NextAuth's signIn()
 * to bypass the Cloudflare Workers redirect issue where NextAuth
 * generates callback URLs with the workers.dev internal domain.
 *
 * Flow: POST /api/admin/login → sets session cookie → navigate to dashboard
 */

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TreePine, Shield, Eye, EyeOff, Loader2, Leaf, CheckCircle2 } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [justRegistered, setJustRegistered] = useState(false);

  // Check if just registered
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("registered") === "true") {
      setJustRegistered(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Use custom login endpoint that bypasses NextAuth's redirect mechanism
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Invalid email or password. Please try again.");
        return;
      }

      if (data.success) {
        // Session cookie is set by the server - navigate to dashboard
        // Use full page navigation to ensure cookie is available
        window.location.href = "/admin/dashboard";
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: "linear-gradient(135deg, #081C15 0%, #1B4332 30%, #2D6A4F 60%, #40916C 100%)",
      }}
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-spring/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-brand-emerald/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-teal/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8 space-y-4">
          <div className="flex justify-center">
            <div className="relative h-20 w-20 rounded-2xl overflow-hidden shadow-2xl ring-2 ring-brand-spring/30 bg-brand-dark/50 backdrop-blur">
              <Image
                src="/logo.png"
                alt="Wedabime Pramukayo"
                fill
                className="object-contain p-2"
                priority
              />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Wedabime Pramukayo
            </h1>
            <p className="text-brand-sage/70 text-sm mt-1">
              Content Management System
            </p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="border-brand-emerald/20 bg-brand-dark/60 backdrop-blur-xl shadow-2xl">
          <CardHeader className="space-y-2 text-center pb-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-brand-emerald/20 flex items-center justify-center">
              <Shield className="h-6 w-6 text-brand-spring" />
            </div>
            <CardDescription className="text-brand-sage/80 text-base">
              Sign in to manage your website
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Registration Success */}
              {justRegistered && (
                <Alert className="bg-green-500/10 border-green-500/20 text-green-300">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    Admin account created! You can now log in with your credentials.
                  </AlertDescription>
                </Alert>
              )}

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-300">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-brand-sage/90 text-sm font-medium"
                >
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="bg-brand-dark/50 border-brand-emerald/20 text-white placeholder:text-brand-sage/30 focus:border-brand-spring/50 focus:ring-brand-spring/20"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-brand-sage/90 text-sm font-medium"
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="bg-brand-dark/50 border-brand-emerald/20 text-white placeholder:text-brand-sage/30 focus:border-brand-spring/50 focus:ring-brand-spring/20 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-sage/40 hover:text-brand-sage transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-brand-primary hover:bg-brand-emerald text-white font-semibold transition-all duration-200 shadow-lg shadow-brand-primary/20 hover:shadow-brand-emerald/30"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Sign In to Admin Panel
                  </>
                )}
              </Button>
            </form>

            {/* Eco Badge */}
            <div className="mt-6 pt-4 border-t border-brand-emerald/15">
              <div className="flex items-center justify-center gap-4 text-center">
                <div className="flex items-center gap-1.5 text-brand-sage/50">
                  <TreePine className="h-3.5 w-3.5 text-brand-spring/60" />
                  <span className="text-[10px]">1,875+ trees/month</span>
                </div>
                <div className="w-px h-3 bg-brand-emerald/20" />
                <div className="flex items-center gap-1.5 text-brand-sage/50">
                  <Leaf className="h-3.5 w-3.5 text-brand-spring/60" />
                  <span className="text-[10px]">Eco-friendly solutions</span>
                </div>
              </div>
              {/* Register link — for first-time setup */}
              <div className="mt-3 text-center">
                <a
                  href="/admin/register"
                  className="text-brand-sage/40 hover:text-brand-spring/60 text-[10px] transition-colors"
                >
                  First time? Set up admin account →
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-brand-sage/30 text-xs mt-6">
          Wedabime Pramukayo CMS — Secure Admin Access
        </p>
      </div>
    </div>
  );
}
