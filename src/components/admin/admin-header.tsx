"use client";

/**
 * Admin Header — Wedabime Pramukayo CMS
 * Top bar with breadcrumb, user info, and quick actions
 */

import { useSession } from "next-auth/react";
import { Bell, Search, User, Shield, Inbox } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { signOut } from "next-auth/react";

interface AdminHeaderProps {
  user: any;
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const { data: session } = useSession();
  const displayName = session?.user?.name || user?.name || "Admin";
  const displayEmail = session?.user?.email || user?.email || "";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="h-16 border-b border-brand-emerald/20 bg-white/80 backdrop-blur-sm sticky top-0 z-30">
      <div className="flex items-center justify-between h-full px-6">
        {/* Left: Search */}
        <div className="flex items-center gap-4 flex-1">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search pages, services, posts..."
              className="pl-9 bg-brand-mint/30 border-brand-emerald/10 focus:border-brand-emerald/30 focus:ring-brand-emerald/20"
            />
          </div>
        </div>

        {/* Right: Actions & User */}
        <div className="flex items-center gap-3">
          {/* Messages */}
          <a href="/admin/messages">
            <Button
              variant="ghost"
              size="icon"
              className="relative text-muted-foreground hover:text-brand-primary"
            >
              <Inbox className="h-5 w-5" />
            </Button>
          </a>

          {/* Role Badge */}
          <Badge
            variant="outline"
            className="hidden sm:flex items-center gap-1 text-brand-primary border-brand-emerald/20 bg-brand-mint/30"
          >
            <Shield className="h-3 w-3" />
            {session?.user ? (session.user as any).role : "admin"}
          </Badge>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-2 hover:bg-brand-mint/30"
              >
                <Avatar className="h-8 w-8 bg-brand-primary text-white">
                  <AvatarFallback className="bg-brand-primary text-white text-xs font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-medium text-foreground">
                    {displayName}
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate max-w-[140px]">
                    {displayEmail}
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="font-medium">{displayName}</span>
                  <span className="text-xs text-muted-foreground">
                    {displayEmail}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                onClick={() => signOut({ callbackUrl: "/admin/login" })}
              >
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
