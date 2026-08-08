"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { TOOL_CATEGORIES } from "./layout";

const categoryIcons: Record<string, string> = {
  Planning: "📋",
  "Resource Creation": "📝",
  Assessment: "📊",
  Feedback: "💬",
  Communication: "📧",
  Leadership: "🏫",
};

export default function ToolsOverviewPage() {
  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <span className="text-gold text-xs font-semibold uppercase tracking-widest mb-2 block">
          AI Platform
        </span>
        <h1 className="text-3xl md:text-4xl font-[family-name:var(--font-heading)] font-bold text-navy mb-3">
          22 AI Tools for Teachers
        </h1>
        <p className="text-charcoal-light max-w-2xl">
          Structured tools designed for international school educators. No prompt engineering needed — 
          just fill in the form and get classroom-ready results in seconds.
        </p>
      </div>

      {/* How it works banner */}
      <div className="bg-navy/5 border border-navy/10 rounded-lg p-5 mb-8 flex flex-wrap items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 bg-gold text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
          <span className="text-charcoal">Choose a tool</span>
        </div>
        <div className="hidden sm:block w-px h-5 bg-border" />
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 bg-gold text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
          <span className="text-charcoal">Fill in the form</span>
        </div>
        <div className="hidden sm:block w-px h-5 bg-border" />
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 bg-gold text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
          <span className="text-charcoal">Generate with AI</span>
        </div>
        <div className="hidden sm:block w-px h-5 bg-border" />
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 bg-gold text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
          <span className="text-charcoal">Refine in one click</span>
        </div>
      </div>

      {/* Category grid */}
      <div className="grid gap-8">
        {TOOL_CATEGORIES.map((category) => (
          <section key={category.name}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{categoryIcons[category.name] ?? "🔧"}</span>
              <h2 className="text-xl font-[family-name:var(--font-heading)] font-bold text-navy">
                {category.name}
              </h2>
              <span className="text-xs text-charcoal-light bg-ivory px-2 py-0.5 rounded-full">
                {category.tools.length} tools
              </span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {category.tools.map((tool) => (
                <Link key={tool.code} href={tool.href}>
                  <Card
                    variant="default"
                    padding="md"
                    className="h-full cursor-pointer hover:shadow-md hover:border-navy/20 transition-all duration-200 group"
                  >
                    <CardHeader className="mb-2">
                      <div className="flex items-center gap-2">
                        <span className={cn("w-8 h-8 rounded-lg bg-ivory flex items-center justify-center group-hover:bg-gold/10 transition-colors", category.color)}>
                          {tool.icon}
                        </span>
                        <CardTitle className="text-sm font-[family-name:var(--font-body)] font-semibold text-navy">
                          {tool.label}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-charcoal-light line-clamp-2">
                        Generate {tool.label.toLowerCase()} content with AI-powered structured forms.
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}