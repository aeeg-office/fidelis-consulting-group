import { describe, expect, it } from "vitest";
import { hasUsageEntitlement, resolveEntitlement, type EntitlementInput } from "../../src/lib/entitlements";

const DAY = 24 * 60 * 60 * 1000;
const now = Date.now();

function sub(overrides: Partial<EntitlementInput> = {}): EntitlementInput {
  return {
    status: "active",
    currentPeriodEnd: new Date(now + 30 * DAY).toISOString(),
    trialEndsAt: null,
    cancelAtPeriodEnd: false,
    ...overrides,
  };
}

describe("entitlement resolver", () => {
  it("grants an active subscription until the period ends", () => {
    expect(resolveEntitlement(sub())).toEqual({ granted: true, reason: "active" });
  });

  it("expires an active subscription after the period ends", () => {
    const s = sub({ currentPeriodEnd: new Date(now - 1).toISOString() });
    expect(resolveEntitlement(s)).toEqual({ granted: false, reason: "expired" });
  });

  it("grants a trial until trialEndsAt, then expires it", () => {
    const active = sub({ status: "trialing", trialEndsAt: new Date(now + 5 * DAY).toISOString() });
    expect(resolveEntitlement(active)).toEqual({ granted: true, reason: "trial" });
    const ended = sub({ status: "trialing", trialEndsAt: new Date(now - 1).toISOString() });
    expect(resolveEntitlement(ended)).toEqual({ granted: false, reason: "expired" });
  });

  it("denies past_due, unpaid and hard-canceled states", () => {
    expect(resolveEntitlement(sub({ status: "past_due" })).granted).toBe(false);
    expect(resolveEntitlement(sub({ status: "unpaid" })).granted).toBe(false);
    expect(resolveEntitlement(sub({ status: "canceled", cancelAtPeriodEnd: false })).granted).toBe(false);
  });

  it("keeps a cancel-at-period-end subscriber granted until the period ends", () => {
    const s = sub({ status: "canceled", cancelAtPeriodEnd: true, currentPeriodEnd: new Date(now + 3 * DAY).toISOString() });
    expect(resolveEntitlement(s)).toEqual({ granted: true, reason: "active" });
  });

  it("an audited admin override grants access even when expired", () => {
    const s = sub({ status: "unpaid", adminOverride: true });
    expect(resolveEntitlement(s)).toEqual({ granted: true, reason: "override" });
  });

  it("handles missing dates safely (never throws)", () => {
    expect(resolveEntitlement(sub({ currentPeriodEnd: null })).granted).toBe(true);
    expect(resolveEntitlement(sub({ status: "expired" })).granted).toBe(false);
    expect(hasUsageEntitlement(sub())).toBe(true);
  });
});
