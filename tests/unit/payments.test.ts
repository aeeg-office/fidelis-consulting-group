import { describe, expect, it } from "vitest";
import { getPaymentProvider, isMockBillingMode } from "../../src/lib/payments";

describe("payment adapter (mock provider)", () => {
  const provider = getPaymentProvider();

  it("provides a deterministic mock provider by default", () => {
    expect(provider.name).toBe("mock");
  });

  it("maps an active checkout to an active subscription patch", () => {
    const event = provider.parseEvent({
      type: "checkout.completed",
      subscriptionId: "sub_1",
      customerId: "cus_1",
      planCode: "school_pro",
      periodStart: "2026-08-01T00:00:00.000Z",
      periodEnd: "2026-09-01T00:00:00.000Z",
    });
    expect(event).not.toBeNull();
    const patch = provider.applyEvent(event!);
    expect(patch).toMatchObject({
      status: "active",
      stripeSubscriptionId: "sub_1",
      stripeCustomerId: "cus_1",
    });
    expect(patch?.currentPeriodEnd).toEqual(new Date("2026-09-01T00:00:00.000Z"));
  });

  it("maps a trial checkout to a trialing subscription", () => {
    const event = provider.parseEvent({
      type: "checkout.completed",
      subscriptionId: "sub_t",
      customerId: "cus_t",
      planCode: "teacher_basic",
      periodStart: "2026-08-01T00:00:00.000Z",
      periodEnd: "2026-08-15T00:00:00.000Z",
      trialEndsAt: "2026-08-10T00:00:00.000Z",
    });
    expect(provider.applyEvent(event!)).toMatchObject({ status: "trialing" });
  });

  it("maps payment failure to past_due", () => {
    const e = provider.parseEvent({ type: "invoice.payment_failed", subscriptionId: "sub_1" });
    expect(provider.applyEvent(e!)).toMatchObject({ status: "past_due" });
  });

  it("maps cancel-at-period-end to active (with flag) and hard cancel to canceled", () => {
    const e1 = provider.parseEvent({ type: "customer.subscription.canceled", subscriptionId: "s", cancelAtPeriodEnd: true });
    expect(provider.applyEvent(e1!)).toMatchObject({ status: "active", cancelAtPeriodEnd: true });

    const e2 = provider.parseEvent({ type: "customer.subscription.canceled", subscriptionId: "s", cancelAtPeriodEnd: false });
    expect(provider.applyEvent(e2!)).toMatchObject({ status: "canceled", cancelAtPeriodEnd: false });
  });

  it("rejects malformed or unknown events", () => {
    expect(provider.parseEvent(null)).toBeNull();
    expect(provider.parseEvent({})).toBeNull();
    expect(provider.parseEvent({ type: "some.unknown" })).toBeNull();
  });

  it("is in mock billing mode unless configured otherwise", () => {
    expect(isMockBillingMode()).toBe(true);
  });

  it("produces a checkout URL", async () => {
    const res = await provider.createCheckout({
      userId: "u1",
      planId: "plan_1",
      successUrl: "https://fidelis.test/app/billing/success",
      cancelUrl: "https://fidelis.test/app/billing",
    });
    expect(res.sessionId).toMatch(/^mock_cs_/);
    expect(res.checkoutUrl).toContain("mock_session");
  });
});
