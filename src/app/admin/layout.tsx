/**
 * Admin Panel Layout — Wedabime Pramukayo CMS
 * Protected layout with Sidebar navigation + Header
 *
 * Auth protection approach:
 * - Middleware lets all /admin/* requests through (cookie detection
 *   is unreliable on Cloudflare Workers)
 * - This layout checks getServerSession() server-side
 * - No session → render children without sidebar (login/register pages)
 * - Has session → render full admin layout with sidebar + header
 * - Individual admin pages (dashboard, etc.) do client-side
 *   useSession() check and redirect if unauthenticated
 */

// Force dynamic rendering — layout uses getServerSession which needs auth DB
export const dynamic = 'force-dynamic';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AuthProvider } from "@/components/auth-provider";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // No session: render children without sidebar.
  // - Login/register pages work fine without sidebar
  // - Other admin pages' client components will detect
  //   no session and redirect to /admin/login
  if (!session) {
    return <>{children}</>;
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
