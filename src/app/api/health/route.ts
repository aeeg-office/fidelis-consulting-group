import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/health — Aggregate health summary (legacy + new).
 *
 * Backward‑compatible endpoint that returns the overall platform
 * status.  New monitoring infrastructure should prefer:
 *   /api/health/live   — liveness (process is alive)
 *   /api/health/ready  — readiness (required deps ok)
 *
 * ── Status semantics ────────────────────────────────────────
 * "healthy"   — All required AND optional dependencies are
 *               operational. The platform is fully functional.
 *
 * "degraded"  — Required dependencies are operational (readiness
 *               passes), but one or more optional integrations
 *               (OpenRouter, email, etc.) are unavailable.
 *               Core user traffic can still be served.
 *
 * "unready"   — A required dependency is failing. The platform
 *               cannot safely serve normal traffic.
 *
 * "down"      — The application process itself is not responding
 *               (this endpoint would not be reachable).
 *
 * HTTP status: 200 unless readiness fails (→ 503).
 */
export async function GET() {
  const checks: Record<string, { status: string; note?: string }> = {};
  let healthy = true;

  // ── 1. Liveness (implicit — we are running) ──────────────
  checks.liveness = { status: "ok" };

  // ── 2. Readiness — DB ────────────────────────────────────
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { status: "ok" };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    checks.database = { status: "error", note: "query_engine_unavailable" };
    healthy = false;
  }

  // ── 3. Optional: OpenRouter / AI provider ────────────────
  // We check that the API key is configured.  A full AI‑model
  // call is NOT made every health check — that would be expensive
  // and unnecessary.
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  if (!openrouterKey || openrouterKey === "PENDING_FROM_OWNER") {
    checks.openrouter = { status: "unavailable", note: "api_key_not_configured" };
  } else {
    checks.openrouter = { status: "ok" };
  }

  // ── 4. Optional: Auth / NextAuth ─────────────────────────
  const nextauthSecret = process.env.NEXTAUTH_SECRET;
  if (!nextauthSecret) {
    checks.auth = { status: "unavailable", note: "secret_not_configured" };
  } else {
    checks.auth = { status: "ok" };
  }

  const nextauthUrl = process.env.NEXTAUTH_URL;
  if (!nextauthUrl) {
    checks.auth = { status: "unavailable", note: "url_not_configured" };
  } else {
    // NEXTAUTH_URL is set, mergeboth checks
    if (checks.auth?.status === "ok") {
      checks.auth = { status: "ok" };
    }
  }

  // ── 5. Determine overall status ─────────────────────────
  if (!healthy) {
    return NextResponse.json(
      {
        status: "unready",
        ready: false,
        checks,
        time: new Date().toISOString(),
      },
      { status: 503 },
    );
  }

  // Check if any optional dependency is degraded
  const optionalUnhealthy = ["openrouter", "email", "analytics"].some(
    (k) => checks[k]?.status === "unavailable",
  );

  if (optionalUnhealthy) {
    return NextResponse.json({
      status: "degraded",
      ready: true,
      checks,
      time: new Date().toISOString(),
    });
  }

  return NextResponse.json({
    status: "healthy",
    ready: true,
    checks,
    time: new Date().toISOString(),
  });
}