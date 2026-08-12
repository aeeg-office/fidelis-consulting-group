import { NextRequest, NextResponse } from "next/server";
import { getPaymentProvider, isMockBillingMode } from "@/lib/payments";
import { applyProviderEvent } from "@/lib/subscription-service";
import { prisma } from "@/lib/prisma";
import { getPrincipal } from "@/lib/principal";

/**
 * POST /api/billing/webhook — entry point for provider billing events.
 *
 * Until a real billing provider is selected, only the mock provider is
 * accepted (PAYMENT_PROVIDER default "mock"), and the actor is the signed-in
 * user (dev/test convenience). A production adapter must verify provider
 * signatures server-side and never trust the caller identity for billing.
 */
export async function POST(request: NextRequest) {
  if (!isMockBillingMode()) {
    return NextResponse.json({ error: "Billing provider not configured." }, { status: 503 });
  }

  const principal = await getPrincipal();
  if (!principal) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (principal.roles.some((r) => r.name === "workshop_participant")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const event = getPaymentProvider().parseEvent(raw);
  if (!event) {
    return NextResponse.json({ error: "Unhandled or malformed event." }, { status: 400 });
  }

  const result = await applyProviderEvent(prisma, event, principal.userId);
  return NextResponse.json(result, { status: result.applied ? 200 : 202 });
}
