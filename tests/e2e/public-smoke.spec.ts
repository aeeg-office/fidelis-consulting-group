import { expect, test } from "@playwright/test";

test("public home page renders core content and calls to action", async ({ page }) => {
  const pageErrors: Error[] = [];
  page.on("pageerror", (error) => pageErrors.push(error));

  await page.goto("/", { waitUntil: "networkidle" });

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: /supporting schools.*developing people.*improving learning/i,
    }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Explore Our Services" })).toHaveAttribute(
    "href",
    "/services",
  );
  await expect(page.getByRole("link", { name: "View AI Platform" })).toHaveAttribute(
    "href",
    "/ai-platform",
  );
  expect(pageErrors).toEqual([]);
});
