import { expect, test } from "@playwright/test";

/**
 * Registration flow — E2E browser tests
 *
 * These tests mock the API layer to avoid creating real accounts
 * during CI runs.  The production nightly audit (fcg-nightly-qa.sh)
 * exercises the real registration endpoint against the live app.
 */

test.describe("Registration", () => {
  test("teacher registration form shows required fields and submits", async ({ page }) => {
    // Intercept the registration API call
    let payload: unknown;
    await page.route("**/api/auth/register", async (route) => {
      payload = route.request().postDataJSON();
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          id: "user-test-001",
          name: "Sarah Thompson",
          email: "sarah.nightly-qa@example.test",
          role: "independent_teacher",
          message: "Registration successful. Please verify your email.",
        }),
      });
    });

    await page.goto("/app/register", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/register|create account/i);

    // Fill form
    await page.getByLabel(/full name/i).fill("Sarah Thompson");
    await page.getByLabel(/email/i).fill("sarah.nightly-qa@example.test");
    await page.getByLabel(/password/i).fill("SecurePass123!");
    await page.getByLabel(/confirm password/i).fill("SecurePass123!");

    // Select role
    await page.getByLabel(/i am an?/i).selectOption("independent_teacher");

    // Accept terms
    await page.getByLabel(/terms.*conditions/i).check();

    // Submit
    await page.getByRole("button", { name: /register|create|sign up/i }).click();

    // Verify success message
    await expect(page.getByText(/registration successful|verify your email/i)).toBeVisible();
    expect(payload).toMatchObject({
      name: "Sarah Thompson",
      email: expect.stringContaining("nightly-qa"),
      role: "independent_teacher",
    });
  });

  test("registration rejects mismatched passwords", async ({ page }) => {
    await page.goto("/app/register", { waitUntil: "domcontentloaded" });
    await page.getByLabel(/full name/i).fill("Test User");
    await page.getByLabel(/email/i).fill("test@example.test");
    await page.getByLabel(/password/i).fill("Password123!");
    await page.getByLabel(/confirm password/i).fill("DifferentPass456!");
    await page.getByRole("button", { name: /register|create|sign up/i }).click();

    await expect(page.getByText(/passwords do not match|must match/i)).toBeVisible();
  });

  test("registration rejects duplicate email", async ({ page }) => {
    await page.route("**/api/auth/register", async (route) => {
      await route.fulfill({
        status: 409,
        contentType: "application/json",
        body: JSON.stringify({ error: "An account with this email already exists" }),
      });
    });

    await page.goto("/app/register", { waitUntil: "domcontentloaded" });
    await page.getByLabel(/full name/i).fill("Existing User");
    await page.getByLabel(/email/i).fill("existing@example.test");
    await page.getByLabel(/password/i).fill("Password123!");
    await page.getByLabel(/confirm password/i).fill("Password123!");
    await page.getByLabel(/i am an?/i).selectOption("independent_teacher");
    await page.getByLabel(/terms.*conditions/i).check();
    await page.getByRole("button", { name: /register|create|sign up/i }).click();

    await expect(page.getByText(/already exists/i)).toBeVisible();
  });
});

test.describe("Login", () => {
  test("login form accepts valid credentials", async ({ page }) => {
    // Mock successful login
    await page.route("**/api/auth/callback/credentials", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ url: "/app/dashboard/teacher" }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto("/app/login", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/sign in|login/i);

    await page.getByLabel(/email/i).fill("teacher@example.test");
    await page.getByLabel(/password/i).fill("ValidPass123!");
    await page.getByRole("button", { name: /sign in|login/i }).click();

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/app\/dashboard/);
  });

  test("login shows error for invalid password", async ({ page }) => {
    await page.route("**/api/auth/callback/credentials", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 401,
          contentType: "application/json",
          body: JSON.stringify({ error: "Invalid email or password" }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto("/app/login", { waitUntil: "domcontentloaded" });
    await page.getByLabel(/email/i).fill("teacher@example.test");
    await page.getByLabel(/password/i).fill("WrongPass!");
    await page.getByRole("button", { name: /sign in|login/i }).click();

    await expect(page.getByText(/invalid email or password/i)).toBeVisible();
  });

  test("password reset link is visible and functional", async ({ page }) => {
    await page.goto("/app/login", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("link", { name: /forgot password|reset/i })).toBeVisible();
    await page.getByRole("link", { name: /forgot password|reset/i }).click();
    await expect(page).toHaveURL(/\/app\/forgot-password/);
  });
});

test.describe("Logout", () => {
  test("authenticated user can log out and is redirected to login", async ({ page }) => {
    // Mock auth session
    await page.route("**/api/auth/session", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          user: { id: "1", name: "Test Teacher", email: "teacher@example.test", role: "teacher" },
          expires: "2099-12-31T00:00:00.000Z",
        }),
      });
    });

    // Visit a protected page
    await page.goto("/app/dashboard/teacher", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/dashboard/i)).toBeVisible();

    // Find and click logout
    const logoutButton = page.getByRole("button", { name: /sign out|log out|logout/i });
    if (await logoutButton.isVisible()) {
      // Mock the logout callback
      await page.route("**/api/auth/signout", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ url: "/app/login" }),
        });
      });
      await logoutButton.click();
      await expect(page).toHaveURL(/\/app\/login/);
    }
  });
});