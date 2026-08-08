"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  BookOpen,
  Sparkles,
  Award,
  TrendingUp,
  Clock,
  ArrowRight,
  GraduationCap,
  Settings,
  Users,
  Calendar,
} from "lucide-react";

// Placeholder user data
const USER = {
  name: "Sarah Ahmed",
  role: "teacher", // 'teacher' | 'admin' | 'student'
};

const quickStats = [
  {
    label: "Workshops Enrolled",
    value: 6,
    icon: BookOpen,
    color: "text-blue-600 bg-blue-50",
  },
  {
    label: "AI Tools Used",
    value: 12,
    icon: Sparkles,
    color: "text-amber-600 bg-amber-50",
  },
  {
    label: "Certificates Earned",
    value: 4,
    icon: Award,
    color: "text-emerald-600 bg-emerald-50",
  },
];

const recentActivities = [
  {
    id: 1,
    action: "Completed workshop",
    detail: "AI-Powered Lesson Planning",
    time: "2 hours ago",
    icon: GraduationCap,
    color: "text-emerald-600 bg-emerald-50",
  },
  {
    id: 2,
    action: "Earned certificate",
    detail: "AI for Educators — Module 3",
    time: "Yesterday",
    icon: Award,
    color: "text-amber-600 bg-amber-50",
  },
  {
    id: 3,
    action: "Used AI tool",
    detail: "Lesson Plan Generator — 5 plans created",
    time: "Yesterday",
    icon: Sparkles,
    color: "text-purple-600 bg-purple-50",
  },
  {
    id: 4,
    action: "Enrolled in workshop",
    detail: "English Through Digital Storytelling",
    time: "3 days ago",
    icon: BookOpen,
    color: "text-blue-600 bg-blue-50",
  },
  {
    id: 5,
    action: "Submitted assignment",
    detail: "Classroom AI Integration Plan",
    time: "5 days ago",
    icon: TrendingUp,
    color: "text-indigo-600 bg-indigo-50",
  },
];

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-charcoal-light">Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const roleParam = searchParams?.get("role");
  const role = roleParam || USER.role;

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-[family-name:var(--font-heading)] font-bold text-navy">
            Welcome back, {USER.name}
          </h1>
          <p className="text-charcoal-light mt-1">
            Here&apos;s what&apos;s happening with your learning journey today.
          </p>
        </div>

        {/* Role-based quick links */}
        <div className="flex gap-2">
          {role === "teacher" && (
            <Link href="/app/dashboard/teacher">
              <Button variant="navy" size="sm">
                Teacher Dashboard
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          )}
          {role === "admin" && (
            <Link href="/app/dashboard/admin">
              <Button variant="navy" size="sm">
                Admin Dashboard
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Quick stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {quickStats.map((stat) => (
          <Card key={stat.label} variant="elevated" padding="md">
            <CardContent>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-charcoal-light font-medium">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-navy mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs text-success">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+12% this month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main grid: Activity + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent activity feed */}
        <Card variant="bordered" padding="md" className="lg:col-span-2">
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-[family-name:var(--font-heading)] font-bold text-navy">
                Recent Activity
              </h2>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </div>
            <div className="space-y-0 divide-y divide-border">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className={`p-2 rounded-lg shrink-0 ${activity.color}`}>
                    <activity.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-charcoal">
                      {activity.action}
                    </p>
                    <p className="text-xs text-charcoal-light">
                      {activity.detail}
                    </p>
                  </div>
                  <span className="text-xs text-charcoal-light shrink-0">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card variant="bordered" padding="md">
          <CardContent>
            <h2 className="text-lg font-[family-name:var(--font-heading)] font-bold text-navy mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <Link href="/app/workshops">
                <Button variant="navy" fullWidth size="md">
                  <BookOpen className="w-4 h-4" />
                  Browse Workshops
                </Button>
              </Link>
              <Link href="/app/workshops">
                <Button variant="secondary" fullWidth size="md">
                  <Calendar className="w-4 h-4" />
                  My Schedule
                </Button>
              </Link>
              <Link href="/app/profile">
                <Button variant="secondary" fullWidth size="md">
                  <Users className="w-4 h-4" />
                  View Profile
                </Button>
              </Link>
              <Link href="/app/settings">
                <Button variant="ghost" fullWidth size="md">
                  <Settings className="w-4 h-4" />
                  Account Settings
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
