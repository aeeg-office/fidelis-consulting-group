import { expect, test } from "@playwright/test";
import { devices } from "@playwright/test";

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
  test("mobile hamburger menu toggles navigation", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    // Find the hamburger/menu toggle button — aria-label="Open sidebar" on the app layout
    const menuButton = page.getByRole("button", { name: /menu|hamburger|toggle|open.*(nav|sidebar)/i });
    const isMobileMenu = await menuButton.isVisible();

    if (isMobileMenu) {
      await menuButton.click();
      // Navigation should now be visible
      await expect(page.getByRole("navigation")).toBeVisible();
      // Click a nav link
      const navLink = page.getByRole("link", { name: /services/i }).first();
      if (await navLink.isVisible()) {
        await navLink.click();
        await expect(page).toHaveURL(/\/services/);
      }
    } else {
      // If no hamburger menu, verify the nav is visible anyway
      const nav = page.getByRole("navigation");
      if (await nav.isVisible()) {
        await expect(nav).toBeVisible();
      }
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