import { expect, test } from "@playwright/test";

/**
 * Role-based access control — E2E browser tests
 *
 * Verify that each role sees ONLY its authorized capabilities and
 * that direct URL access to unauthorized areas is rejected.
 */

const ROLE_PAGES: Record<string, string> = {
  admin: "/app/dashboard/admin",
  school_admin: "/app/school",
  hod: "/app/hod",
  teacher: "/app/dashboard/teacher",
  independent_teacher: "/app/dashboard/teacher",
  workshop_participant: "/app/workshops",
};

function mockSession(page: import("@playwright/test").Page, role: string) {
  return page.route("**/api/auth/session", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        user: {
          id: `user-${role}`,
          name: "QA Test User",
          email: `${role}.nightly-qa@example.test`,
          role,
        },
        expires: "2099-12-31T00:00:00.000Z",
      }),
    });
  });
}

// Mock the dashboard data APIs so pages render with data
function mockDashboardData(page: import("@playwright/test").Page) {
  return page.route("**/api/**", async (route) => {
    const url = route.request().url();
    if (!url.includes("/api/auth")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, data: [] }),
      });
    } else {
      await route.continue();
    }
  });
}

test.describe("Role-based dashboards", () => {
  for (const [role, path] of Object.entries(ROLE_PAGES)) {
    test(`${role} dashboard loads for authorized user`, async ({ page }) => {
      await mockSession(page, role);
      await mockDashboardData(page);
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await expect(page).not.toHaveURL(/\/app\/login/);
      // The page should render (not redirect to login)
      await expect(page).toHaveURL(RegExp(path.replace(/\//g, "\\/")));
    });
  }

  test("unauthenticated user is redirected to login for every role page", async ({ page }) => {
    for (const path of Object.values(ROLE_PAGES)) {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await expect(page).toHaveURL(/\/app\/login/);
    }
  });
});

test.describe("Negative authorization — direct URL access", () => {
  test("teacher cannot access school admin page", async ({ page }) => {
    await mockSession(page, "teacher");
    await mockDashboardData(page);

    // Teacher tries to access /app/school directly — should be rejected
    await page.goto("/app/school", { waitUntil: "domcontentloaded" });
    // Either redirected to their own dashboard or shown an access denied page
    const url = page.url();
    const isRejected = url.includes("/app/login") || url.includes("/dashboard/teacher") || url.includes("denied") || url.includes("403");
    expect(isRejected).toBeTruthy();
  });

  test("teacher cannot access admin dashboard", async ({ page }) => {
    await mockSession(page, "teacher");
    await mockDashboardData(page);
    await page.goto("/app/dashboard/admin", { waitUntil: "domcontentloaded" });
    const url = page.url();
    const isRejected = url.includes("/app/login") || url.includes("/dashboard/teacher") || url.includes("denied") || url.includes("403");
    expect(isRejected).toBeTruthy();
  });

  test("HOD cannot access school admin settings", async ({ page }) => {
    await mockSession(page, "hod");
    await mockDashboardData(page);
    await page.goto("/app/school", { waitUntil: "domcontentloaded" });
    const url = page.url();
    const isRejected = url.includes("/app/login") || url.includes("/hod") || url.includes("denied") || url.includes("403");
    expect(isRejected).toBeTruthy();
  });

  test("school admin cannot access Fidelis global admin settings", async ({ page }) => {
    await mockSession(page, "school_admin");
    await mockDashboardData(page);
    await page.goto("/app/dashboard/admin/schools", { waitUntil: "domcontentloaded" });
    const url = page.url();
    const isRejected = url.includes("/app/login") || url.includes("/app/school") || url.includes("denied") || url.includes("403");
    expect(isRejected).toBeTruthy();
  });
});

test.describe("API authorization", () => {
  test("protected APIs reject unauthenticated calls", async ({ request }) => {
    const protectedApis = [
      "/api/admin/schools",
      "/api/school/overview",
      "/api/school/teachers",
      "/api/hod/department",
      "/api/workshops",
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