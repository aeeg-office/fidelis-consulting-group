/**
 * Single server-side entitlement resolver. UI visibility is never the gate;
 * every privileged/tool action resolves its own entitlement from persisted
 * subscription state. This module is pure (no I/O) so lifecycle rules are
 * unit-testable and can never be overridden by client payloads.
 */

export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "expired";

export interface EntitlementInput {
  status: SubscriptionStatus;
  currentPeriodEnd: Date | string | null;
  trialEndsAt: Date | string | null;
  cancelAtPeriodEnd: boolean;
  /** Admin override (audited); when true, grants access regardless of state. */
  adminOverride?: boolean;
}

export interface ResolvedEntitlement {
  /** Overall ability to use the product now. */
  granted: boolean;
  /** Human explanation of the current state for UX. */
  reason: "active" | "trial" | "expired" | "canceled" | "past_due" | "unpaid" | "override";
}

function toDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Resolve whether an entitlement is currently usable.
 *
 * Rules:
 * - An audited admin override always grants (the override itself is the record).
 * - `active` grants until `currentPeriodEnd` passes; after expiry it is "expired".
 * - `trialing` grants until `trialEndsAt` passes.
 * - `past_due` is denied (with a short grace note) — the operator must intervene.
 * - `canceled`/`unpaid`/`expired` are denied.
 */
export function resolveEntitlement(input: EntitlementInput): ResolvedEntitlement {
  const now = Date.now();

  if (input.adminOverride) {
    return { granted: true, reason: "override" };
  }

  if (input.status === "active") {
    const end = toDate(input.currentPeriodEnd);
    if (end && end.getTime() < now) {
      return { granted: false, reason: "expired" };
    }
    return { granted: true, reason: "active" };
  }

  if (input.status === "trialing") {
    const trialEnd = toDate(input.trialEndsAt);
    if (trialEnd && trialEnd.getTime() < now) {
      return { granted: false, reason: "expired" };
    }
    return { granted: true, reason: "trial" };
  }

  if (input.status === "past_due") {
    return { granted: false, reason: "past_due" };
  }

  if (input.status === "canceled") {
    // Cancel-at-period-end still grants until the period ends.
    const end = toDate(input.currentPeriodEnd);
    if (input.cancelAtPeriodEnd && end && end.getTime() >= now) {
      return { granted: true, reason: "active" };
    }
    return { granted: false, reason: "canceled" };
  }

  if (input.status === "unpaid") {
    return { granted: false, reason: "unpaid" };
  }

  return { granted: false, reason: "expired" };
}

/** Convenience: does the user currently hold usable access? */
export function hasUsageEntitlement(input: EntitlementInput): boolean {
  return resolveEntitlement(input).granted;
}
