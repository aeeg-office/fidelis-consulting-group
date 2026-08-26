import { NextResponse } from "next/server";

/**
 * GET /api/health/live — Kubernetes‑style liveness probe.
 *
 * Purpose: confirm the application process itself is alive and
 *         capable of handling HTTP requests.
 *
 * This endpoint MUST NOT fail because of:
 *  - database unavailability
 *  - OpenRouter / external AI outage
 *  - email provider failure
 *  - any other optional backend integration
 *
 * Expected response: HTTP 200 + lightweight metadata.
 * Never returns secrets.
 */
export async function GET() {
  const uptime = process.uptime();
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);

  return NextResponse.json({
    status: "alive",
    service: "fidelis-consulting-group",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "0.0.0",
    uptime: `${hours}h ${minutes}m`,
  });
}