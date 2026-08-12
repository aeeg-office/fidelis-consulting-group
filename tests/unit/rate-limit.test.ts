import { afterEach, describe, expect, it } from "vitest";
import { _resetRateLimiterForTests, rateLimit } from "../../src/lib/rate-limit";

describe("rate limiter", () => {
  afterEach(() => _resetRateLimiterForTests());

  it("allows requests up to the limit", () => {
    for (let i = 0; i < 5; i++) {
      const r = rateLimit("login:u", 5);
      expect(r.allowed).toBe(true);
      expect(r.remaining).toBe(5 - i - 1);
    }
  });

  it("blocks once the limit is exceeded and reports retry time", () => {
    for (let i = 0; i < 5; i++) rateLimit("login:u", 5);
    const blocked = rateLimit("login:u", 5);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterSeconds).toBeGreaterThanOrEqual(1);
  });

  it("isolates keys from one another", () => {
    for (let i = 0; i < 5; i++) rateLimit("a", 5);
    expect(rateLimit("a", 5).allowed).toBe(false);
    expect(rateLimit("b", 5).allowed).toBe(true);
  });
});
