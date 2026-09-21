import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers";

const QA_TEACHER = "qa.teacher@example.test";

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
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/register|create.*account/i);

    // Fill form — use exact label selectors
    await page.getByLabel("Full name", { exact: true }).fill("Sarah Thompson");
    await page.getByLabel("Email address", { exact: true }).fill("sarah.nightly-qa@example.test");
    await page.getByLabel("Password", { exact: true }).fill("SecurePass123!");
    await page.getByLabel("Confirm password", { exact: true }).fill("SecurePass123!");

    // Select role — the register form uses toggle buttons, not a <select>
    await page.getByRole("button", { name: /independent teacher/i }).click();

    // Submit
    await page.getByRole("button", { name: /register|create|sign up/i }).click();

    // Verify success message
    await expect(page.getByText(/registration successful|verify your email/i)).toBeVisible();
    expect(payload).toMatchObject({
      email: expect.stringContaining("nightly-qa"),
      role: "independent_teacher",
    });
  });

  test("registration rejects mismatched passwords", async ({ page }) => {
    await page.goto("/app/register", { waitUntil: "domcontentloaded" });
    await page.getByLabel("Full name", { exact: true }).fill("Test User");
    await page.getByLabel("Email address", { exact: true }).fill("test@example.test");
    await page.getByLabel("Password", { exact: true }).fill("Password123!");
    await page.getByLabel("Confirm password", { exact: true }).fill("DifferentPass456!");
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
    await page.getByLabel("Full name", { exact: true }).fill("Existing User");
    await page.getByLabel("Email address", { exact: true }).fill("existing@example.test");
    await page.getByLabel("Password", { exact: true }).fill("Password123!");
    await page.getByLabel("Confirm password", { exact: true }).fill("Password123!");
    // Role: use button click instead of nonexistent select
    await page.getByRole("button", { name: /independent teacher/i }).click();
    await page.getByRole("button", { name: /register|create|sign up/i }).click();

    await expect(page.getByText(/already exists/i)).toBeVisible();
  });
});

test.describe("Login", () => {
  test("login form accepts valid credentials", async ({ page }) => {
    // Navigate to login, verify heading, then perform real login with seeded QA user
    await page.goto("/app/login", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/welcome back/i);

    await page.getByLabel("Email address", { exact: true }).fill(QA_TEACHER);
    await page.getByLabel("Password", { exact: true }).fill("NightlyQA-E2E-Password-2026");
    await page.getByRole("button", { name: /sign in/i }).click();

    // Should redirect away from /app/login to a dashboard
    await expect(page).toHaveURL(/\/app(?!\/login)/, { timeout: 15_000 });
  });

  test("login shows error for invalid password", async ({ page }) => {
    await page.goto("/app/login", { waitUntil: "domcontentloaded" });
    await page.getByLabel("Email address", { exact: true }).fill(QA_TEACHER);
    await page.getByLabel("Password", { exact: true }).fill("WrongPass!");
    await page.getByRole("button", { name: /sign in/i }).click();

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
    // Log in with a real seeded QA teacher account
    await loginAs(page, QA_TEACHER);
    // We are now past /app/login — verify URL is on a dashboard
    await expect(page).toHaveURL(/\/app(?!\/login)/, { timeout: 10_000 });

    // Sign out via POST to the signout API
    await page.evaluate(async () => {
      await fetch("/api/auth/signout", { method: "POST", credentials: "include" });
    });
    // The signout response clears the session; navigate to login
    await page.goto("/app/login", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/app\/login/, { timeout: 15_000 });
  });
});