import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPrincipal } from "@/lib/principal";
import { findUserSubscription, toEntitlementInput } from "@/lib/subscription-service";
import { resolveEntitlement } from "@/lib/entitlements";

/**
 * GET /api/billing/status — returns the current user's resolved entitlement.
 * This is exactly what privileged tool routes should call, server-side.
 */
export async function GET() {
  const principal = await getPrincipal();
  if (!principal) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const subscription = await findUserSubscription(prisma, principal.userId);
  if (!subscription) {
    return NextResponse.json({
      hasSubscription: false,
      entitlement: { granted: false, reason: "none" },
      plan: null,
    });
  }

  const entitlement = resolveEntitlement(toEntitlementInput(subscription));

  return NextResponse.json({
    hasSubscription: true,
    entitlement,
    plan: {
      id: subscription.plan.id,
      name: subscription.plan.name,
      code: subscription.plan.code,
      type: subscription.plan.type,
      priceMonthly: subscription.plan.priceMonthly?.toString() ?? null,
    },
    status: subscription.status,
    currentPeriodEnd: subscription.currentPeriodEnd,
  });
}
