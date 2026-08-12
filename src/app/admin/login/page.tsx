"use client";

/**
 * Admin Login Page — Wedabime Pramukayo CMS
 *
 * Login flow (with multiple fallback strategies for Workers compatibility):
 * 1. Check if already authenticated → redirect to dashboard
 * 2. Try custom /api/admin/login endpoint (sets both cookies)
 * 3. If custom fails, try NextAuth signIn (sets session cookie)
 * 4. After any successful login, set wpm_auth client-side cookie for middleware
 * 5. Navigate to dashboard/callbackUrl
 */

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TreePine, Shield, Eye, EyeOff, Loader2, Leaf, CheckCircle2 } from "lucide-react";

/**
 * Set the auth flag cookie client-side (non-HttpOnly, readable by middleware).
 * This ensures the middleware can detect authenticated users even when
 * the server-side Set-Cookie mechanism fails or NextAuth doesn't set it.
 */
function setAuthFlagCookie() {
  const maxAge = 24 * 60 * 60; // 24 hours
  const isSecure = window.location.protocol === "https:";
  const cookieName = isSecure ? "__Secure-wpm_auth" : "wpm_auth";
  const expires = new Date(Date.now() + maxAge * 1000).toUTCString();
  const parts = [
    `${cookieName}=1`,
    `Path=/`,
    `Expires=${expires}`,
    `SameSite=Lax`,
  ];
  if (isSecure) parts.push("Secure");
  document.cookie = parts.join("; ");
}

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [justRegistered, setJustRegistered] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // On mount, check if user is already authenticated
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("registered") === "true") {
      setJustRegistered(true);
    }

    // Check if already authenticated by calling the session endpoint
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user?.email) {
          // Already logged in — set auth flag and redirect
          setAuthFlagCookie();
          const callbackUrl = params.get("callbackUrl") || "/admin/dashboard";
          window.location.replace(callbackUrl);
        } else {
          setCheckingSession(false);
        }
      })
      .catch(() => {
        setCheckingSession(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const params = new URLSearchParams(window.location.search);
    const callbackUrl = params.get("callbackUrl") || "/admin/dashboard";

    // Strategy 1: Try custom login endpoint
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      // Only parse JSON if response is OK (custom endpoint returns JSON)
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Custom login succeeded — cookies are set by server
          // Also set client-side auth flag as backup
          setAuthFlagCookie();
          setTimeout(() => {
            window.location.replace(callbackUrl);
          }, 300);
          return;
        }
        // Custom endpoint returned an error
        setError(data.error || "Invalid email or password.");
        setIsLoading(false);
        return;
      }
      // Custom endpoint returned non-200 (probably 404 on Workers)
      // Fall through to NextAuth strategy
      console.log("Custom login endpoint not available, trying NextAuth...");
    } catch (err) {
      // Custom endpoint failed (network error, JSON parse error, etc.)
      // Fall through to NextAuth strategy
      console.log("Custom login failed, trying NextAuth fallback:", err);
    }

    // Strategy 2: Use NextAuth signIn
    try {
      const { signIn } = await import("next-auth/react");
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.ok) {
        // NextAuth login succeeded — session cookie is set
        // Set client-side auth flag cookie for middleware detection
        setAuthFlagCookie();
        setTimeout(() => {
          window.location.replace(callbackUrl);
        }, 500);
        return;
      }

      // NextAuth returned an error
      if (result?.error) {
        setError("Invalid email or password. Please try again.");
      } else {
        setError("Login failed. Please try again.");
      }
    } catch (fallbackErr) {
      console.error("NextAuth login also failed:", fallbackErr);
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading spinner while checking existing session
  if (checkingSession) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, #081C15 0%, #1B4332 30%, #2D6A4F 60%, #40916C 100%)",
        }}
      >
        <Loader2 className="h-8 w-8 animate-spin text-brand-spring" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: "linear-gradient(135deg, #081C15 0%, #1B4332 30%, #2D6A4F 60%, #40916C 100%)",
      }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-spring/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-brand-emerald/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-teal/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
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
              {justRegistered && (
                <Alert className="bg-green-500/10 border-green-500/20 text-green-300">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    Admin account created! You can now log in with your credentials.
                  </AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-300">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-brand-sage/90 text-sm font-medium">
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

              <div className="space-y-2">
                <Label htmlFor="password" className="text-brand-sage/90 text-sm font-medium">
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
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

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

        <p className="text-center text-brand-sage/30 text-xs mt-6">
          Wedabime Pramukayo CMS — Secure Admin Access
        </p>
      </div>
    </div>
  );
}
