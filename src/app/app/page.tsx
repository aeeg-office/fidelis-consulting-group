"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Bot,
  BookOpen,
  GraduationCap,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const quickActions = [
  {
    title: "AI Lesson Planner",
    description: "Create comprehensive lesson plans in seconds",
    href: "/app/tools/lesson-planner",
    icon: Bot,
    color: "bg-gold/10 text-gold",
  },
  {
    title: "Quiz Builder",
    description: "Generate assessments with varied question types",
    href: "/app/tools/quiz-builder",
    icon: Sparkles,
    color: "bg-navy/10 text-navy",
  },
  {
    title: "Workshops",
    description: "Browse and enroll in professional development workshops",
    href: "/app/workshops",
    icon: BookOpen,
    color: "bg-success/10 text-success",
  },
  {
    title: "Courses",
    description: "Access self-paced professional learning courses",
    href: "/app/courses",
    icon: GraduationCap,
    color: "bg-info/10 text-info",
  },
];

export default function AppDashboardPage() {
  const { data: session } = useSession();

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-[family-name:var(--font-heading)] font-bold text-navy">
          Welcome{session?.user?.name ? `, ${session.user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-charcoal-light mt-2">
          Here&apos;s what you can do with Fidelis today.
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <Link key={action.href} href={action.href} className="group">
            <Card className="h-full hover:shadow-md transition-all duration-200 cursor-pointer border-2 border-transparent hover:border-gold/30">
              <CardContent className="p-6">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${action.color}`}
                >
                  <action.icon className="w-6 h-6" />
                </div>
                <h3 className="font-[family-name:var(--font-heading)] font-bold text-navy mb-1 group-hover:text-gold transition-colors">
                  {action.title}
                </h3>
                <p className="text-sm text-charcoal-light">{action.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Role-based section */}
      {session?.user?.roles?.some((r) => r.name === "school_admin") && (
        <Card className="border-2 border-gold/20 bg-gold/5">
          <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-[family-name:var(--font-heading)] font-bold text-navy mb-1">
                Admin Dashboard
              </h2>
              <p className="text-sm text-charcoal-light">
                Manage users, subscriptions, and school settings
              </p>
            </div>
            <Link href="/app/dashboard/admin">
              <Button variant="goldOutline" size="sm">
                Go to admin
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {session?.user?.roles?.some(
        (r) => r.name === "teacher" || r.name === "hod"
      ) && (
        <Card className="border-2 border-navy/10">
          <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-[family-name:var(--font-heading)] font-bold text-navy mb-1">
                Teacher Dashboard
              </h2>
              <p className="text-sm text-charcoal-light">
                View your classes, assignments, and AI tool usage
              </p>
            </div>
            <Link href="/app/dashboard/teacher">
              <Button variant="navy" size="sm">
                Go to dashboard
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}