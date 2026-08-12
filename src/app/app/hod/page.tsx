"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Users } from "lucide-react";

interface Department {
  id: string;
  name: string;
  nameAr: string | null;
  subject: string | null;
  teacherCount: number;
}

interface Teacher {
  id: string;
  fullName: string;
  email: string;
  jobTitle: string | null;
  subject: string | null;
  lastLoginAt: string | null;
}

interface HodData {
  department: Department;
  teachers: Teacher[];
}

export default function HodWorkspacePage() {
  const [state, setState] = useState<{
    status: "loading" | "ready" | "error";
    data: HodData | null;
    error?: string;
  }>({ status: "loading", data: null });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/hod/department");
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          setState({ status: "error", data: null, error: body.error ?? "Failed to load department." });
          return;
        }
        setState({ status: "ready", data: (await res.json()) as HodData });
      } catch {
        setState({ status: "error", data: null, error: "Network error while loading department." });
      }
    })();
  }, []);

  if (state.status === "loading") {
    return <p className="text-charcoal-light">Loading department workspace…</p>;
  }
  if (state.status === "error" || !state.data) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-navy">Department Workspace</h1>
        <p className="text-error">{state.error}</p>
      </div>
    );
  }

  const { department, teachers } = state.data;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-navy">{department.name}</h1>
        <p className="text-charcoal-light mt-1">
          {department.subject ? `${department.subject} · ` : ""}
          {teachers.length} teacher{teachers.length === 1 ? "" : "s"}
        </p>
      </div>

      <Card variant="bordered" padding="md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" /> Teacher Oversight
          </CardTitle>
        </CardHeader>
        <CardContent>
          {teachers.length === 0 && (
            <p className="text-sm text-charcoal-light">No teachers are assigned to this department yet.</p>
          )}
          <ul className="divide-y divide-border">
            {teachers.map((t) => (
              <li key={t.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-navy">{t.fullName}</p>
                  <p className="text-xs text-charcoal-light">{t.email}</p>
                </div>
                <div className="text-right">
                  {t.jobTitle && <p className="text-xs text-charcoal">{t.jobTitle}</p>}
                  {t.subject && <p className="text-xs text-charcoal-light">{t.subject}</p>}
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
