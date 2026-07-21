"use client";

/**
 * Auth Provider — Wraps the app with NextAuth SessionProvider
 * Used in admin layout to provide session context to client components
 */

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

export function AuthProvider({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
