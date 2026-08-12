"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

interface Lead {
  id: string;
  name: string;
  email: string;
  company: string | null;
  message: string;
  status: string;
  createdAt: string;
}

const STATUSES = ["new", "qualified", "contacted", "proposal", "won", "lost"];

export default function AdminCrmPage() {
  const [state, setState] = useState<{ status: "loading" | "ready" | "error"; leads: Lead[]; error?: string }>(
    { status: "loading", leads: [] },
  );
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/crm/leads");
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setState({ status: "error", leads: [], error: body.error ?? "Failed to load leads." });
        return;
      }
      setState({ status: "ready", leads: body.leads ?? [] });
    } catch {
      setState({ status: "error", leads: [], error: "Network error while loading leads." });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function createLead(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const res = await fetch("/api/crm/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, company: company || undefined, message: "" }),
    });
    const body = await res.json().catch(() => ({}));
    setMsg({ ok: res.ok, text: res.ok ? "Lead created." : (body.error ?? "Could not create lead.") });
    if (res.ok) {
      setName("");
      setEmail("");
      setCompany("");
      load();
    }
  }

  async function updateStatus(id: string, status: string) {
    setMsg(null);
    const res = await fetch(`/api/crm/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const body = await res.json().catch(() => ({}));
    setMsg({ ok: res.ok, text: res.ok ? "Lead updated." : (body.error ?? "Could not update lead.") });
    if (res.ok) load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-navy">Consultancy CRM</h1>
        <p className="text-charcoal-light mt-1">Manage leads through the consultancy pipeline.</p>
      </div>

      {msg && <p role="status" className={`text-sm ${msg.ok ? "text-success" : "text-error"}`}>{msg.text}</p>}

      <Card variant="bordered" padding="md">
        <CardHeader><CardTitle>Add lead</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={createLead} className="flex flex-col sm:flex-row gap-2">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required aria-label="Lead name" className="h-11 flex-1 px-3.5 rounded-md border border-border text-sm" />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required aria-label="Lead email" className="h-11 flex-1 px-3.5 rounded-md border border-border text-sm" />
            <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company (optional)" aria-label="Company" className="h-11 flex-1 px-3.5 rounded-md border border-border text-sm" />
            <button type="submit" className="h-11 px-5 rounded-md bg-navy text-white text-sm font-medium">Add</button>
          </form>
        </CardContent>
      </Card>

      {state.status === "loading" && <p className="text-charcoal-light">Loading leads…</p>}
      {state.status === "error" && <p className="text-error">{state.error}</p>}
      {state.status === "ready" && state.leads.length === 0 && (
        <p className="text-charcoal-light">No leads yet.</p>
      )}

      <Card variant="bordered" padding="md">
        <CardContent>
          <ul className="divide-y divide-border">
            {state.leads.map((l) => (
              <li key={l.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-navy">{l.name}</p>
                  <p className="text-xs text-charcoal-light">{l.email}{l.company ? ` · ${l.company}` : ""}</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={l.status}
                    onChange={(e) => updateStatus(l.id, e.target.value)}
                    aria-label={`Status for ${l.name}`}
                    className="h-9 px-2 rounded-md border border-border text-sm bg-white"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
