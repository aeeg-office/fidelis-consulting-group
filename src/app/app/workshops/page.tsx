"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Search,
  Clock,
  Calendar,
  Tag,
  Filter,
  GraduationCap,
  Sparkles,
  MapPin,
  Users,
} from "lucide-react";

type Track = "all" | "english-teaching" | "ai-for-educators";

interface Workshop {
  id: number;
  title: string;
  track: "english-teaching" | "ai-for-educators";
  trackLabel: string;
  date: string;
  duration: string;
  price: string;
  description: string;
  instructor: string;
  enrolled: number;
  capacity: number;
}

const workshops: Workshop[] = [
  {
    id: 1,
    title: "AI-Powered Lesson Planning",
    track: "ai-for-educators",
    trackLabel: "AI for Educators",
    date: "Aug 15, 2026",
    duration: "90 min",
    price: "Free",
    description:
      "Learn to leverage AI tools for creating engaging, standards-aligned lesson plans in minutes.",
    instructor: "Dr. Sarah Chen",
    enrolled: 24,
    capacity: 40,
  },
  {
    id: 2,
    title: "English Through Digital Storytelling",
    track: "english-teaching",
    trackLabel: "English Teaching",
    date: "Aug 22, 2026",
    duration: "120 min",
    price: "$49",
    description:
      "Discover how digital storytelling tools can transform your English language classroom.",
    instructor: "Prof. James Mitchell",
    enrolled: 18,
    capacity: 35,
  },
  {
    id: 3,
    title: "Differentiation with AI Tools",
    track: "ai-for-educators",
    trackLabel: "AI for Educators",
    date: "Sep 5, 2026",
    duration: "90 min",
    price: "Free",
    description:
      "Master differentiated instruction techniques powered by adaptive AI technologies.",
    instructor: "Dr. Sarah Chen",
    enrolled: 31,
    capacity: 40,
  },
  {
    id: 4,
    title: "Teaching Grammar Through Literature",
    track: "english-teaching",
    trackLabel: "English Teaching",
    date: "Sep 12, 2026",
    duration: "90 min",
    price: "$49",
    description:
      "Explore innovative approaches to teaching grammar using authentic literary texts.",
    instructor: "Prof. James Mitchell",
    enrolled: 12,
    capacity: 35,
  },
  {
    id: 5,
    title: "AI Assessment & Feedback Systems",
    track: "ai-for-educators",
    trackLabel: "AI for Educators",
    date: "Sep 19, 2026",
    duration: "120 min",
    price: "$79",
    description:
      "Implement AI-driven assessment tools that provide instant, personalized student feedback.",
    instructor: "Dr. Amina Al-Rashid",
    enrolled: 22,
    capacity: 30,
  },
  {
    id: 6,
    title: "Academic Writing Workshop",
    track: "english-teaching",
    trackLabel: "English Teaching",
    date: "Oct 3, 2026",
    duration: "90 min",
    price: "Free",
    description:
      "Develop strategies for teaching academic writing skills to upper-secondary students.",
    instructor: "Dr. Sarah Chen",
    enrolled: 9,
    capacity: 35,
  },
  {
    id: 7,
    title: "AI for Classroom Management",
    track: "ai-for-educators",
    trackLabel: "AI for Educators",
    date: "Oct 10, 2026",
    duration: "90 min",
    price: "$49",
    description:
      "Use AI tools to streamline classroom management and track student engagement patterns.",
    instructor: "Dr. Amina Al-Rashid",
    enrolled: 27,
    capacity: 40,
  },
  {
    id: 8,
    title: "Developing Critical Thinkers",
    track: "english-teaching",
    trackLabel: "English Teaching",
    date: "Oct 17, 2026",
    duration: "120 min",
    price: "$79",
    description:
      "Build lesson sequences that foster critical thinking and analytical skills in English.",
    instructor: "Prof. James Mitchell",
    enrolled: 15,
    capacity: 35,
  },
];

