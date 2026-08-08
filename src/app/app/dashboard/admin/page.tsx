"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Users,
  Building2,
  CreditCard,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  DollarSign,
  BarChart3,
  ArrowRight,
} from "lucide-react";

const platformStats = [
  {
    label: "Total Users",
    value: "2,847",
    change: "+12.5%",
    trend: "up",
    icon: Users,
    color: "text-blue-600 bg-blue-50",
  },
  {
    label: "Active Schools",
    value: "43",
    change: "+3",
    trend: "up",
    icon: Building2,
    color: "text-purple-600 bg-purple-50",
  },
  {
    label: "Active Subscriptions",
    value: "1,892",
    change: "+8.2%",
    trend: "up",
    icon: CreditCard,
    color: "text-emerald-600 bg-emerald-50",
  },
  {
    label: "AI Calls (This Month)",
    value: "48,231",
    change: "+22.1%",
    trend: "up",
    icon: Sparkles,
    color: "text-amber-600 bg-amber-50",
  },
];

const pendingApprovals = [
  {
    id: 1,
    type: "New School Registration",
    school: "Al Noor International School",
    submitted: "2 hours ago",
    status: "pending",
  },
  {
    id: 2,
    type: "Bulk User Import",
    school: "Dubai English Academy",
    submitted: "5 hours ago",
    status: "pending",
  },
  {
    id: 3,
    type: "Subscription Upgrade",
    school: "Riyadh Collegiate",
    submitted: "1 day ago",
    status: "pending",
  },
  {
    id: 4,
    type: "Content Access Request",
    school: "Qatar Leadership Academy",
    submitted: "2 days ago",
    status: "urgent",
  },
  {
    id: 5,
    type: "Certificate Verification",
    school: "British School of Kuwait",
    submitted: "3 days ago",
    status: "pending",
  },
];

const revenueData = [
  { month: "Mar", revenue: 12400 },
  { month: "Apr", revenue: 13800 },
  { month: "May", revenue: 15200 },
  { month: "Jun", revenue: 14100 },
  { month: "Jul", revenue: 16800 },
  { month: "Aug", revenue: 18500 },
];

const aiUsageByFeature = [
  { feature: "Lesson Plan Generator", calls: 12540, percentage: 26 },
  { feature: "Quiz Maker", calls: 8930, percentage: 18.5 },
  { feature: "Content Translator", calls: 6740, percentage: 14 },
  { feature: "Video Assistant", calls: 5210, percentage: 10.8 },
  { feature: "Rubric Designer", calls: 4230, percentage: 8.8 },
];

export default function AdminDashboardPage() {
  const maxRevenue = Math.max(...revenueData.map((r) => r.revenue));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-[family-name:var(--font-heading)] font-bold text-navy">
          Admin Dashboard
        </h1>
        <p className="text-charcoal-light mt-1">
          Platform overview, usage analytics, and pending actions.
        </p>
      </div>

      {/* Platform stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {platformStats.map((stat) => (
          <Card key={stat.label} variant="elevated" padding="md">
            <CardContent>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-charcoal-light font-medium">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-navy mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-2.5 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1 text-xs">
                {stat.trend === "up" ? (
                  <span className="flex items-center gap-0.5 text-success">
                    <TrendingUp className="w-3.5 h-3.5" />
                    {stat.change}
                  </span>
                ) : (
                  <span className="flex items-center gap-0.5 text-error">
                    <TrendingDown className="w-3.5 h-3.5" />
                    {stat.change}
                  </span>
                )}
                <span className="text-charcoal-light">vs last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main grid: AI Usage + Pending Approvals + Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Usage Across Platform */}
        <Card variant="bordered" padding="md" className="lg:col-span-2">
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-[family-name:var(--font-heading)] font-bold text-navy">
                AI Usage by Feature
              </h2>
              <Button variant="ghost" size="sm">
                Detailed Report <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              {aiUsageByFeature.map((item) => (
                <div key={item.feature}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-charcoal">
                      {item.feature}
                    </span>
                    <span className="text-sm text-charcoal-light">
                      {item.calls.toLocaleString()} calls
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-ivory rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gold rounded-full transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-charcoal-light mt-0.5">
                    {item.percentage}% of total
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card variant="bordered" padding="md">
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-[family-name:var(--font-heading)] font-bold text-navy">
                Pending Approvals
              </h2>
              <span className="text-xs font-semibold text-warning bg-warning/10 rounded-full px-2.5 py-1">
                {pendingApprovals.length} items
              </span>
            </div>
            <div className="space-y-0 divide-y divide-border">
              {pendingApprovals.map((approval) => (
                <div
                  key={approval.id}
                  className="py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-1.5 rounded-lg shrink-0 ${
                        approval.status === "urgent"
                          ? "bg-error/10 text-error"
                          : "bg-warning/10 text-warning"
                      }`}
                    >
                      {approval.status === "urgent" ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : (
                        <Clock className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-charcoal">
                        {approval.type}
                      </p>
                      <p className="text-xs text-charcoal-light">
                        {approval.school}
                      </p>
                      <p className="text-[11px] text-charcoal-light mt-0.5">
                        {approval.submitted}
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        className="p-1.5 rounded hover:bg-success/10 text-success transition-colors"
                        title="Approve"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1.5 rounded hover:bg-error/10 text-error transition-colors"
                        title="Reject"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Stats */}
      <Card variant="bordered" padding="md">
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-[family-name:var(--font-heading)] font-bold text-navy">
                Revenue Overview
              </h2>
              <p className="text-sm text-charcoal-light mt-0.5">
                Monthly subscription revenue (USD)
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-navy">
                $90,800
              </p>
              <p className="text-xs text-success flex items-center gap-1 justify-end">
                <TrendingUp className="w-3.5 h-3.5" />
                +9.8% vs last quarter
              </p>
            </div>
          </div>

          {/* Mini bar chart */}
          <div className="flex items-end gap-3 h-40">
            {revenueData.map((item) => {
              const height = (item.revenue / maxRevenue) * 100;
              return (
                <div
                  key={item.month}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <span className="text-xs text-charcoal-light">
                    ${(item.revenue / 1000).toFixed(1)}k
                  </span>
                  <div
                    className="w-full bg-gold/30 rounded-t-md relative overflow-hidden"
                    style={{ height: `${height}%` }}
                  >
                    <div
                      className="absolute bottom-0 w-full bg-gold rounded-t-md transition-all duration-500"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-navy">
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}