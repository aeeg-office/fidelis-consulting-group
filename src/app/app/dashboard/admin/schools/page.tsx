"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

interface AdminSchool {
  id: string;
  name: string;
  slug: string;
  country: string | null;
  city: string | null;
  status: string;
  email: string;
  teacherCount: number;
  createdAt: string;
  _count: { users: number; departments: number };
}

export default function AdminSchoolsPage() {
  const [state, setState] = useState<{
    status: "loading" | "ready" | "error";
    schools: AdminSchool[];
    error?: string;
  }>({ status: "loading", schools: [] });

  const [busyId, setBusyId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    setState((s) => ({ ...s, status: "loading" }));
    try {
      const res = await fetch("/api/admin/schools");
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setState({ status: "error", schools: [], error: body.error ?? "Failed to load schools." });
        return;
      }
      setState({ status: "ready", schools: body.schools ?? [] });
    } catch {
      setState({ status: "error", schools: [], error: "Network error while loading schools." });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function setStatus(id: string, status: "approved" | "rejected") {
    setBusyId(id);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/schools/${id}/approval`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg({ ok: false, text: body.error ?? "Could not update school status." });
      } else {
        setMsg({ ok: true, text: `School marked ${status}.` });
        load();
      }
    } catch {
      setMsg({ ok: false, text: "Network error while updating school." });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-navy">School Approvals</h1>
        <p className="text-charcoal-light mt-1">Approve or reject school tenants on the platform.</p>
      </div>

      {msg && <p role="status" className={`text-sm ${msg.ok ? "text-success" : "text-error"}`}>{msg.text}</p>}

      {state.status === "loading" && <p className="text-charcoal-light">Loading schools…</p>}
      {state.status === "error" && <p className="text-error">{state.error}</p>}
      {state.status === "ready" && state.schools.length === 0 && (
        <p className="text-charcoal-light">No school tenants yet.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {state.schools.map((s) => (
          <Card key={s.id} variant="elevated" padding="md">
            <CardContent>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-navy">{s.name}</p>
                  <p className="text-xs text-charcoal-light mt-0.5">{s.slug}</p>
                  <p className="text-xs text-charcoal-light">
                    {s.city || "—"}
                    {s.country ? `, ${s.country}` : ""}
                  </p>
                </div>
                <span
                  className={`text-[10px] uppercase tracking-wider rounded-full px-2 py-1 ${
                    s.status === "approved"
                      ? "bg-success/10 text-success"
                      : s.status === "rejected"
                        ? "bg-error/10 text-error"
                        : "bg-warning/10 text-warning"
                  }`}
                >
                  {s.status}
                </span>
              </div>
              <p className="text-xs text-charcoal-light mt-3">
                {s._count.users} users · {s._count.departments} departments · {s.teacherCount} teachers
              </p>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setStatus(s.id, "approved")}
                  disabled={busyId === s.id || s.status === "approved"}
                  className="px-3 h-9 rounded-md bg-success text-white text-sm font-medium disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  onClick={() => setStatus(s.id, "rejected")}
                  disabled={busyId === s.id || s.status === "rejected"}
                  className="px-3 h-9 rounded-md bg-error text-white text-sm font-medium disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
