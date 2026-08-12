/**
 * Admin Panel Layout — Wedabime Pramukayo CMS
 * Protected layout with Sidebar navigation + Header
 *
 * Auth protection approach (Cloudflare Workers compatible):
 * - Middleware is minimal (pass-through) because cookie detection
 *   on Workers is unreliable
 * - This layout checks getServerSession() server-side
 * - No session + non-login page: client-side auth guard redirects
 * - Login/register pages: rendered without sidebar (children only)
 * - Authenticated: render full admin layout with sidebar + header
 */

// Force dynamic rendering — layout uses getServerSession which needs auth DB
export const dynamic = 'force-dynamic';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AuthProvider } from "@/components/auth-provider";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminAuthGuard } from "@/components/admin/admin-auth-guard";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // No session: render with auth guard (client-side redirect for protected pages)
  // Login/register pages work without the auth guard since they're public
  if (!session) {
    return (
      <AuthProvider>
        <AdminAuthGuard>{children}</AdminAuthGuard>
      </AuthProvider>
    );
  }

  // Authenticated: render full admin layout with sidebar + header
  return (
    <AuthProvider>
      <div className="min-h-screen flex bg-brand-cream">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <AdminHeader user={session.user} />

          {/* Page Content */}
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}
