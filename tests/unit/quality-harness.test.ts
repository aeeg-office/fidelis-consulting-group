import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

type PackageManifest = { scripts?: Record<string, string> };

const packageManifest = JSON.parse(
  readFileSync(resolve(process.cwd(), "package.json"), "utf8"),
) as PackageManifest;

describe("quality harness", () => {
  it("exposes the required validation scripts", () => {
    expect(packageManifest.scripts).toMatchObject({
      lint: expect.any(String),
      typecheck: expect.any(String),
      build: expect.any(String),
      "test:unit": expect.any(String),
      "test:e2e": expect.any(String),
      "prisma:generate": expect.any(String),
      "prisma:validate": expect.any(String),
    });
  });

  it("runs browser smoke tests against a fresh production build", () => {
    expect(packageManifest.scripts?.["test:e2e"]).toContain("npm run build");
    expect(packageManifest.scripts?.["test:e2e"]).toContain("npm run start");
  });
});
