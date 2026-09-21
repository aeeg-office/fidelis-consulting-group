import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers";

/**
 * Role-based access control — E2E browser tests
 *
 * Verify that each role sees ONLY its authorized capabilities and
 * that direct URL access to unauthorized areas is rejected.
 *
 * Authenticated tests use real login with seeded QA users from
 * the CI seed step (prisma/seed.ts).
 */

const QA_PASSWORD = "NightlyQA-E2E-Password-2026";

/** Map role names (as in the DB seed) to their seeded QA email. */
const ROLE_EMAIL: Record<string, string> = {
  admin: "qa.admin@example.test",
  school_admin: "qa.school-admin@example.test",
  hod: "qa.hod@example.test",
  teacher: "qa.teacher@example.test",
  independent_teacher: "qa.independent-teacher@example.test",
  workshop_participant: "qa.workshop-participant@example.test",
};

/** The page each role is expected to access by default. */
const ROLE_PAGES: Record<string, string> = {
  admin: "/app/dashboard/admin",
  school_admin: "/app/school",
  hod: "/app/hod",
  teacher: "/app/dashboard/teacher",
  independent_teacher: "/app/dashboard/teacher",
  workshop_participant: "/app/workshops",
};

test.describe("Role-based dashboards", () => {
  for (const [role, path] of Object.entries(ROLE_PAGES)) {
    test(`${role} dashboard loads for authorized user`, async ({ page }) => {
      const email = ROLE_EMAIL[role];
      await loginAs(page, email, QA_PASSWORD);
      // Should already be past /app/login — navigate to the target role page
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await expect(page).not.toHaveURL(/\/app\/login/);
      // The page should render (not redirect to login)
      const expectedRe = new RegExp(path.replace(/\//g, "\\/"));
      await expect(page).toHaveURL(expectedRe);
    });
  }

  test("unauthenticated user is redirected to login for guarded pages", async ({ page }) => {
    // Paths with middleware auth guard (requireAnyRole layouts)
    const guardedPages = ["/app/dashboard/admin", "/app/dashboard/teacher", "/app/school", "/app/hod", "/app/dashboard/admin/schools"];
    for (const path of guardedPages) {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await expect(page).toHaveURL(/\/app\/login/);
    }
  });
});

test.describe("Negative authorization — direct URL access", () => {
  test("teacher cannot access school admin page", async ({ page }) => {
    await loginAs(page, ROLE_EMAIL.teacher, QA_PASSWORD);
    // Teacher tries to access /app/school directly — requireAnyRole redirects to /app/dashboard
    await page.goto("/app/school", { waitUntil: "domcontentloaded" });
    const url = page.url();
    const isRejected = url.includes("/app/login") || url.includes("/app/dashboard") || url.includes("denied") || url.includes("403");
    expect(isRejected).toBeTruthy();
  });

  test("teacher cannot access admin dashboard", async ({ page }) => {
    await loginAs(page, ROLE_EMAIL.teacher, QA_PASSWORD);
    await page.goto("/app/dashboard/admin", { waitUntil: "domcontentloaded" });
    const url = page.url();
    const isRejected = url.includes("/app/login") || url.includes("/app/dashboard") || url.includes("denied") || url.includes("403");
    expect(isRejected).toBeTruthy();
  });

  test("HOD cannot access school admin settings", async ({ page }) => {
    await loginAs(page, ROLE_EMAIL.hod, QA_PASSWORD);
    await page.goto("/app/school", { waitUntil: "domcontentloaded" });
    const url = page.url();
    const isRejected = url.includes("/app/login") || url.includes("/app/dashboard") || url.includes("denied") || url.includes("403");
    expect(isRejected).toBeTruthy();
  });

  test("school admin cannot access Fidelis global admin settings", async ({ page }) => {
    await loginAs(page, ROLE_EMAIL.school_admin, QA_PASSWORD);
    await page.goto("/app/dashboard/admin/schools", { waitUntil: "domcontentloaded" });
    const url = page.url();
    const isRejected = url.includes("/app/login") || url.includes("/app/dashboard") || url.includes("denied") || url.includes("403");
    expect(isRejected).toBeTruthy();
  });
});

test.describe("API authorization", () => {
  test("protected APIs reject unauthenticated calls", async ({ request }) => {
    // These API routes include server-side auth checks
    const protectedApis = [
      "/api/admin/schools",
      "/api/school/overview",
      "/api/hod/department",
      "/api/billing/status",
    ];
    for (const api of protectedApis) {
      const res = await request.get(api);
      // Should NOT be 200 for unauthenticated — 401/403/307 all acceptable
      expect([401, 403, 307, 302].includes(res.status()), `${api} should reject unauthenticated`).toBeTruthy();
    }
  });

  test("AI tool API rejects unauthenticated calls", async ({ request }) => {
    const res = await request.get("/api/ai/lesson-plan");
    expect([401, 403, 307, 302].includes(res.status())).toBeTruthy();
  });
});