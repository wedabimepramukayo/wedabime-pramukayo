"use client";

/**
 * Admin Auth Guard — Client-side authentication check
 *
 * Used by the admin layout to protect admin pages when the server-side
 * getServerSession() check doesn't find a session. This handles:
 * 1. Checking auth status via useSession()
 * 2. Redirecting to /admin/login if unauthenticated
 * 3. Showing a loading state while checking
 *
 * This component is needed because cookie detection in Cloudflare Workers
 * middleware is unreliable, so we rely on server-side + client-side checks.
 */

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/admin/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-cream">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-brand-primary mx-auto" />
          <p className="text-brand-sage text-sm">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null; // Will redirect via useEffect
  }

  return <>{children}</>;
}
