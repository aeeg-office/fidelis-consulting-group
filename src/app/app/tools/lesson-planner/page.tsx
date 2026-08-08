"use client";

import { useState, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  Loader2,
  Sparkles,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  FileText,
  Check,
  AlertCircle,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface FormState {
  topic: string;
  grade_level: string;
  duration: string;
  curriculum: string;
  resources: string[];
  differentiation: string[];
}

interface ResultState {
  content: string;
  model: string;
  cached: boolean;
  loading: boolean;
  error: string | null;
}

// ─── Field Options ───────────────────────────────────────────────────────────

const GRADE_LEVELS = [
  "Early Years (Ages 3-5)",
  "Foundation (Ages 5-6)",
  "Year 1 (Ages 6-7)",
  "Year 2 (Ages 7-8)",
  "Year 3 (Ages 8-9)",
  "Year 4 (Ages 9-10)",
  "Year 5 (Ages 10-11)",
  "Year 6 (Ages 11-12)",
  "Year 7 (Ages 12-13)",
  "Year 8 (Ages 13-14)",
  "Year 9 (Ages 14-15)",
  "Year 10 (Ages 15-16)",
  "Year 11 (Ages 16-17)",
  "Year 12 (Ages 17-18)",
  "Year 13 (Ages 18-19)",
];

const DURATIONS = [
  "30 minutes",
  "45 minutes",
  "60 minutes",
  "75 minutes",
  "90 minutes",
  "2 hours",
  "Double period (100 min)",
  "Half day",
  "Full day",
];

const CURRICULA = [
  "National Curriculum for England",
  "International Baccalaureate (IB) PYP",
  "International Baccalaureate (IB) MYP",
  "International Baccalaureate (IB) DP",
  "International Baccalaureate (IB) CP",
  "Cambridge IGCSE",
  "Cambridge International A Level",
  "American Common Core",
  "American Advanced Placement (AP)",
  "International Primary Curriculum (IPC)",
  "International Middle Years Curriculum (IMYC)",
  "British Columbia (Canada) Curriculum",
  "Australian Curriculum",
  "Indian CBSE Curriculum",
  "Indian ICSE Curriculum",
  "UAE Ministry of Education (MOE) Curriculum",
  "Qatar National Curriculum",
  "Saudi National Curriculum",
  "Egyptian National Curriculum",
  "Custom / School-based Curriculum",
];

const RESOURCE_OPTIONS = [
  "Textbook / Coursebook",
  "Whiteboard / Interactive Board",
  "Worksheets / Handouts",
  "Digital Devices (Tablets/Laptops)",
  "Projector / Visualiser",
  "Lab Equipment",
  "Art Supplies",
  "Manipulatives (Maths)",
  "Library Books",
  "Online Learning Platform",
  "Video / Audio Materials",
  "Flashcards / Visual Aids",
  "Realia (Real Objects)",
  "Game-based Learning Tools",
  "None Required",
];

const DIFFERENTIATION_OPTIONS = [
  "EAL / ELL Support",
  "SEND / SEN Support",
  "Gifted & Talented Extension",
  "Mixed Ability Grouping",
  "Learning Support Assistants",
  "Scaffolded Worksheets",
  "Visual Supports",
  "Peer Tutoring / Buddy System",
  "Choice Boards",
  "Flexible Seating",
  "Modified Assessment",
  "Additional Time",
];

// ─── Help Tooltip ────────────────────────────────────────────────────────────

function HelpTooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="text-charcoal-light hover:text-navy transition-colors focus:outline-none"
        aria-label="Help"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>
      {open && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-charcoal text-white text-xs rounded-lg p-3 shadow-lg z-50">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-charcoal" />
        </div>
      )}
    </span>
  );
}

// ─── Multi-select Dropdown ───────────────────────────────────────────────────

