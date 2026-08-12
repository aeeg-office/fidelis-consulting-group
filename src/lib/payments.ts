/**
 * Payment provider adapter.
 *
 * The billing provider is still to be selected, so this module exposes a stable
 * `PaymentProvider` interface and ships a deterministic `MockProvider`. Routes
 * call only the interface; a real Stripe/other adapter can be dropped in later
 * without touching entitlement logic. The provider is chosen from
 * PAYMENT_PROVIDER (default "mock" for dev/test).
 */

export interface SubscriptionPatch {
  status?: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  trialEndsAt?: Date;
  cancelAtPeriodEnd?: boolean;
  stripeSubscriptionId?: string | null;
  stripeCustomerId?: string | null;
}

export type BillingEvent =
  | { type: "checkout.completed"; subscriptionId: string; customerId: string; planCode: string; periodStart: string; periodEnd: string; trialEndsAt?: string }
  | { type: "invoice.payment_succeeded"; subscriptionId: string; periodEnd: string }
  | { type: "invoice.payment_failed"; subscriptionId: string }
  | { type: "customer.subscription.canceled"; subscriptionId: string; cancelAtPeriodEnd: boolean }
  | { type: "customer.subscription.trial_will_end"; subscriptionId: string };

export interface CheckoutRequest {
  userId?: string;
  schoolId?: string;
  planId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutResponse {
  checkoutUrl: string;
  sessionId: string;
}

export interface PaymentProvider {
  readonly name: string;
  createCheckout(req: CheckoutRequest): Promise<CheckoutResponse>;
  /** Map a raw provider event to a subscription patch, or null if unhandled. */
  parseEvent(raw: unknown): BillingEvent | null;
  /** Translate a billing event into the persisted subscription field changes. */
  applyEvent(event: BillingEvent): SubscriptionPatch | null;
}

/**
 * Deterministic mock provider for development and test. It never calls any
 * external service and produces explicit, stable state transitions so the full
 * entitlement lifecycle can be exercised end-to-end without a live provider.
 */
export const mockProvider: PaymentProvider = {
  name: "mock",

  async createCheckout(req) {
    const sessionId = `mock_cs_${Math.random().toString(36).slice(2, 12)}`;
    const route = new URL(req.successUrl);
    route.searchParams.set("mock_session", sessionId);
    return { checkoutUrl: route.toString(), sessionId };
  },

  parseEvent(raw: unknown): BillingEvent | null {
    if (typeof raw !== "object" || raw === null) return null;
    const obj = raw as Record<string, unknown>;
    const type = typeof obj.type === "string" ? obj.type : null;
    if (!type) return null;
    const sid = typeof obj.subscriptionId === "string" ? obj.subscriptionId : "mock_sub";
    switch (type) {
      case "checkout.completed":
        return {
          type,
          subscriptionId: sid,
          customerId: typeof obj.customerId === "string" ? obj.customerId : "mock_cus",
          planCode: typeof obj.planCode === "string" ? obj.planCode : "",
          periodStart: typeof obj.periodStart === "string" ? obj.periodStart : new Date().toISOString(),
          periodEnd: typeof obj.periodEnd === "string" ? obj.periodEnd : new Date().toISOString(),
          trialEndsAt: typeof obj.trialEndsAt === "string" ? obj.trialEndsAt : undefined,
        };
      case "invoice.payment_succeeded":
        return { type, subscriptionId: sid, periodEnd: typeof obj.periodEnd === "string" ? obj.periodEnd : new Date().toISOString() };
      case "invoice.payment_failed":
        return { type, subscriptionId: sid };
      case "customer.subscription.canceled":
        return { type, subscriptionId: sid, cancelAtPeriodEnd: obj.cancelAtPeriodEnd !== false };
      case "customer.subscription.trial_will_end":
        return { type, subscriptionId: sid };
      default:
        return null;
    }
  },

  applyEvent(event: BillingEvent): SubscriptionPatch | null {
    switch (event.type) {
      case "checkout.completed":
        if (!event.planCode) return null;
        return {
          status: event.trialEndsAt ? "trialing" : "active",
          currentPeriodStart: new Date(event.periodStart),
          currentPeriodEnd: new Date(event.periodEnd),
          trialEndsAt: event.trialEndsAt ? new Date(event.trialEndsAt) : undefined,
          stripeSubscriptionId: event.subscriptionId,
          stripeCustomerId: event.customerId,
        };
      case "invoice.payment_succeeded":
        return { status: "active", currentPeriodEnd: new Date(event.periodEnd), cancelAtPeriodEnd: false };
      case "invoice.payment_failed":
        return { status: "past_due" };
      case "customer.subscription.canceled":
        return { status: event.cancelAtPeriodEnd ? "active" : "canceled", cancelAtPeriodEnd: event.cancelAtPeriodEnd };
      default:
        return null;
    }
  },
};

export function getPaymentProvider(): PaymentProvider {
  // Only the mock provider exists until a billing provider is selected.
  // A future StripeProvider can be registered here behind PAYMENT_PROVIDER=stripe.
  return mockProvider;
}

/** Signature-style guard: mock events are accepted only in mock mode. */
export function isMockBillingMode(): boolean {
  const mode = process.env.PAYMENT_PROVIDER ?? "mock";
  return mode === "mock" || mode === "test" || mode === "dev";
}
