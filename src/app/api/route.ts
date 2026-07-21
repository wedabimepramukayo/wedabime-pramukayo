/**
 * Health Check API — Wedabime Pramukayo
 * Returns system status for monitoring and uptime checks
 */

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Force dynamic rendering — no prerendering at build time
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Test database connectivity
    await db.$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: "healthy",
      service: "Wedabime Pramukayo CMS",
      timestamp: new Date().toISOString(),
      database: "connected",
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        service: "Wedabime Pramukayo CMS",
        timestamp: new Date().toISOString(),
        database: "disconnected",
        error: "Database connection failed",
      },
      { status: 503 }
    );
  }
}
