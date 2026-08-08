"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  FileText,
  Video,
  Download,
  BookOpen,
  Sparkles,
  GraduationCap,
  ArrowLeft,
  CheckCircle,
  ChevronRight,
  Presentation,
  PenTool,
  Globe,
} from "lucide-react";

interface Workshop {
  id: number;
  title: string;
  track: string;
  trackLabel: string;
  description: string;
  longDescription: string;
  date: string;
  endDate: string;
  duration: string;
  price: string;
  instructor: string;
  instructorRole: string;
  enrolled: number;
  capacity: number;
  location: string;
  format: string;
  level: string;
  tags: string[];
  materials: {
    type: "slides" | "workbook" | "template" | "video";
    label: string;
    description: string;
  }[];
  relatedTools: {
    name: string;
    description: string;
    icon: typeof Sparkles;
    color: string;
  }[];
}

const workshopData: Record<number, Workshop> = {
  1: {
    id: 1,
    title: "AI-Powered Lesson Planning",
    track: "ai-for-educators",
    trackLabel: "AI for Educators",
    description:
      "Learn to leverage AI tools for creating engaging, standards-aligned lesson plans in minutes.",
    longDescription:
      "This hands-on workshop explores how artificial intelligence can transform your lesson planning workflow. You'll learn to use cutting-edge AI tools to generate differentiated lesson plans, create engaging activities, and align your instruction with curriculum standards — all in a fraction of the usual time. Through guided practice and real classroom examples, you'll leave with a toolkit of AI prompts and workflows ready for Monday morning.",
    date: "August 15, 2026",
    endDate: "August 15, 2026",
    duration: "90 minutes",
    price: "Free",
    instructor: "Dr. Sarah Chen",
    instructorRole: "AI in Education Specialist",
    enrolled: 24,
    capacity: 40,
    location: "Online — Zoom",
    format: "Live Session",
    level: "Beginner — Intermediate",
    tags: ["AI", "Lesson Planning", "Differentiation", "Curriculum Design"],
    materials: [
      {
        type: "slides",
        label: "Presentation Slides (PDF)",
        description: "Full slide deck with workshop content",
      },
      {
        type: "workbook",
        label: "AI Prompt Workbook",
        description: "50+ tested prompts for lesson planning",
      },
      {
        type: "template",
        label: "Lesson Plan Template",
        description: "AI-optimized lesson plan template",
      },
      {
        type: "video",
        label: "Workshop Recording",
        description: "Full session recording for review",
      },
    ],
    relatedTools: [
      {
        name: "Lesson Plan Generator",
        description: "Create standards-aligned plans in seconds",
        icon: FileText,
        color: "text-blue-600 bg-blue-50",
      },
      {
        name: "Rubric Designer",
        description: "Build custom assessment rubrics",
        icon: PenTool,
        color: "text-amber-600 bg-amber-50",
      },
      {
        name: "Content Translator",
        description: "Translate materials between EN/AR",
        icon: Globe,
        color: "text-emerald-600 bg-emerald-50",
      },
    ],
  },
  2: {
    id: 2,
    title: "English Through Digital Storytelling",
    track: "english-teaching",
    trackLabel: "English Teaching",
    description:
      "Discover how digital storytelling tools can transform your English language classroom.",
    longDescription:
      "Digital storytelling combines the ancient art of narrative with modern technology to create powerful learning experiences. In this workshop, you'll explore platforms and techniques for guiding students through the process of creating their own digital stories — from scriptwriting and storyboarding to recording and publishing. You'll see examples from international school classrooms and leave with ready-to-use project templates.",
    date: "August 22, 2026",
    endDate: "August 22, 2026",
    duration: "120 minutes",
    price: "$49",
    instructor: "Prof. James Mitchell",
    instructorRole: "English Language Pedagogy Lead",
    enrolled: 18,
    capacity: 35,
    location: "Online — Zoom",
    format: "Live Session",
    level: "Intermediate",
    tags: ["Digital Storytelling", "EdTech", "Writing", "Speaking"],
    materials: [
      {
        type: "slides",
        label: "Presentation Slides (PDF)",
        description: "Full slide deck with workshop content",
      },
      {
        type: "workbook",
        label: "Storytelling Project Guide",
        description: "Step-by-step student project guide",
      },
      {
        type: "template",
        label: "Storyboard Template",
        description: "Ready-to-use storyboard worksheets",
      },
      {
        type: "video",
        label: "Student Work Examples",
        description: "Showcase of student digital stories",
      },
    ],
    relatedTools: [
      {
        name: "Video Assistant",
        description: "Create educational video content",
        icon: Video,
        color: "text-rose-600 bg-rose-50",
      },
      {
        name: "Content Translator",
        description: "Translate materials between EN/AR",
        icon: Globe,
        color: "text-emerald-600 bg-emerald-50",
      },
    ],
  },
};

const materialIcons = {
  slides: Presentation,
  workbook: BookOpen,
  template: FileText,
  video: Video,
} as const;

const materialColors = {
  slides: "text-blue-600 bg-blue-50",
  workbook: "text-purple-600 bg-purple-50",
  template: "text-emerald-600 bg-emerald-50",
  video: "text-rose-600 bg-rose-50",
} as const;

