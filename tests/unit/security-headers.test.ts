import { describe, expect, it } from "vitest";
import { securityHeaders } from "../../src/lib/security-headers";

describe("security headers policy", () => {
  const headers = Object.fromEntries(securityHeaders().map((h) => [h.key, h.value]));

  it("includes the core protective headers", () => {
    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
    expect(headers["X-Frame-Options"]).toBe("DENY");
    expect(headers["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
  });

  it("sets a CSP that blocks framing and forbids external script origins", () => {
    expect(headers["Content-Security-Policy"]).toBeDefined();
    const csp = headers["Content-Security-Policy"];
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("form-action 'self'");
    expect(csp).toContain("base-uri 'self'");
  });
});
