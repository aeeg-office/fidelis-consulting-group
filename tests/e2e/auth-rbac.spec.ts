import { expect, test } from "@playwright/test";

const PROTECTED = [
  "/app/dashboard/admin",
  "/app/dashboard/teacher",
  "/app/school",
  "/app/hod",
  "/app/dashboard/admin/schools",
];

test("protected role workspaces redirect unauthenticated visitors", async ({ page }) => {
  for (const path of PROTECTED) {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/app\/login$/);
  }
});

test("public registration does not expose school-role selection", async ({ page }) => {
  await page.goto("/app/register", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("Independent Teacher", { exact: true })).toBeVisible();
  await expect(page.getByText("School-linked Teacher", { exact: true })).toHaveCount(0);
  await expect(page.getByText(/School-linked access is provisioned by your school administrator/i)).toBeVisible();
});
