/**
 * Neon SQL Helper — Shared utilities for direct SQL access via @neondatabase/serverless
 * Used by all API routes to bypass Prisma on Cloudflare Workers
 *
 * Replaces: db from "@/lib/db" (PrismaClient with PrismaNeonHTTP adapter)
 * Reason: Prisma native engine incompatible with CF Workers V8 runtime
 */

import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

/** Get a Neon SQL function from DATABASE_URL */
export function getSql(): NeonQueryFunction<false> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }
  return neon(process.env.DATABASE_URL);
}

/** Generate CUID-like ID (compatible with Prisma's @default(cuid())) */
export function generateId(): string {
  const timestamp = Date.now().toString(36);
  const random = crypto.getRandomValues(new Uint8Array(24));
  const randomStr = Array.from(random, b => b.toString(36).padStart(2, '0')).join('');
  return `c${timestamp}${randomStr}`.slice(0, 25);
}

/** Check authentication — returns session or throws 401 response */
export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return null;
  }
  return session;
}

/** Create a 401 Unauthorized response */
export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

/** Create a 400 Bad Request response */
export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

/** Create a 404 Not Found response */
export function notFound(message: string) {
  return NextResponse.json({ error: message }, { status: 404 });
}

/** Create a 409 Conflict response */
export function conflict(message: string) {
  return NextResponse.json({ error: message }, { status: 409 });
}

/** Create a 500 Internal Server Error response */
export function serverError(message: string, detail?: string) {
  return NextResponse.json({ error: message, ...(detail && { detail }) }, { status: 500 });
}

/** Safely stringify JSON fields for SQL insertion */
export function jsonStringify(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}

/** Safely parse JSON fields from SQL results */
export function jsonParse(value: string | null): unknown {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}