export default function WorkshopDetailPage() {
  const params = useParams();
  const id = Number(params?.id);
  const workshop = workshopData[id];

  if (!workshop) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 bg-ivory rounded-full flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-8 h-8 text-charcoal-light" />
        </div>
        <h1 className="text-2xl font-[family-name:var(--font-heading)] font-bold text-navy">
          Workshop Not Found
        </h1>
        <p className="text-charcoal-light mt-2">
          The workshop you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Link href="/app/workshops">
          <Button variant="navy" className="mt-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Workshops
          </Button>
        </Link>
      </div>
    );
  }

  const isAi = workshop.track === "ai-for-educators";

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-charcoal-light">
        <Link href="/app/dashboard" className="hover:text-navy transition-colors">
          Dashboard
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/app/workshops" className="hover:text-navy transition-colors">
          Workshops
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-navy font-medium truncate">{workshop.title}</span>
      </div>

      {/* Hero section */}
      <div className="bg-gradient-to-br from-navy to-navy-light rounded-xl p-6 md:p-8 text-white">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex-1">
            {/* Track badge */}
            <span
              className={`inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider rounded-full px-3 py-1 ${
                isAi
                  ? "text-amber-300 bg-amber-500/15"
                  : "text-blue-300 bg-blue-500/15"
              }`}
            >
              {isAi ? (
                <Sparkles className="w-3.5 h-3.5" />
              ) : (
                <GraduationCap className="w-3.5 h-3.5" />
              )}
              {workshop.trackLabel}
            </span>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-[family-name:var(--font-heading)] font-bold mt-3">
              {workshop.title}
            </h1>
            <p className="text-white/70 mt-2 text-sm md:text-base max-w-2xl">
              {workshop.description}
            </p>

            {/* Quick info chips */}
            <div className="flex flex-wrap gap-3 mt-4">
              <div className="flex items-center gap-1.5 text-xs text-white/70 bg-white/10 rounded-full px-3 py-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {workshop.date}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-white/70 bg-white/10 rounded-full px-3 py-1.5">
                <Clock className="w-3.5 h-3.5" />
                {workshop.duration}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-white/70 bg-white/10 rounded-full px-3 py-1.5">
                <MapPin className="w-3.5 h-3.5" />
                {workshop.location}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-white/70 bg-white/10 rounded-full px-3 py-1.5">
                <Users className="w-3.5 h-3.5" />
                {workshop.enrolled} / {workshop.capacity} enrolled
              </div>
            </div>
          </div>

          {/* Price + CTA */}
          <div className="lg:text-right shrink-0">
            <p className="text-3xl font-bold font-[family-name:var(--font-heading)]">
              {workshop.price === "Free" ? (
                <span className="text-success">Free</span>
              ) : (
                workshop.price
              )}
            </p>
            <p className="text-white/50 text-sm mt-1">per participant</p>
            <Button
              variant="primary"
              size="lg"
              className="mt-4 w-full lg:w-auto"
            >
              Enroll Now
            </Button>
          </div>
        </div>
      </div>

      {/* Instructor info */}
      <Card variant="bordered" padding="md">
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-navy rounded-full flex items-center justify-center shrink-0">
              <span className="text-gold font-bold text-lg font-[family-name:var(--font-heading)]">
                {workshop.instructor.split(" ").map((n) => n[0]).join("")}
              </span>
            </div>
            <div>
              <p className="font-semibold text-navy">{workshop.instructor}</p>
              <p className="text-sm text-charcoal-light">{workshop.instructorRole}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs text-charcoal-light">{workshop.format}</p>
              <p className="text-xs text-charcoal-light">{workshop.level}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Details + Materials */}
        <div className="lg:col-span-2 space-y-6">
          {/* About this workshop */}
          <Card variant="bordered" padding="md">
            <CardContent>
              <h2 className="text-xl font-[family-name:var(--font-heading)] font-bold text-navy mb-3">
                About This Workshop
              </h2>
              <p className="text-charcoal leading-relaxed">
                {workshop.longDescription}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                {workshop.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-medium text-navy bg-ivory rounded-full px-3 py-1"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Materials */}
          <Card variant="bordered" padding="md">
            <CardContent>
              <h2 className="text-xl font-[family-name:var(--font-heading)] font-bold text-navy mb-4">
                Workshop Materials
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {workshop.materials.map((material) => {
                  const Icon = materialIcons[material.type];
                  return (
                    <div
                      key={material.label}
                      className="flex items-start gap-3 p-3 rounded-lg bg-ivory/50 hover:bg-ivory transition-colors cursor-pointer group"
                    >
                      <div
                        className={`p-2 rounded-lg shrink-0 ${
                          materialColors[material.type]
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-navy group-hover:text-gold transition-colors">
                          {material.label}
                        </p>
                        <p className="text-xs text-charcoal-light">
                          {material.description}
                        </p>
                      </div>
                      <Download className="w-4 h-4 text-charcoal-light shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Related AI Tools */}
        <div className="space-y-6">
          <Card variant="bordered" padding="md">
            <CardContent>
              <h2 className="text-lg font-[family-name:var(--font-heading)] font-bold text-navy mb-4">
                Related AI Tools
              </h2>
              <div className="space-y-3">
                {workshop.relatedTools.map((tool) => (
                  <div
                    key={tool.name}
                    className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-gold/30 transition-colors cursor-pointer"
                  >
                    <div className={`p-2 rounded-lg shrink-0 ${tool.color}`}>
                      <tool.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-navy">
                        {tool.name}
                      </p>
                      <p className="text-xs text-charcoal-light">
                        {tool.description}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-charcoal-light shrink-0 mt-0.5" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* What you'll learn */}
          <Card variant="bordered" padding="md">
            <CardContent>
              <h2 className="text-lg font-[family-name:var(--font-heading)] font-bold text-navy mb-4">
                What You&apos;ll Learn
              </h2>
              <ul className="space-y-3">
                {[
                  "Create AI-powered lesson plans aligned to standards",
                  "Differentiate instruction for diverse learners",
                  "Integrate AI tools into existing curriculum",
                  "Assess AI-generated content for quality and bias",
                  "Build reusable AI prompt libraries for your team",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-charcoal">
                    <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}