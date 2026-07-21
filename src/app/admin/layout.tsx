/**
 * Admin Panel Layout — Wedabime Pramukayo CMS
 * Protected layout with Sidebar navigation + Header
 * The middleware handles auth redirects; this layout only adds UI chrome
 * for authenticated users. Login page is excluded via route groups.
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AuthProvider } from "@/components/auth-provider";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The middleware already handles authentication.
  // However, as a server-side safeguard, we also check here.
  // The key: we must NOT redirect the login page to itself.
  // Since the middleware allows /admin/login without auth, we use
  // a route-group approach: /admin/(protected)/ has this layout with sidebar,
  // while /admin/(auth)/login has its own layout without auth check.
  //
  // But since both share the same /admin URL segment in the current structure,
  // we rely on the middleware to pass through /admin/login, and we must
  // avoid calling redirect() for unauthenticated users on the login page.
  //
  // The safest approach: just render children for unauthenticated users.
  // The middleware will ensure only /admin/login is accessible without auth.
  // All other /admin/* routes would have been redirected by middleware already.

  const session = await getServerSession(authOptions);

  // If no session, this must be the login page (middleware allows it through)
  // Just render the login page without sidebar/header
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
