import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/health — lightweight liveness/readiness probe. Verifies the DB is
 * reachable. Never returns secrets or user data.
 */
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok", db: "ok", time: new Date().toISOString() });
  } catch {
    return NextResponse.json({ status: "degraded", db: "error", time: new Date().toISOString() }, { status: 503 });
  }
}
