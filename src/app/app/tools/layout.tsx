"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  FileText,
  ClipboardCheck,
  MessageSquare,
  Mail,
  Building2,
  GraduationCap,
  Target,
  CheckSquare,
  Home,
  ChevronRight,
} from "lucide-react";

// ─── Tool Category Definitions ───────────────────────────────────────────────

export interface ToolItem {
  code: string;
  label: string;
  href: string;
  icon: React.ReactNode;
}

export interface ToolCategory {
  name: string;
  icon: React.ReactNode;
  color: string;
  tools: ToolItem[];
}

export const TOOL_CATEGORIES: ToolCategory[] = [
  {
    name: "Planning",
    icon: <BookOpen className="w-4 h-4" />,
    color: "text-blue-600",
    tools: [
      { code: "lesson-planner", label: "Lesson Planner", href: "/app/tools/lesson-planner", icon: <BookOpen className="w-3.5 h-3.5" /> },
      { code: "unit-planner", label: "Unit Planner", href: "#", icon: <BookOpen className="w-3.5 h-3.5" /> },
      { code: "learning-objectives", label: "Learning Objective Generator", href: "#", icon: <Target className="w-3.5 h-3.5" /> },
      { code: "success-criteria", label: "Success Criteria Generator", href: "#", icon: <CheckSquare className="w-3.5 h-3.5" /> },
    ],
  },
  {
    name: "Resource Creation",
    icon: <FileText className="w-4 h-4" />,
    color: "text-emerald-600",
    tools: [
      { code: "worksheet-builder", label: "Worksheet Builder", href: "#", icon: <FileText className="w-3.5 h-3.5" /> },
      { code: "reading-passage", label: "Reading Passage Generator", href: "#", icon: <FileText className="w-3.5 h-3.5" /> },
      { code: "writing-prompts", label: "Writing Prompt Generator", href: "#", icon: <FileText className="w-3.5 h-3.5" /> },
      { code: "homework-generator", label: "Homework Generator", href: "#", icon: <FileText className="w-3.5 h-3.5" /> },
    ],
  },
  {
    name: "Assessment",
    icon: <ClipboardCheck className="w-4 h-4" />,
    color: "text-purple-600",
    tools: [
      { code: "quiz-builder", label: "Quiz Builder", href: "/app/tools/quiz-builder", icon: <ClipboardCheck className="w-3.5 h-3.5" /> },
      { code: "assessment-generator", label: "Assessment Generator", href: "#", icon: <ClipboardCheck className="w-3.5 h-3.5" /> },
      { code: "rubric-builder", label: "Rubric Builder", href: "#", icon: <ClipboardCheck className="w-3.5 h-3.5" /> },
      { code: "exit-tickets", label: "Exit Ticket Generator", href: "#", icon: <ClipboardCheck className="w-3.5 h-3.5" /> },
    ],
  },
  {
    name: "Feedback",
    icon: <MessageSquare className="w-4 h-4" />,
    color: "text-amber-600",
    tools: [
      { code: "writing-feedback", label: "Writing Feedback Assistant", href: "#", icon: <MessageSquare className="w-3.5 h-3.5" /> },
      { code: "grammar-analysis", label: "Grammar Analysis", href: "#", icon: <MessageSquare className="w-3.5 h-3.5" /> },
      { code: "student-feedback", label: "Student Feedback Generator", href: "#", icon: <MessageSquare className="w-3.5 h-3.5" /> },
    ],
  },
  {
    name: "Communication",
    icon: <Mail className="w-4 h-4" />,
    color: "text-cyan-600",
    tools: [
      { code: "parent-letter", label: "Parent Letter Generator", href: "#", icon: <Mail className="w-3.5 h-3.5" /> },
      { code: "professional-email", label: "Professional Email Generator", href: "#", icon: <Mail className="w-3.5 h-3.5" /> },
      { code: "meeting-agenda", label: "Meeting Agenda Generator", href: "#", icon: <Mail className="w-3.5 h-3.5" /> },
    ],
  },
  {
    name: "Leadership",
    icon: <Building2 className="w-4 h-4" />,
    color: "text-rose-600",
    tools: [
      { code: "dept-report", label: "Department Report Generator", href: "#", icon: <Building2 className="w-3.5 h-3.5" /> },
      { code: "dept-improvement", label: "Department Improvement Planner", href: "#", icon: <Building2 className="w-3.5 h-3.5" /> },
      { code: "differentiation", label: "Differentiation Assistant", href: "#", icon: <GraduationCap className="w-3.5 h-3.5" /> },
    ],
  },
];

// ─── Breadcrumb ──────────────────────────────────────────────────────────────

interface BreadcrumbSegment {
  label: string;
  href?: string;
}

