import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const publicRoutes = [
  "/",
  "/about",
  "/services",
  "/services/english-consultancy",
  "/services/professional-development",
  "/services/ai-training",
  "/ai-platform",
  "/professional-development",
  "/professional-development/english-teaching",
  "/professional-development/ai-for-educators",
  "/resources",
  "/resources/blog",
  "/resources/downloads",
  "/resources/case-studies",
  "/insights",
  "/contact",
  "/privacy",
  "/terms",
  "/cookies",
];

test("public routes provide a meaningful document title and one main landmark", async ({ page }) => {
  for (const route of publicRoutes) {
    const response = await page.goto(route, { waitUntil: "domcontentloaded" });
    expect(response?.ok(), `${route} should return a successful response`).toBeTruthy();
    await expect(page).not.toHaveTitle("");
    await expect(page.getByRole("main")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  }
});

test("robots and sitemap identify the canonical production host", async ({ request }) => {
  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBeTruthy();
  expect(await robots.text()).toContain("https://fidelisconsultingroup.com/sitemap.xml");

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBeTruthy();
  expect(await sitemap.text()).toContain("https://fidelisconsultingroup.com/contact");
  expect(await sitemap.text()).not.toContain("/app/dashboard");
});

test("Arabic entry point uses an Arabic RTL document and returns to English", async ({ page }) => {
  await page.goto("/ar", { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.getByRole("link", { name: "English", exact: true })).toHaveAttribute("href", "/");
});

test("public home has no serious automated accessibility violations", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("all English public routes have no serious automated accessibility violations", async ({ page }) => {
  for (const route of publicRoutes) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    expect(results.violations, `${route} accessibility violations`).toEqual([]);
  }
});

test("contact form sends a valid enquiry and announces an accessible confirmation", async ({ page }) => {
  let payload: unknown;
  await page.route("**/api/contact", async (route) => {
    payload = route.request().postDataJSON();
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({ id: "inquiry-1", message: "Thank you. Your enquiry has been received." }),
    });
  });

  await page.goto("/contact", { waitUntil: "domcontentloaded" });
  await page.getByLabel("Full name").fill("Jordan Smith");
  await page.getByLabel("Email").fill("jordan@example.test");
  await page.getByLabel("School (optional)").fill("Example International School");
  await page.getByLabel("How can we help?").selectOption("consultancy");
  await page.getByLabel("Message").fill("We would like to discuss an English department review.");
  await page.getByRole("button", { name: "Send message" }).click();

  await expect(page.getByRole("status")).toHaveText("Thank you. Your enquiry has been received.");
  expect(payload).toEqual({
    name: "Jordan Smith",
    email: "jordan@example.test",
    school: "Example International School",
    subject: "consultancy",
    message: "We would like to discuss an English department review.",
  });
});

test("contact form exposes delivery failures as an assertive error", async ({ page }) => {
  await page.route("**/api/contact", async (route) => {
    await route.fulfill({
      status: 400,
      contentType: "application/json",
      body: JSON.stringify({ error: "Please provide your name, a valid email address, and a message of at least 10 characters." }),
    });
  });

  await page.goto("/contact", { waitUntil: "domcontentloaded" });
  await page.getByLabel("Full name").fill("J");
  await page.getByLabel("Email").fill("not-an-email");
  await page.getByLabel("How can we help?").selectOption("general");
  await page.getByLabel("Message").fill("Too short");
  await page.getByRole("button", { name: "Send message" }).click();

  await expect(page.getByRole("alert").filter({ hasText: "Please provide your name" })).toHaveText("Please provide your name, a valid email address, and a message of at least 10 characters.");
});
