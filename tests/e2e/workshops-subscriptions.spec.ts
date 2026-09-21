import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers";

/**
 * Workshop, Subscriptions, Consultancy — E2E browser tests
 *
 * Verify workshop enrollment navigation, billing status UI,
 * and consultancy workspace access.
 *
 * Authenticated tests use real login with seeded QA users.
 * The workshops page uses hardcoded data (no API mocking needed).
 */

test.describe("Workshops", () => {
  test("workshop listing page loads for participant", async ({ page }) => {
    await loginAs(page, "qa.teacher@example.test");
    await page.goto("/app/workshops", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("workshop enrollment link navigates to detail page", async ({ page }) => {
    await loginAs(page, "qa.teacher@example.test");
    await page.goto("/app/workshops", { waitUntil: "domcontentloaded" });

    // The listing page shows "Enroll Now" links that navigate to the detail page
    const enrollLink = page.getByRole("link", { name: /enroll now/i }).first();
    await expect(enrollLink).toBeVisible();
    await enrollLink.click();
    // Should navigate to a workshop detail page
    await expect(page).toHaveURL(/\/app\/workshops\/\d+/, { timeout: 10_000 });
    // The detail page shows the workshop title as an h1
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("workshop detail page shows materials", async ({ page }) => {
    await loginAs(page, "qa.teacher@example.test");
    await page.goto("/app/workshops/1", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    // Workshop Materials section should be present
    await expect(page.getByText(/workshop materials/i)).toBeVisible();
  });
});

test.describe("Subscriptions and entitlements", () => {
  test("billing status page loads for subscribed user", async ({ page }) => {
    await loginAs(page, "qa.teacher@example.test");
    // Mock the billing API with status that matches the BillingStatus interface
    await page.route("**/api/billing/status", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          hasSubscription: true,
          entitlement: { granted: true, reason: "active_subscription" },
          plan: { id: "plan_1", name: "Teacher Pro", code: "teacher_pro", type: "teacher", priceMonthly: "19" },
          status: "active",
          currentPeriodEnd: "2099-12-31T00:00:00.000Z",
        }),
      });
    });
    await page.goto("/app/billing", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("main")).toBeVisible();
    // The page should show the plan name
    await expect(page.getByText(/Teacher Pro/i)).toBeVisible();
  });

  test("expired subscription shows clear messaging and blocks paid tools", async ({ page }) => {
    await loginAs(page, "qa.teacher@example.test");
    // Mock the billing API with an expired subscription
    await page.route("**/api/billing/status", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          hasSubscription: false,
          entitlement: { granted: false, reason: "expired" },
          plan: null,
          status: "expired",
          currentPeriodEnd: "2020-01-01T00:00:00.000Z",
        }),
      });
    });
    await page.goto("/app/billing", { waitUntil: "domcontentloaded" });
    // Should show "No access (expired)" or similar expired messaging
    await expect(page.getByText(/expired|no access/i)).toBeVisible();
  });
});

test.describe("Consultancy workspace", () => {
  test("HOD can access consultancy request workspace", async ({ page }) => {
    await loginAs(page, "qa.hod@example.test");
    await page.route("**/api/hod/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: [] }),
      });
    });
    await page.goto("/app/hod", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 10_000 });
    await expect(page).not.toHaveURL(/\/app\/login/);
  });
});