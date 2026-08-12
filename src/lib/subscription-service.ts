import type { PrismaClient } from "@prisma/client";
import { getPaymentProvider, type BillingEvent } from "@/lib/payments";
import { recordAudit } from "@/lib/audit";
import { resolveEntitlement, type EntitlementInput } from "@/lib/entitlements";

/**
 * Find the most relevant active subscription for a user (school subscription
 * takes precedence over a personal one when both exist and are granted).
 */
export async function findUserSubscription(prisma: PrismaClient, userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, schoolId: true },
  });
  if (!user) return null;

  const subscriptions = await prisma.subscription.findMany({
    where: { OR: [{ userId }, { schoolId: user.schoolId ?? undefined }] },
    include: { plan: true },
    orderBy: { createdAt: "desc" },
  });
  return subscriptions[0] ?? null;
}

export function toEntitlementInput(
  sub: { status: string; currentPeriodEnd: Date | null; trialEndsAt: Date | null; cancelAtPeriodEnd: boolean },
  adminOverride = false,
): EntitlementInput {
  return {
    status: sub.status as EntitlementInput["status"],
    currentPeriodEnd: sub.currentPeriodEnd,
    trialEndsAt: sub.trialEndsAt,
    cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
    adminOverride,
  };
}

/** Supported Subscriptions cannot be created/mutated except via audited, server-side paths. */
export async function applyProviderEvent(
  prisma: PrismaClient,
  event: BillingEvent,
  actorUserId: string | null,
): Promise<{ applied: boolean; subscriptionId?: string }> {
  const patch = getPaymentProvider().applyEvent(event);
  if (!patch || event.type === "customer.subscription.trial_will_end") {
    return { applied: false };
  }

  const subscription = await prisma.subscription.findFirst({
    where: {
      OR: [{ stripeSubscriptionId: event.subscriptionId }, { id: event.subscriptionId }],
    },
  });

  // In mock mode, a missing subscription with a planCode is auto-created for the
  // actor (dev/test convenience). Production adapters must resolve a real record.
  if (!subscription && event.type === "checkout.completed") {
    if (!actorUserId) return { applied: false };
    const user = actorUserId
      ? await prisma.user.findUnique({ where: { id: actorUserId } })
      : null;
    const plan = await prisma.subscriptionPlan.findUnique({ where: { code: event.planCode } });
    if (!user || !plan) return { applied: false };
    const created = await prisma.subscription.create({
      data: {
        userId: user.id,
        schoolId: user.schoolId ?? null,
        planId: plan.id,
        ...patch,
      },
    });
    await recordAudit(prisma, {
      action: "subscription.created.via_event",
      entityType: "Subscription",
      entityId: created.id,
      actorUserId,
      schoolId: user.schoolId,
      newValues: { ...patch } as Record<string, unknown>,
      metadata: { provider: "mock", event: event.type },
    });
    return { applied: true, subscriptionId: created.id };
  }

  if (!subscription) return { applied: false };

  const updated = await prisma.subscription.update({
    where: { id: subscription.id },
    data: patch,
  });

  await recordAudit(prisma, {
    action: "subscription.updated.via_event",
    entityType: "Subscription",
    entityId: subscription.id,
    actorUserId,
    schoolId: subscription.schoolId,
    oldValues: { status: subscription.status },
    newValues: { ...patch } as Record<string, unknown>,
    metadata: { provider: "mock", event: event.type },
  });

  return { applied: true, subscriptionId: updated.id };
}
