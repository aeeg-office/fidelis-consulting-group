"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Sparkles,
  BookOpen,
  Award,
  BarChart3,
  ArrowRight,
  Clock,
  Users,
  FileText,
  Video,
  PenTool,
  MessageSquare,
  Calendar,
  TrendingUp,
} from "lucide-react";

const favoriteTools = [
  {
    name: "Lesson Plan Generator",
    description: "Create standards-aligned lesson plans in seconds",
    icon: FileText,
    color: "text-blue-600 bg-blue-50",
    uses: 48,
  },
  {
    name: "Quiz Maker",
    description: "Generate assessments with auto-grading",
    icon: PenTool,
    color: "text-purple-600 bg-purple-50",
    uses: 35,
  },
  {
    name: "Content Translator",
    description: "Translate materials between EN/AR",
    icon: MessageSquare,
    color: "text-emerald-600 bg-emerald-50",
    uses: 27,
  },
  {
    name: "Video Assistant",
    description: "Create and edit educational video content",
    icon: Video,
    color: "text-rose-600 bg-rose-50",
    uses: 19,
  },
  {
    name: "Rubric Designer",
    description: "Build custom assessment rubrics",
    icon: Users,
    color: "text-amber-600 bg-amber-50",
    uses: 14,
  },
];

const upcomingWorkshops = [
  {
    id: 1,
    title: "AI-Powered Lesson Planning",
    date: "Aug 15, 2026",
    time: "3:00 PM GST",
    duration: "90 min",
    track: "AI for Educators",
    enrolled: 24,
  },
  {
    id: 2,
    title: "English Through Digital Storytelling",
    date: "Aug 22, 2026",
    time: "10:00 AM GST",
    duration: "120 min",
    track: "English Teaching",
    enrolled: 18,
  },
  {
    id: 3,
    title: "Differentiation with AI Tools",
    date: "Sep 5, 2026",
    time: "3:00 PM GST",
    duration: "90 min",
    track: "AI for Educators",
    enrolled: 31,
  },
];

const recentCertificates = [
  {
    id: 1,
    title: "AI for Educators — Module 3",
    issued: "Jul 28, 2026",
    badge: "Gold",
  },
  {
    id: 2,
    title: "English Teaching Methodology — Advanced",
    issued: "Jul 15, 2026",
    badge: "Silver",
  },
  {
    id: 3,
    title: "AI for Educators — Module 1",
    issued: "Jun 30, 2026",
    badge: "Gold",
  },
];

export default function TeacherDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-[family-name:var(--font-heading)] font-bold text-navy">
          Teacher Dashboard
        </h1>
        <p className="text-charcoal-light mt-1">
          Your teaching tools, workshops, and progress at a glance.
        </p>
      </div>

      {/* Usage stats banner */}
      <Card variant="elevated" padding="md" className="bg-gradient-to-r from-navy to-navy-light text-white">
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gold/20 rounded-lg">
                <BarChart3 className="w-6 h-6 text-gold" />
              </div>
              <div>
                <p className="text-sm text-white/70">AI Calls This Month</p>
                <p className="text-3xl font-bold font-[family-name:var(--font-heading)]">143</p>
              </div>
            </div>
            <div className="flex gap-4 text-sm">
              <div className="text-center">
                <p className="text-white/70">This Week</p>
                <p className="text-lg font-semibold text-gold">38</p>
              </div>
              <div className="w-px bg-white/20" />
              <div className="text-center">
                <p className="text-white/70">Avg / Day</p>
                <p className="text-lg font-semibold text-gold">12</p>
              </div>
              <div className="w-px bg-white/20" />
              <div className="text-center">
                <p className="text-white/70">vs Last Month</p>
                <p className="text-lg font-semibold text-success flex items-center gap-1 justify-center">
                  <TrendingUp className="w-4 h-4" />
                  +18%
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Tools Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-[family-name:var(--font-heading)] font-bold text-navy">
            Your AI Tools
          </h2>
          <Button variant="ghost" size="sm">
            View All Tools <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {favoriteTools.map((tool) => (
            <Card
              key={tool.name}
              variant="bordered"
              padding="md"
              className="hover:border-gold/40 hover:shadow-md transition-all duration-200 cursor-pointer group"
            >
              <CardContent>
                <div className={`p-2.5 rounded-lg w-fit ${tool.color} mb-3`}>
                  <tool.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-navy text-sm group-hover:text-gold transition-colors">
                  {tool.name}
                </h3>
                <p className="text-xs text-charcoal-light mt-1 leading-relaxed">
                  {tool.description}
                </p>
                <p className="text-xs text-charcoal-light mt-3 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Used {tool.uses} times
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Bottom grid: Upcoming Workshops + Recent Certificates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Workshops */}
        <Card variant="bordered" padding="md">
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-[family-name:var(--font-heading)] font-bold text-navy">
                Upcoming Workshops
              </h2>
              <Link href="/app/workshops">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {upcomingWorkshops.map((workshop) => (
                <div
                  key={workshop.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-ivory/50 hover:bg-ivory transition-colors"
                >
                  <div className="p-2 bg-navy/5 rounded-lg shrink-0">
                    <Calendar className="w-4 h-4 text-navy" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-navy">
                      {workshop.title}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-charcoal-light">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {workshop.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {workshop.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {workshop.enrolled} enrolled
                      </span>
                    </div>
                    <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider text-gold bg-gold/10 rounded-full px-2 py-0.5">
                      {workshop.track}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" className="shrink-0">
                    Join
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Certificates */}
        <Card variant="bordered" padding="md">
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-[family-name:var(--font-heading)] font-bold text-navy">
                Recent Certificates
              </h2>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </div>
            <div className="space-y-3">
              {recentCertificates.map((cert) => (
                <div
                  key={cert.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-ivory/50 hover:bg-ivory transition-colors"
                >
                  <div className="p-2 rounded-lg bg-amber-50 shrink-0">
                    <Award className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-navy">
                      {cert.title}
                    </p>
                    <p className="text-xs text-charcoal-light">
                      Issued {cert.issued}
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-700 bg-amber-100 rounded-full px-2 py-0.5">
                    {cert.badge}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}