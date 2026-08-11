export const siteUrl = new URL("https://fidelisconsultingroup.com");

export const publicSitePaths = [
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
  "/ar",
] as const;

export function absoluteUrl(path: string) {
  return new URL(path, siteUrl).toString();
}