const TrackBadge = ({ track }: { track: string }) => {
  const isAi = track === "ai-for-educators";
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider rounded-full px-2.5 py-0.5 ${
        isAi
          ? "text-amber-700 bg-amber-50 border border-amber-200"
          : "text-blue-700 bg-blue-50 border border-blue-200"
      }`}
    >
      {isAi ? <Sparkles className="w-3 h-3" /> : <GraduationCap className="w-3 h-3" />}
      {isAi ? "AI for Educators" : "English Teaching"}
    </span>
  );
};

export default function WorkshopsPage() {
  const [activeTrack, setActiveTrack] = useState<Track>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredWorkshops = workshops.filter((w) => {
    const matchesTrack = activeTrack === "all" || w.track === activeTrack;
    const matchesSearch =
      w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTrack && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-[family-name:var(--font-heading)] font-bold text-navy">
          Professional Development Workshops
        </h1>
        <p className="text-charcoal-light mt-1">
          Browse and enroll in workshops designed for international school educators.
        </p>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Track filter chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-charcoal-light flex items-center gap-1">
            <Filter className="w-4 h-4" />
            Track:
          </span>
          {[
            { value: "all" as Track, label: "All Workshops" },
            { value: "english-teaching" as Track, label: "English Teaching" },
            { value: "ai-for-educators" as Track, label: "AI for Educators" },
          ].map((track) => (
            <button
              key={track.value}
              onClick={() => setActiveTrack(track.value)}
              className={`px-3 py-1.5 text-sm font-medium rounded-full border transition-all duration-200 ${
                activeTrack === track.value
                  ? "bg-navy text-white border-navy"
                  : "bg-white text-charcoal-light border-border hover:border-navy/30 hover:text-navy"
              }`}
            >
              {track.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 sm:max-w-xs sm:ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-light" />
          <input
            type="text"
            placeholder="Search workshops..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy text-charcoal placeholder:text-charcoal-light/60"
          />
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-charcoal-light">
        Showing {filteredWorkshops.length} of {workshops.length} workshops
      </p>

      {/* Workshop grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredWorkshops.map((workshop) => (
          <Card
            key={workshop.id}
            variant="bordered"
            padding="md"
            className="flex flex-col hover:shadow-lg transition-all duration-200 group"
          >
            <CardContent className="flex flex-col h-full">
              {/* Track badge */}
              <div className="mb-3">
                <TrackBadge track={workshop.track} />
              </div>

              {/* Title */}
              <h3 className="text-lg font-[family-name:var(--font-heading)] font-bold text-navy group-hover:text-gold transition-colors">
                <Link href={`/app/workshops/${workshop.id}`}>
                  {workshop.title}
                </Link>
              </h3>

              {/* Description */}
              <p className="text-sm text-charcoal-light mt-2 leading-relaxed flex-1">
                {workshop.description}
              </p>

              {/* Meta info */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-xs text-charcoal-light">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span>{workshop.date}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-charcoal-light">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span>{workshop.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-charcoal-light">
                  <Users className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {workshop.enrolled} / {workshop.capacity} enrolled
                  </span>
                </div>
              </div>

              {/* Bottom: price + enroll */}
              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                <span className="text-lg font-bold text-navy font-[family-name:var(--font-heading)]">
                  {workshop.price === "Free" ? (
                    <span className="text-success">Free</span>
                  ) : (
                    workshop.price
                  )}
                </span>
                <Link href={`/app/workshops/${workshop.id}`}>
                  <Button variant="navy" size="sm">
                    Enroll Now
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state */}
      {filteredWorkshops.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-ivory rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-6 h-6 text-charcoal-light" />
          </div>
          <h3 className="text-lg font-[family-name:var(--font-heading)] font-bold text-navy">
            No workshops found
          </h3>
          <p className="text-sm text-charcoal-light mt-1">
            Try adjusting your search or filter criteria.
          </p>
          <Button
            variant="secondary"
            className="mt-4"
            onClick={() => {
              setSearchQuery("");
              setActiveTrack("all");
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}