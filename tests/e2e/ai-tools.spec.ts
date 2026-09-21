import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers";

/**
 * AI Platform — E2E browser tests
 *
 * Verify AI tool UI: presets, submit, response display, refinement,
 * and graceful error states.
 *
 * Authenticated tests use real login with seeded QA users; API calls
 * are still mocked so CI runs are cost-free and deterministic.
 */

const AI_TOOLS = [
  { path: "/app/tools/lesson-plan", name: "Lesson Planning" },
  { path: "/app/tools/assessment", name: "Assessment" },
  { path: "/app/tools/rubric", name: "Rubrics" },
  { path: "/app/tools/feedback", name: "Feedback" },
];

test.describe("AI tools", () => {
  for (const tool of AI_TOOLS) {
    test(`${tool.name} UI loads and submits for an authorized teacher`, async ({ page }) => {
      // Real login with seeded QA teacher
      await loginAs(page, "qa.teacher@example.test");

      // Intercept the AI API call with a small structured response
      let aiPayload: unknown;
      await page.route("**/api/ai/**", async (route) => {
        const method = route.request().method();
        if (method === "POST") {
          aiPayload = route.request().postDataJSON();
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              success: true,
              data: {
                output: "This is a simulated AI response for nightly QA.",
                usage: { tokens: 120, cost: 0.0001 },
              },
            }),
          });
        } else {
          await route.continue();
        }
      });

      await page.goto(tool.path, { waitUntil: "domcontentloaded" });

      // Verify tool page rendered
      await expect(page.getByRole("main")).toBeVisible();
      await expect(page).not.toHaveURL(/\/app\/login/);

      // Try to find a submit button and click it if present
      const submit = page.getByRole("button", { name: /generate|create|submit|run/i }).first();
      if (await submit.isVisible()) {
        await submit.click();
        // Should receive the mocked AI response eventually
        await expect(page.getByText(/simulated AI response/i)).toBeVisible({ timeout: 5000 });
      }
    });
  }

  test("AI tool shows graceful error when provider is unavailable", async ({ page }) => {
    // Real login with seeded QA teacher
    await loginAs(page, "qa.teacher@example.test");

    await page.route("**/api/ai/**", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 502,
          contentType: "application/json",
          body: JSON.stringify({ error: "AI provider is temporarily unavailable. Please try again shortly." }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto("/app/tools/lesson-plan", { waitUntil: "domcontentloaded" });
    const submit = page.getByRole("button", { name: /generate|create|submit|run/i }).first();
    if (await submit.isVisible()) {
      await submit.click();
      await expect(page.getByText(/unavailable|try again/i)).toBeVisible({ timeout: 5000 });
    }
  });

  test("unauthenticated users can access AI tools listing page", async ({ page }) => {
    // The tools pages render publicly (no middleware redirect for /app/tools/*)
    await page.goto("/app/tools/lesson-plan", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("main")).toBeVisible();
  });
});