function MultiSelect({
  label,
  options,
  selected,
  onChange,
  helpText,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  helpText?: string;
}) {
  const [open, setOpen] = useState(false);

  const toggle = useCallback(
    (option: string) => {
      if (selected.includes(option)) {
        onChange(selected.filter((s) => s !== option));
      } else {
        onChange([...selected, option]);
      }
    },
    [selected, onChange]
  );

  return (
    <div className="relative">
      <div className="flex items-center gap-1.5 mb-1.5">
        <label className="block text-sm font-medium text-charcoal">{label}</label>
        {helpText && <HelpTooltip text={helpText} />}
      </div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full flex items-center justify-between px-4 py-2.5 text-sm rounded-lg border transition-all text-left",
          open
            ? "border-navy/30 bg-white shadow-sm"
            : "border-border bg-white hover:border-navy/20"
        )}
      >
        <span className={selected.length === 0 ? "text-charcoal-light" : "text-charcoal"}>
          {selected.length === 0
            ? `Select ${label.toLowerCase()}...`
            : `${selected.length} selected`}
        </span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-charcoal-light" />
        ) : (
          <ChevronDown className="w-4 h-4 text-charcoal-light" />
        )}
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-lg shadow-lg z-40 max-h-56 overflow-y-auto">
          {options.map((option) => {
            const isSelected = selected.includes(option);
            return (
              <button
                key={option}
                type="button"
                onClick={() => toggle(option)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2 text-sm text-left transition-colors",
                  isSelected ? "bg-gold/5 text-navy" : "text-charcoal hover:bg-ivory"
                )}
              >
                <span
                  className={cn(
                    "w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors",
                    isSelected ? "bg-gold border-gold text-white" : "border-border"
                  )}
                >
                  {isSelected && <Check className="w-3 h-3" />}
                </span>
                {option}
              </button>
            );
          })}
        </div>
      )}
      {/* Selected tags */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selected.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-ivory text-charcoal text-xs rounded-full"
            >
              {s}
              <button
                type="button"
                onClick={() => toggle(s)}
                className="text-charcoal-light hover:text-charcoal"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Select Dropdown ─────────────────────────────────────────────────────────

function Select({
  label,
  options,
  value,
  onChange,
  helpText,
  placeholder,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  helpText?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5">
        <label className="block text-sm font-medium text-charcoal">{label}</label>
        {helpText && <HelpTooltip text={helpText} />}
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-white transition-all appearance-none",
          "focus:border-navy/30 focus:ring-1 focus:ring-navy/10 focus:outline-none",
          "hover:border-navy/20",
          !value && "text-charcoal-light"
        )}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%235A5A5A' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 0.75rem center",
          backgroundSize: "16px 12px",
          paddingRight: "2.5rem",
        }}
      >
        <option value="" disabled>
          {placeholder ?? `Select ${label.toLowerCase()}...`}
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

// ─── Lesson Planner Page ─────────────────────────────────────────────────────

