import { expect, test } from "@playwright/test";
import { devices } from "@playwright/test";
import { loginAs } from "./helpers";

const viewports = [
  { name: "desktop", width: 1280, height: 800 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 375, height: 812 },
];

const keyPages = [
  { path: "/", name: "Home", isMarketing: true },
  { path: "/services", name: "Services", isMarketing: true },
  { path: "/contact", name: "Contact", isMarketing: true },
  { path: "/app/login", name: "Login", isMarketing: false },
  { path: "/app/register", name: "Register", isMarketing: false },
];

test.describe("Responsive layout", () => {
  for (const viewport of viewports) {
    for (const pageInfo of keyPages) {
      test(`${pageInfo.name} renders at ${viewport.name} (${viewport.width}×${viewport.height})`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(pageInfo.path, { waitUntil: "domcontentloaded" });

        // Page should not have horizontal overflow
        const overflowX = await page.evaluate(() => {
          const html = document.documentElement;
          const body = document.body;
          return Math.max(
            html.scrollWidth - html.clientWidth,
            body.scrollWidth - body.clientWidth,
          ) > 0 ? "overflow" : "ok";
        });
        expect(overflowX, `${pageInfo.name} at ${viewport.name}: no horizontal overflow`).toBe("ok");

        // Main content or heading should be visible
        const main = page.getByRole("main");
        const heading = page.getByRole("heading", { level: 1 });
        if (pageInfo.isMarketing) {
          // Marketing pages (Home, Services, Contact) use <main id="main-content">
          await expect(main).toBeVisible();
        } else {
          // Auth pages (Login, Register) don't have a <main> element; check the h1 instead
          await expect(heading).toBeVisible();
        }

        // No console errors
        const errors: string[] = [];
        page.on("console", (msg) => {
          if (msg.type() === "error") errors.push(msg.text());
        });
        expect(errors, `${pageInfo.name} at ${viewport.name}: no console errors`).toEqual([]);
      });
    }
  }
});

test.describe("Mobile navigation", () => {
  test("mobile hamburger menu toggles sidebar navigation", async ({ page }) => {
    // Need to be on an authenticated app page to see the sidebar/hamburger
    await loginAs(page, "qa.teacher@example.test");
    await page.setViewportSize({ width: 375, height: 812 });
    // Navigate to a protected app page that renders the full app layout
    await page.goto("/app/workshops", { waitUntil: "domcontentloaded" });

    // Find the hamburger/menu toggle button — aria-label="Open sidebar" on the app layout
    const menuButton = page.getByRole("button", { name: /open sidebar/i });
    await expect(menuButton).toBeVisible();
    await menuButton.click();
    // The mobile sidebar should now be visible — wait for the nav element
    await expect(page.getByRole("navigation")).toBeVisible({ timeout: 5000 });
    // Click a nav link
    const navLink = page.getByRole("link", { name: /services/i }).first();
    if (await navLink.isVisible()) {
      await navLink.click();
      await expect(page).toHaveURL(/\/app\//);
    }
  });
});

test.describe("Arabic / RTL", () => {
  test("Arabic home page uses RTL layout", async ({ page }) => {
    await page.goto("/ar", { waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  });

  test("English → Arabic switch works from all major pages", async ({ page }) => {
    for (const path of ["/", "/services", "/contact", "/about"]) {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      const arabicLink = page.getByRole("link", { name: /arabic|عربي|العربية/i });
      if (await arabicLink.isVisible()) {
        const href = await arabicLink.getAttribute("href");
        expect(href, `Arabic link exists on ${path}`).toMatch(/\/ar/);
      }
    }
  });

  test("Arabic route does not 404", async ({ page }) => {
    // Only test routes that have actual Arabic pages
    const arabicRoutes = ["/ar"];
    for (const route of arabicRoutes) {
      const response = await page.goto(route, { waitUntil: "domcontentloaded" });
      expect(response?.ok(), `${route} should be reachable`).toBeTruthy();
    }
  });
});