function useBreadcrumbs(): BreadcrumbSegment[] {
  const pathname = usePathname() ?? "/";
  const segments = pathname.split("/").filter(Boolean);

  const crumbs: BreadcrumbSegment[] = [{ label: "Home", href: "/app/tools" }];
  let currentPath = "";
  for (const segment of segments) {
    if (segment === "app" || segment === "tools") continue;
    currentPath += `/app/tools/${segment}`;
    // Find readable label
    const allTools = TOOL_CATEGORIES.flatMap((c) => c.tools);
    const tool = allTools.find((t) => t.code === segment);
    if (tool) {
      crumbs.push({ label: tool.label, href: currentPath });
    } else {
      crumbs.push({
        label: segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        href: currentPath,
      });
    }
  }

  // Mark the last one as current (no href)
  if (crumbs.length > 1) {
    crumbs[crumbs.length - 1].href = undefined;
  }

  return crumbs;
}

// ─── Layout ──────────────────────────────────────────────────────────────────

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const breadcrumbs = useBreadcrumbs();

  const allTools = TOOL_CATEGORIES.flatMap((c) => c.tools);
  const activeHref = pathname;
  const activeTool = allTools.find((t) => t.href === activeHref);

  return (
    <div className="min-h-screen bg-ivory/40">
      {/* Top Header */}
      <header className="bg-white border-b border-border sticky top-0 z-30">
        <div className="flex items-center h-14 px-6 gap-4">
          <Link href="/app/tools" className="flex items-center gap-2 mr-4">
            <div className="w-7 h-7 bg-navy rounded flex items-center justify-center">
              <span className="text-gold font-bold text-xs font-[family-name:var(--font-heading)]">F</span>
            </div>
            <span className="font-[family-name:var(--font-heading)] font-bold text-navy text-sm">Fidelis AI</span>
          </Link>

          {/* Breadcrumbs */}
          <nav className="hidden sm:flex items-center gap-1.5 text-sm text-charcoal-light">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="w-3 h-3" />}
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-navy transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-navy font-medium">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>

          {/* Active tool name on small screens */}
          {activeTool && (
            <span className="sm:hidden text-sm text-navy font-medium truncate ml-auto">
              {activeTool.label}
            </span>
          )}

          {/* Right area */}
          <div className="ml-auto flex items-center gap-3">
            <Link
              href="/"
              className="text-xs text-charcoal-light hover:text-navy transition-colors hidden sm:inline"
            >
              Back to Main Site
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0 bg-white border-r border-border hidden lg:block min-h-[calc(100vh-3.5rem)] overflow-y-auto sticky top-14">
          <nav className="py-4">
            {/* Overview link */}
            <Link
              href="/app/tools"
              className={cn(
                "flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition-colors mx-2 rounded-md",
                pathname === "/app/tools"
                  ? "bg-navy/10 text-navy"
                  : "text-charcoal-light hover:text-navy hover:bg-ivory"
              )}
            >
              <Home className="w-4 h-4" />
              All Tools
            </Link>

            <div className="border-t border-border my-3 mx-5" />

            {/* Category groups */}
            {TOOL_CATEGORIES.map((category) => {
              const anyActive = category.tools.some((t) => t.href === activeHref);
              return (
                <div key={category.name} className="mb-4">
                  <div className="flex items-center gap-2 px-5 mb-1">
                    <span className={cn("w-4 h-4", category.color)}>{category.icon}</span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-light">
                      {category.name}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    {category.tools.map((tool) => {
                      const isActive = tool.href === activeHref;
                      return (
                        <Link
                          key={tool.code}
                          href={tool.href}
                          className={cn(
                            "flex items-center gap-3 px-5 py-2 text-sm transition-colors mx-2 rounded-md",
                            isActive
                              ? "bg-gold/10 text-gold-dark font-semibold border-l-2 border-gold"
                              : "text-charcoal-light hover:text-navy hover:bg-ivory border-l-2 border-transparent"
                          )}
                        >
                          <span className={cn("flex-shrink-0", isActive ? "text-gold-dark" : "text-charcoal-light")}>
                            {tool.icon}
                          </span>
                          <span className="truncate">{tool.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>
        </aside>

        {/* Mobile category selector */}
        <div className="lg:hidden w-full sticky top-14 z-20 bg-white border-b border-border overflow-x-auto">
          <nav className="flex gap-1 p-2 min-w-max">
            <Link
              href="/app/tools"
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors",
                pathname === "/app/tools" ? "bg-navy text-white" : "bg-ivory text-charcoal-light hover:text-navy"
              )}
            >
              All Tools
            </Link>
            {allTools.map((tool) => {
              const isActive = tool.href === activeHref;
              return (
                <Link
                  key={tool.code}
                  href={tool.href}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors",
                    isActive ? "bg-gold text-white" : "bg-ivory text-charcoal-light hover:text-navy"
                  )}
                >
                  {tool.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main content */}
        <main className="flex-1 min-h-[calc(100vh-3.5rem)]">
          <div className="p-6 lg:p-8 max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  );
}