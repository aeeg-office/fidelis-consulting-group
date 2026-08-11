import { expect, test } from "@playwright/test";

test("protected role dashboards redirect unauthenticated visitors", async ({ page }) => {
  await page.goto("/app/dashboard/admin", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/app\/login$/);

  await page.goto("/app/dashboard/teacher", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/app\/login$/);
});

test("public registration does not expose school-role selection", async ({ page }) => {
  await page.goto("/app/register", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("Independent Teacher", { exact: true })).toBeVisible();
  await expect(page.getByText("School-linked Teacher", { exact: true })).toHaveCount(0);
  await expect(page.getByText(/School-linked access is provisioned by your school administrator/i)).toBeVisible();
});
