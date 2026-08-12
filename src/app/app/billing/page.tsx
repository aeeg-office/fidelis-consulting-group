"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

interface BillingStatus {
  hasSubscription: boolean;
  entitlement: { granted: boolean; reason: string };
  plan: { id: string; name: string; code: string; type: string; priceMonthly: string | null } | null;
  status?: string;
  currentPeriodEnd?: string | null;
}

export default function BillingPage() {
  const [state, setState] = useState<{
    status: "loading" | "ready" | "error";
    data: BillingStatus | null;
    error?: string;
  }>({ status: "loading", data: null });

  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setState((s) => ({ ...s, status: "loading" }));
    try {
      const res = await fetch("/api/billing/status");
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setState({ status: "error", data: null, error: body.error ?? "Failed to load billing status." });
        return;
      }
      setState({ status: "ready", data: body });
    } catch {
      setState({ status: "error", data: null, error: "Network error while loading billing status." });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function simulate(kind: string) {
    setBusy(true);
    setMsg(null);
    const events: Record<string, unknown> = {
      activate: {
        type: "checkout.completed",
        planCode: "teacher_pro",
        periodStart: new Date().toISOString(),
        periodEnd: new Date(Date.now() + 30 * 86400000).toISOString(),
      },
      fail: { type: "invoice.payment_failed" },
      cancel: { type: "customer.subscription.canceled", cancelAtPeriodEnd: true },
    };
    try {
      const res = await fetch("/api/billing/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(events[kind]),
      });
      const body = await res.json().catch(() => ({}));
      setMsg({
        ok: res.ok,
        text: res.ok ? "Billing event applied." : (body.error ?? "Billing event rejected."),
      });
      load();
    } catch {
      setMsg({ ok: false, text: "Network error applying billing event." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-navy">Billing &amp; Access</h1>
        <p className="text-charcoal-light mt-1">Your plan and current access entitlement.</p>
      </div>

      {state.status === "loading" && <p className="text-charcoal-light">Loading…</p>}
      {state.status === "error" && <p className="text-error">{state.error}</p>}

      {state.status === "ready" && state.data && (
        <>
          <Card variant="elevated" padding="md">
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-sm text-charcoal-light">Plan</p>
                <p className="text-xl font-semibold text-navy">
                  {state.data.plan ? state.data.plan.name : "No plan"}
                </p>
                {state.data.plan && (
                  <p className="text-sm text-charcoal-light mt-0.5">
                    {state.data.plan.code} · {state.data.plan.priceMonthly ? `$${state.data.plan.priceMonthly}/mo` : "custom"}
                  </p>
                )}
              </div>
              <span
                className={`text-xs font-semibold rounded-full px-3 py-1.5 ${
                  state.data.entitlement.granted
                    ? "bg-success/10 text-success"
                    : "bg-error/10 text-error"
                }`}
              >
                {state.data.entitlement.granted ? "Access Granted" : `No access (${state.data.entitlement.reason})`}
              </span>
            </CardContent>
          </Card>

          <Card variant="bordered" padding="md">
            <CardHeader>
              <CardTitle>Payment provider (mock)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-charcoal-light">
                A live billing provider has not been selected. These controls simulate
                provider events to verify the entitlement lifecycle end-to-end in mock mode.
              </p>
              {msg && <p role="status" className={`text-sm ${msg.ok ? "text-success" : "text-error"}`}>{msg.text}</p>}
              <div className="flex flex-wrap gap-2">
                <button onClick={() => simulate("activate")} disabled={busy} className="h-10 px-4 rounded-md bg-navy text-white text-sm font-medium disabled:opacity-50">
                  Simulate activation
                </button>
                <button onClick={() => simulate("fail")} disabled={busy} className="h-10 px-4 rounded-md bg-warning text-white text-sm font-medium disabled:opacity-50">
                  Simulate payment failure
                </button>
                <button onClick={() => simulate("cancel")} disabled={busy} className="h-10 px-4 rounded-md bg-error text-white text-sm font-medium disabled:opacity-50">
                  Simulate cancel
                </button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