export default function LessonPlannerPage() {
  const [form, setForm] = useState<FormState>({
    topic: "",
    grade_level: "",
    duration: "",
    curriculum: "",
    resources: [],
    differentiation: [],
  });

  const [result, setResult] = useState<ResultState>({
    content: "",
    model: "",
    cached: false,
    loading: false,
    error: null,
  });

  const [refinementPrompt, setRefinementPrompt] = useState<string | null>(null);

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const isFormValid = form.topic.trim().length >= 2 && form.grade_level && form.duration && form.curriculum;

  const generate = useCallback(
    async (overrideParams?: Partial<FormState>) => {
      setResult((prev) => ({ ...prev, loading: true, error: null, content: "" }));

      const params = { ...form, ...overrideParams };

      try {
        const response = await fetch("/api/ai/lesson-planner", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ params }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? "Failed to generate lesson plan");
        }

        setResult({
          content: data.content,
          model: data.model,
          cached: data.cached,
          loading: false,
          error: null,
        });
      } catch (err) {
        setResult((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : "An unexpected error occurred",
        }));
      }
    },
    [form]
  );

  const handleRefine = useCallback(
    async (instruction: string) => {
      setRefinementPrompt(instruction);
      setResult((prev) => ({ ...prev, loading: true, error: null }));

      const params = {
        ...form,
        refinement: instruction,
        previous_content: result.content,
      };

      try {
        const response = await fetch("/api/ai/lesson-planner", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ params }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? "Failed to refine lesson plan");
        }

        setResult({
          content: data.content,
          model: data.model,
          cached: data.cached,
          loading: false,
          error: null,
        });
      } catch (err) {
        setResult((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : "An unexpected error occurred",
        }));
      }
    },
    [form, result.content]
  );

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center text-gold">
            <FileText className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-2xl font-[family-name:var(--font-heading)] font-bold text-navy">
              Lesson Planner
            </h1>
            <p className="text-sm text-charcoal-light">
              Generate a complete, structured lesson plan in seconds
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card variant="default" padding="lg">
            <CardHeader className="mb-5">
              <CardTitle className="text-base font-[family-name:var(--font-body)] font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gold" />
                Lesson Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  generate();
                }}
                className="space-y-5"
              >
                {/* Topic (free text) */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <label className="block text-sm font-medium text-charcoal">
                      Topic
                    </label>
                    <HelpTooltip text="What subject or concept will this lesson cover? Be specific for best results." />
                  </div>
                  <input
                    type="text"
                    value={form.topic}
                    onChange={(e) => updateField("topic", e.target.value)}
                    placeholder="e.g. The Water Cycle, Quadratic Equations, World War II..."
                    className={cn(
                      "w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-white transition-all",
                      "focus:border-navy/30 focus:ring-1 focus:ring-navy/10 focus:outline-none",
                      "hover:border-navy/20 placeholder:text-charcoal-light/50"
                    )}
                  />
                </div>

                <Select
                  label="Grade Level"
                  options={GRADE_LEVELS}
                  value={form.grade_level}
                  onChange={(v) => updateField("grade_level", v)}
                  helpText="Select the year group or age range for this lesson."
                />

                <Select
                  label="Duration"
                  options={DURATIONS}
                  value={form.duration}
                  onChange={(v) => updateField("duration", v)}
                  helpText="How long is your lesson or class period?"
                />

                <Select
                  label="Curriculum"
                  options={CURRICULA}
                  value={form.curriculum}
                  onChange={(v) => updateField("curriculum", v)}
                  helpText="Which curriculum framework are you aligning to?"
                />

                <MultiSelect
                  label="Resources"
                  options={RESOURCE_OPTIONS}
                  selected={form.resources}
                  onChange={(v) => updateField("resources", v)}
                  helpText="What materials and resources are available for this lesson?"
                />

                <MultiSelect
                  label="Differentiation"
                  options={DIFFERENTIATION_OPTIONS}
                  selected={form.differentiation}
                  onChange={(v) => updateField("differentiation", v)}
                  helpText="Select the differentiation strategies you need."
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={!isFormValid || result.loading}
                >
                  {result.loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Lesson Plan
                    </>
                  )}
                </Button>

                {!isFormValid && (
                  <p className="text-xs text-charcoal-light text-center">
                    Please fill in Topic, Grade Level, Duration, and Curriculum.
                  </p>
                )}
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Result */}
        <div className="lg:col-span-3">
          {/* Loading state */}
          {result.loading && (
            <Card variant="default" padding="lg">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center mb-4">
                  <Loader2 className="w-6 h-6 text-gold animate-spin" />
                </div>
                <p className="text-charcoal font-medium mb-1">Generating your lesson plan...</p>
                <p className="text-sm text-charcoal-light">This usually takes a few seconds</p>
              </div>
            </Card>
          )}

          {/* Error state */}
          {result.error && !result.loading && (
            <Card variant="default" padding="lg" className="border-error/20">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-charcoal mb-1">Generation Failed</h3>
                  <p className="text-sm text-charcoal-light">{result.error}</p>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-3"
                    onClick={() => generate()}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Try Again
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Result content */}
          {result.content && !result.loading && (
            <Card variant="elevated" padding="lg">
              <CardHeader className="mb-4 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gold" />
                  <CardTitle className="text-base font-[family-name:var(--font-body)] font-semibold">
                    Your Lesson Plan
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  {result.cached && (
                    <span className="text-xs text-charcoal-light bg-ivory px-2 py-0.5 rounded-full">
                      Cached
                    </span>
                  )}
                  <span className="text-xs text-charcoal-light bg-ivory px-2 py-0.5 rounded-full">
                    {result.model}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none text-charcoal [&_h2]:text-lg [&_h2]:font-[family-name:var(--font-heading)] [&_h2]:font-bold [&_h2]:text-navy [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-navy [&_h3]:mt-4 [&_h3]:mb-2 [&_table]:text-sm [&_table]:border-collapse [&_table]:w-full [&_th]:bg-ivory [&_th]:text-left [&_th]:px-3 [&_th]:py-2 [&_th]:font-medium [&_th]:text-charcoal [&_th]:border [&_th]:border-border [&_td]:px-3 [&_td]:py-2 [&_td]:border [&_td]:border-border [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 [&_p]:mb-2 [&_strong]:text-charcoal">
                  <div dangerouslySetInnerHTML={{ __html: result.content.replace(/\n/g, "<br/>") }} />
                </div>
              </CardContent>

              {/* Refinement buttons */}
              <div className="border-t border-border mt-6 pt-6">
                <p className="text-xs text-charcoal-light font-medium mb-3 uppercase tracking-wider">
                  Refine
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleRefine("Make this lesson plan simpler and more accessible for students who need extra support.")}
                    disabled={result.loading}
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                    Make Simpler
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleRefine("Add more detail to this lesson plan. Include more specific activities, timings, and differentiation strategies.")}
                    disabled={result.loading}
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                    Add More Detail
                  </Button>
                  <Button
                    variant="goldOutline"
                    size="sm"
                    onClick={() => generate()}
                    disabled={result.loading}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Regenerate
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Empty state */}
          {!result.content && !result.loading && !result.error && (
            <Card variant="default" padding="lg">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-ivory rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-charcoal-light" />
                </div>
                <h3 className="text-lg font-[family-name:var(--font-heading)] font-bold text-navy mb-2">
                  Ready to plan your lesson?
                </h3>
                <p className="text-sm text-charcoal-light max-w-sm">
                  Fill in the details on the left and click "Generate Lesson Plan" to create a complete, structured lesson plan with AI.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}