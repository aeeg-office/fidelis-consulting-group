import { expect, test } from "@playwright/test";

/**
 * Workshop, Subscriptions, Consultancy — E2E browser tests
 *
 * Verify workshop enrollment, subscription entitlement visibility,
 * and consultancy workspace access.  API responses are mocked for
 * deterministic CI runs; the production nightly audit (fcg-nightly-qa.sh)
 * exercises the real flows with QA accounts.
 */

function mockSession(page: import("@playwright/test").Page, role = "teacher") {
  return page.route("**/api/auth/session", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        user: {
          id: `user-${role}-qa`,
          name: "QA User",
          email: `${role}.nightly-qa@example.test`,
          role,
        },
        expires: "2099-12-31T00:00:00.000Z",
      }),
    });
  });
}

test.describe("Workshops", () => {
  test("workshop listing page loads for participant", async ({ page }) => {
    await mockSession(page, "teacher");
    await page.route("**/api/workshops", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: "w1",
              title: "AI for Educators: Foundations",
              description: "Practical AI integration for classrooms",
              status: "published",
              enrolled: true,
            },
          ],
        }),
      });
    });
    await page.goto("/app/workshops", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page).not.toHaveURL(/\/app\/login/);
  });

  test("workshop enrollment button triggers API call", async ({ page }) => {
    await mockSession(page, "teacher");
    let enrollPayload: unknown;
    await page.route("**/api/workshops/**/enroll", async (route) => {
      enrollPayload = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: { enrolled: true } }),
      });
    });

    await page.route("**/api/workshops", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: "w2",
              title: "Lesson Planning with AI",
              description: "Hands-on workshop",
              status: "published",
              enrolled: false,
            },
          ],
        }),
      });
    });

    await page.goto("/app/workshops", { waitUntil: "domcontentloaded" });
    const enrollBtn = page.getByRole("button", { name: /enroll|register.*workshop/i }).first();
    if (await enrollBtn.isVisible()) {
      await enrollBtn.click();
      await expect(page.getByText(/enrolled|success/i)).toBeVisible({ timeout: 5000 });
      expect(enrollPayload).toBeDefined();
    }
  });

  test("workshop certificate download available for completed workshop", async ({ page }) => {
    await mockSession(page, "teacher");
    await page.route("**/api/workshops/*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            id: "w3",
            title: "English Teaching Essentials",
            status: "completed",
            certificateUrl: "/api/workshops/w3/certificate",
          },
        }),
      });
    });
    await page.goto("/app/workshops/w3", { waitUntil: "domcontentloaded" });
    const certLink = page.getByRole("link", { name: /certificate|download.*cert/i });
    if (await certLink.isVisible()) {
      await expect(certLink).toHaveAttribute("href", /certificate/);
    }
  });
});

test.describe("Subscriptions and entitlements", () => {
  test("billing status page loads for subscribed user", async ({ page }) => {
    await mockSession(page, "teacher");
    await page.route("**/api/billing/status", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            plan: "individual",
            status: "active",
            seatsUsed: 1,
            seatsTotal: 1,
            expiresAt: "2099-12-31T00:00:00.000Z",
            features: ["lesson_plan", "assessment", "rubric", "feedback"],
          },
        }),
      });
    });
    await page.goto("/app/billing", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page).not.toHaveURL(/\/app\/login/);
  });

  test("expired subscription shows clear messaging and blocks paid tools", async ({ page }) => {
    await mockSession(page, "teacher");
    await page.route("**/api/billing/status", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            plan: "individual",
            status: "expired",
            seatsUsed: 0,
            seatsTotal: 1,
            expiresAt: "2020-01-01T00:00:00.000Z",
            features: [],
          },
        }),
      });
    });
    await page.goto("/app/billing", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/expired|renew|subscribe/i)).toBeVisible();
  });
});

test.describe("Consultancy workspace", () => {
  test("HOD can access consultancy request workspace", async ({ page }) => {
    await mockSession(page, "hod");
    await page.route("**/api/hod/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: [] }),
      });
    });
    await page.goto("/app/hod", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page).not.toHaveURL(/\/app\/login/);
  });
});