import { type Page, expect } from "@playwright/test";

/**
 * Log in to the app with credentials from the seed QA users.
 * Navigates to /app/login, fills email + password, submits,
 * and waits for redirect away from the login page.
 */
export async function loginAs(
  page: Page,
  email: string,
  password: string = "NightlyQA-E2E-Password-2026",
): Promise<void> {
  await page.goto("/app/login", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/welcome back/i);
  await page.getByLabel("Email address", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();
  // Wait for redirect away from login page to a dashboard
  await page.waitForURL(/\/app(?!\/login)/, { timeout: 15_000 });
}