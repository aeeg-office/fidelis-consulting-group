import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/health/ready — Kubernetes‑style readiness probe.
 *
 * Purpose: determine whether the application can safely serve its
 *         REQUIRED workload.
 *
 * Checks required dependencies:
 *  - primary PostgreSQL database (without which no user‑facing
 *    feature can operate)
 *
 * Returns HTTP 200 when ready, 503 when a genuinely required
 * dependency prevents normal operation.
 *
 * Optional integrations (OpenRouter, email, analytics, etc.) are
 * NOT checked here — they belong in /api/health or a separate
 * status endpoint.
 */
export async function GET() {
  const checks: Record<string, { status: string }> = {};
  let allReady = true;

  // ── Database ──────────────────────────────────────────────
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { status: "ok" };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // Only the error class is exposed — never the full message
    // (might contain connection strings).
    checks.database = { status: "failed" };
    allReady = false;
  }

  if (allReady) {
    return NextResponse.json({
      status: "ready",
      checks,
    });
  }

  return NextResponse.json(
    {
      status: "not_ready",
      checks,
    },
    { status: 503 },
  );
}