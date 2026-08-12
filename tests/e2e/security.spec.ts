import { expect, test } from "@playwright/test";

test("public responses are protected by security headers", async ({ request }) => {
  const res = await request.get("/");
  const csp = res.headers()["content-security-policy"] ?? "";
  expect(csp).toContain("frame-ancestors 'none'");
  expect(res.headers()["x-content-type-options"]).toBe("nosniff");
  expect(res.headers()["x-frame-options"]).toBe("DENY");
  expect(res.headers()["referrer-policy"]).toBe("strict-origin-when-cross-origin");
});

test("the health endpoint reports DB connectivity (ok or degraded)", async ({ request }) => {
  const res = await request.get("/api/health");
  // 200 when the DB is reachable, 503 when degraded — both are valid liveness
  // signals; the local E2E server may not have a database attached.
  expect([200, 503]).toContain(res.status());
  const body = await res.json();
  expect(["ok", "degraded"]).toContain(body.status);
});
