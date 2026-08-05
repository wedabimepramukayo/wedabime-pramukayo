"use client";

/**
 * Admin Registration Page — Wedabime Pramukayo CMS
 *
 * Only accessible when no admin users exist in the database (first-time setup).
 * If admins already exist, redirects to login page.
 * This allows the first admin to register without any pre-seeded accounts.
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  TreePine,
  Shield,
  Eye,
  EyeOff,
  Loader2,
  Leaf,
  UserPlus,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

export default function AdminRegisterPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [canRegister, setCanRegister] = useState<boolean | null>(null);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const router = useRouter();

  const [dbError, setDbError] = useState<string>("");

  // Check if registration is allowed (no users exist)
  useEffect(() => {
    async function checkRegistration() {
      try {
        const res = await fetch("/api/admin/users/count");
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          // If DATABASE_URL is not configured, show specific error
          if (data.error === "DATABASE_URL is not configured") {
            setDbError(
              "Database is not configured. Please set DATABASE_URL as a Cloudflare Worker secret."
            );
          } else if (res.status === 500) {
            setDbError(
              "Database connection failed. Please check your database configuration."
            );
          }
          setCanRegister(false);
          return;
        }
        const data = await res.json();
        if (data.canRegister) {
          setCanRegister(true);
        } else {
          // Admins exist, redirect to login
          router.push("/admin/login");
        }
      } catch {
        setDbError("Unable to connect to the server. Please try again later.");
        setCanRegister(false);
      } finally {
        setCheckingAccess(false);
      }
    }
    checkRegistration();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: name || undefined,
          password,
          role: "admin",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed. Please try again.");
        return;
      }

      // Success — redirect to login
      router.push("/admin/login?registered=true");
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state while checking access
  if (checkingAccess || canRegister === null) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background:
            "linear-gradient(135deg, #081C15 0%, #1B4332 30%, #2D6A4F 60%, #40916C 100%)",
        }}
      >
        <Loader2 className="h-8 w-8 animate-spin text-brand-spring" />
      </div>
    );
  }

  // Registration not allowed
  if (!canRegister) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          background:
            "linear-gradient(135deg, #081C15 0%, #1B4332 30%, #2D6A4F 60%, #40916C 100%)",
        }}
      >
        <Card className="w-full max-w-md border-brand-emerald/20 bg-brand-dark/60 backdrop-blur-xl shadow-2xl">
          <CardContent className="pt-6 text-center space-y-4">
            <AlertTriangle className="h-12 w-12 mx-auto text-yellow-400" />
            <h2 className="text-xl font-semibold text-white">
              {dbError ? "Database Error" : "Registration Not Available"}
            </h2>
            <p className="text-brand-sage/70">
              {dbError ||
                "Admin accounts already exist. Please contact an existing administrator to create a new account."}
            </p>
            <Button
              onClick={() => router.push("/admin/login")}
              className="bg-brand-primary hover:bg-brand-emerald text-white"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background:
          "linear-gradient(135deg, #081C15 0%, #1B4332 30%, #2D6A4F 60%, #40916C 100%)",
      }}
    >
      {/* Decorative background */}
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
              Initial Admin Setup
            </p>
          </div>
        </div>

        {/* Registration Card */}
        <Card className="border-brand-emerald/20 bg-brand-dark/60 backdrop-blur-xl shadow-2xl">
          <CardHeader className="space-y-2 text-center pb-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-brand-emerald/20 flex items-center justify-center">
              <UserPlus className="h-6 w-6 text-brand-spring" />
            </div>
            <CardDescription className="text-brand-sage/80 text-base">
              Create the first admin account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Alert */}
              {error && (
                <Alert
                  variant="destructive"
                  className="bg-red-500/10 border-red-500/20 text-red-300"
                >
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Name Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-brand-sage/90 text-sm font-medium"
                >
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-brand-dark/50 border-brand-emerald/20 text-white placeholder:text-brand-sage/30 focus:border-brand-spring/50 focus:ring-brand-spring/20"
                />
              </div>

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
                  placeholder="you@example.com"
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
                    placeholder="Minimum 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
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

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-brand-sage/90 text-sm font-medium"
                >
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="bg-brand-dark/50 border-brand-emerald/20 text-white placeholder:text-brand-sage/30 focus:border-brand-spring/50 focus:ring-brand-spring/20 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-sage/40 hover:text-brand-sage transition-colors"
                  >
                    {showConfirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {confirmPassword && password === confirmPassword && (
                  <div className="flex items-center gap-1 text-green-400 text-xs">
                    <CheckCircle2 className="h-3 w-3" />
                    Passwords match
                  </div>
                )}
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
                    Creating account...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create Admin Account
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
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-brand-sage/30 text-xs mt-6">
          Wedabime Pramukayo CMS — First-time Admin Setup
        </p>
      </div>
    </div>
  );
}
