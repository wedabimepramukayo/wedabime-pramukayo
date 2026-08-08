/**
 * Health Check API — Wedabime Pramukayo
 * Returns system status for monitoring and uptime checks
 * Uses direct Neon HTTP query for Edge compatibility
 */

import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// Force dynamic rendering — no prerendering at build time
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Test database connectivity using direct Neon HTTP query
    // This is more reliable than Prisma model queries on Edge runtime
    const sql = neon(process.env.DATABASE_URL!);
    const result = await sql`SELECT 1 as test`;

    return NextResponse.json({
      status: "healthy",
      service: "Wedabime Pramukayo CMS",
      timestamp: new Date().toISOString(),
      database: "connected",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        status: "unhealthy",
        service: "Wedabime Pramukayo CMS",
        timestamp: new Date().toISOString(),
        database: "disconnected",
        error: message,
      },
      { status: 503 }
    );
  }
}
