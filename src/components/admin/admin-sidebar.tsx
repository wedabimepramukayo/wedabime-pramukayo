"use client";

/**
 * Admin Sidebar — Wedabime Pramukayo CMS
 * Navigation sidebar with brand logo, menu items, and active state
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  FileText,
  Package,
  FolderOpen,
  Settings,
  NotebookPen,
  LogOut,
  ChevronLeft,
  TreePine,
} from "lucide-react";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    description: "Overview & Stats",
  },
  {
    label: "Pages",
    href: "/admin/pages",
    icon: FileText,
    description: "Manage Content",
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: Package,
    description: "i-Panel & Services",
  },
  {
    label: "Categories",
    href: "/admin/categories",
    icon: FolderOpen,
    description: "Product Categories",
  },
  {
    label: "Blog",
    href: "/admin/blog",
    icon: NotebookPen,
    description: "Blog Posts",
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
    description: "Site Configuration",
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 flex flex-col border-r border-brand-emerald/20 bg-brand-dark transition-all duration-300",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-brand-emerald/20">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 rounded-lg overflow-hidden flex-shrink-0 ring-1 ring-brand-spring/30">
            <Image
              src="/logo.png"
              alt="Wedabime Pramukayo"
              fill
              className="object-contain"
            />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-white truncate">
                Wedabime Pramukayo
              </h1>
              <p className="text-[10px] text-brand-sage/70">CMS Admin Panel</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group",
                isActive
                  ? "bg-brand-emerald/20 text-brand-spring shadow-sm"
                  : "text-brand-sage/70 hover:bg-brand-emerald/10 hover:text-brand-sage"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={cn(
                  "h-5 w-5 flex-shrink-0 transition-colors",
                  isActive ? "text-brand-spring" : "text-brand-sage/50 group-hover:text-brand-sage"
                )}
              />
              {!collapsed && (
                <div className="min-w-0">
                  <div className="truncate">{item.label}</div>
                  <div className={cn(
                    "text-[10px] truncate",
                    isActive ? "text-brand-spring/60" : "text-brand-sage/40"
                  )}>
                    {item.description}
                  </div>
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Eco Badge */}
      {!collapsed && (
        <div className="mx-3 mb-3 p-3 rounded-lg bg-brand-emerald/10 border border-brand-emerald/20">
          <div className="flex items-center gap-2 text-brand-spring">
            <TreePine className="h-4 w-4" />
            <span className="text-xs font-semibold">Eco Impact</span>
          </div>
          <p className="text-[10px] text-brand-sage/60 mt-1">
            1,875+ trees saved monthly
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="p-3 border-t border-brand-emerald/20 space-y-1">
        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-brand-sage/60 hover:bg-brand-emerald/10 hover:text-brand-sage transition-colors w-full"
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform",
              collapsed && "rotate-180"
            )}
          />
          {!collapsed && <span>Collapse</span>}
        </button>

        {/* Logout */}
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-400/70 hover:bg-red-500/10 hover:text-red-400 transition-colors w-full"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
