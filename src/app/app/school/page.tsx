"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Building2, Users, Layers } from "lucide-react";

interface School {
  id: string;
  name: string;
  slug: string;
  country: string | null;
  city: string | null;
  status: string;
  email: string;
  phone: string | null;
  curriculum: string | null;
  teacherCount: number;
  englishTeacherCount: number;
}

interface Department {
  id: string;
  name: string;
  nameAr: string | null;
  subject: string | null;
  teacherCount: number;
  _count?: { users: number };
}

interface Teacher {
  id: string;
  fullName: string;
  email: string;
  jobTitle: string | null;
  departmentId: string | null;
  subject: string | null;
  lastLoginAt: string | null;
  userRoles?: { role: { name: string } }[];
}

interface Overview {
  school: School;
  departments: Department[];
  teachers: Teacher[];
}

export default function SchoolWorkspacePage() {
  const [state, setState] = useState<{
    status: "loading" | "ready" | "error";
    data: Overview | null;
    error?: string;
  }>({ status: "loading", data: null });

  const [deptName, setDeptName] = useState("");
  const [deptSubject, setDeptSubject] = useState("");
  const [deptBusy, setDeptBusy] = useState(false);
  const [deptMsg, setDeptMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [tName, setTName] = useState("");
  const [tEmail, setTEmail] = useState("");
  const [tPassword, setTPassword] = useState("");
  const [tDept, setTDept] = useState("");
  const [tBusy, setTBusy] = useState(false);
  const [tMsg, setTMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    setState((s) => ({ ...s, status: "loading" }));
    try {
      const res = await fetch("/api/school/overview");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setState({ status: "error", data: null, error: body.error ?? "Failed to load school." });
        return;
      }
      const data = (await res.json()) as Overview;
      setState({ status: "ready", data });
    } catch {
      setState({ status: "error", data: null, error: "Network error while loading school." });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function createDepartment(e: React.FormEvent) {
    e.preventDefault();
    setDeptBusy(true);
    setDeptMsg(null);
    try {
      const res = await fetch("/api/school/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: deptName, subject: deptSubject || undefined }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setDeptMsg({ ok: false, text: body.error ?? "Could not create department." });
      } else {
        setDeptMsg({ ok: true, text: "Department created." });
        setDeptName("");
        setDeptSubject("");
        load();
      }
    } catch {
      setDeptMsg({ ok: false, text: "Network error while creating department." });
    } finally {
      setDeptBusy(false);
    }
  }

  async function inviteTeacher(e: React.FormEvent) {
    e.preventDefault();
    setTBusy(true);
    setTMsg(null);
    try {
      const res = await fetch("/api/school/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: tName,
          email: tEmail,
          password: tPassword,
          departmentId: tDept || undefined,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setTMsg({ ok: false, text: body.error ?? "Could not provision teacher." });
      } else {
        setTMsg({ ok: true, text: "Teacher provisioned." });
        setTName("");
        setTEmail("");
        setTPassword("");
        setTDept("");
        load();
      }
    } catch {
      setTMsg({ ok: false, text: "Network error while provisioning teacher." });
    } finally {
      setTBusy(false);
    }
  }

  if (state.status === "loading") {
    return <p className="text-charcoal-light">Loading school workspace…</p>;
  }
  if (state.status === "error" || !state.data) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-navy">School Workspace</h1>
        <p className="text-error">{state.error}</p>
      </div>
    );
  }

  const { school, departments, teachers } = state.data;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-navy">{school.name}</h1>
        <p className="text-charcoal-light mt-1">
          {school.city || "—"}
          {school.country ? `, ${school.country}` : ""} · Status: {school.status}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card variant="elevated" padding="md">
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-navy/10 text-navy"><Building2 className="w-5 h-5" /></div>
              <div>
                <p className="text-sm text-charcoal-light">School</p>
                <p className="text-lg font-semibold text-navy">{school.teacherCount} teachers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="elevated" padding="md">
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-gold/10 text-gold"><Layers className="w-5 h-5" /></div>
              <div>
                <p className="text-sm text-charcoal-light">Departments</p>
                <p className="text-lg font-semibold text-navy">{departments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="elevated" padding="md">
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-success/10 text-success"><Users className="w-5 h-5" /></div>
              <div>
                <p className="text-sm text-charcoal-light">Staff</p>
                <p className="text-lg font-semibold text-navy">{teachers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Departments */}
        <Card variant="bordered" padding="md">
          <CardHeader>
            <CardTitle>Departments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {departments.length === 0 && (
              <p className="text-sm text-charcoal-light">No departments yet.</p>
            )}
            {departments.map((d) => (
              <div key={d.id} className="flex items-center justify-between p-3 rounded-lg bg-ivory/50">
                <div>
                  <p className="text-sm font-medium text-navy">{d.name}</p>
                  {d.subject && <p className="text-xs text-charcoal-light">{d.subject}</p>}
                </div>
                <span className="text-xs text-charcoal-light">{d._count?.users ?? 0} members</span>
              </div>
            ))}

            <form onSubmit={createDepartment} className="pt-2 space-y-2 border-t border-border">
              <h3 className="text-sm font-semibold text-navy">Add department</h3>
              <input
                value={deptName}
                onChange={(e) => setDeptName(e.target.value)}
                placeholder="Department name"
                required
                aria-label="Department name"
                className="w-full h-11 px-3.5 rounded-md border border-border bg-white text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-gold"
              />
              <input
                value={deptSubject}
                onChange={(e) => setDeptSubject(e.target.value)}
                placeholder="Subject (optional)"
                aria-label="Department subject"
                className="w-full h-11 px-3.5 rounded-md border border-border bg-white text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-gold"
              />
              {deptMsg && (
                <p className={`text-sm ${deptMsg.ok ? "text-success" : "text-error"}`} role="status">{deptMsg.text}</p>
              )}
              <button
                type="submit"
                disabled={deptBusy || !deptName}
                className="w-full h-11 rounded-md bg-navy text-white text-sm font-medium disabled:opacity-50"
              >
                {deptBusy ? "Creating…" : "Create department"}
              </button>
            </form>
          </CardContent>
        </Card>

        {/* Teacher lifecycle */}
        <Card variant="bordered" padding="md">
          <CardHeader>
            <CardTitle>Staff & Teacher Lifecycle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {teachers.length === 0 && (
              <p className="text-sm text-charcoal-light">No staff provisioned yet.</p>
            )}
            {teachers.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-ivory/50">
                <div>
                  <p className="text-sm font-medium text-navy">{t.fullName}</p>
                  <p className="text-xs text-charcoal-light">{t.email}</p>
                </div>
                <span className="text-[10px] uppercase tracking-wider text-gold bg-gold/10 rounded-full px-2 py-0.5">
                  {t.userRoles?.[0]?.role?.name ?? "teacher"}
                </span>
              </div>
            ))}

            <form onSubmit={inviteTeacher} className="pt-2 space-y-2 border-t border-border">
              <h3 className="text-sm font-semibold text-navy">Provision a school teacher</h3>
              <input
                value={tName}
                onChange={(e) => setTName(e.target.value)}
                placeholder="Full name"
                required
                aria-label="Teacher full name"
                className="w-full h-11 px-3.5 rounded-md border border-border bg-white text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-gold"
              />
              <input
                type="email"
                value={tEmail}
                onChange={(e) => setTEmail(e.target.value)}
                placeholder="you@school.com"
                required
                aria-label="Teacher email"
                className="w-full h-11 px-3.5 rounded-md border border-border bg-white text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-gold"
              />
              <input
                type="password"
                value={tPassword}
                onChange={(e) => setTPassword(e.target.value)}
                placeholder="Temporary password (min 12 chars)"
                required
                aria-label="Temporary password"
                className="w-full h-11 px-3.5 rounded-md border border-border bg-white text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-gold"
              />
              <select
                value={tDept}
                onChange={(e) => setTDept(e.target.value)}
                aria-label="Department"
                className="w-full h-11 px-3.5 rounded-md border border-border bg-white text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-gold"
              >
                <option value="">No department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              {tMsg && (
                <p className={`text-sm ${tMsg.ok ? "text-success" : "text-error"}`} role="status">{tMsg.text}</p>
              )}
              <button
                type="submit"
                disabled={tBusy || !tName || !tEmail || !tPassword}
                className="w-full h-11 rounded-md bg-navy text-white text-sm font-medium disabled:opacity-50"
              >
                {tBusy ? "Provisioning…" : "Provision teacher"}
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
