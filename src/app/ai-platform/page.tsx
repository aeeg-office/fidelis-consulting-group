import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Platform for Teachers",
  description:
    "Structured AI tools for teachers: lesson planning, assessment, rubrics, feedback, and more. Designed for international school educators.",
};

const tools = [
  { category: "Planning", icon: "📋", items: ["Lesson Planner", "Unit Planner", "Learning Objective Generator", "Success Criteria Generator"] },
  { category: "Resource Creation", icon: "📝", items: ["Worksheet Builder", "Reading Passage Generator", "Writing Prompt Generator", "Homework Generator"] },
  { category: "Assessment", icon: "📊", items: ["Quiz Builder", "Assessment Generator", "Rubric Builder", "Exit Ticket Generator"] },
  { category: "Feedback", icon: "💬", items: ["Writing Feedback Assistant", "Grammar Analysis", "Student Feedback Generator"] },
  { category: "Communication", icon: "📧", items: ["Parent Letter Generator", "Professional Email Generator", "Meeting Agenda Generator"] },
  { category: "Leadership", icon: "🏫", items: ["Department Report Generator", "Department Improvement Planner", "Differentiation Assistant"] },
];

export default function AIPlatformPage() {
  return (
    <>
      <Header />
      <main>
        <section className="bg-ivory">
          <div className="container-wide py-20 md:py-28">
            <div className="max-w-3xl mx-auto text-center">
              <span className="text-gold text-sm font-semibold uppercase tracking-widest mb-4 block">
                AI Platform
              </span>
              <h1 className="text-4xl md:text-5xl font-[family-name:var(--font-heading)] font-bold text-navy mb-6">
                AI that feels like software, not chat
              </h1>
              <p className="text-lg text-charcoal-light leading-relaxed max-w-2xl mx-auto mb-8">
                No prompt engineering. No chatbots. Just structured tools with
                dropdowns, forms, and one-click refinement. Built for teachers
                who want results, not experimentation.
              </p>
              <a
                href="/contact"
                className="inline-flex items-center justify-center h-13 px-8 bg-navy text-white font-semibold rounded-lg hover:bg-navy-light transition-all duration-200 text-lg"
              >
                Request Early Access
              </a>
            </div>
          </div>
        </section>

        {/* Tools Grid */}
        <section className="py-20 md:py-28">
          <div className="container-wide">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-[family-name:var(--font-heading)] font-bold text-navy mb-4">
                Guided tools. One platform.
              </h2>
              <p className="text-charcoal-light max-w-xl mx-auto">
                Every tool is designed around a structured form — select your
                options, click generate, and get classroom-ready results in
                seconds.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.map((category) => (
                <div key={category.category} className="bg-white border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{category.icon}</span>
                    <h3 className="text-lg font-[family-name:var(--font-heading)] font-bold text-navy">
                      {category.category}
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {category.items.map((item) => (
                      <li key={item} className="text-charcoal-light text-sm flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-gold rounded-full flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="bg-ivory py-20 md:py-28">
          <div className="container-wide">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-[family-name:var(--font-heading)] font-bold text-navy mb-4">
                How it works
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                { step: "01", title: "Fill in the form", desc: "Select your options from dropdowns and menus. No blank text boxes, no prompt engineering." },
                { step: "02", title: "Generate with AI", desc: "Click generate. Our AI routing engine selects the best model for your task." },
                { step: "03", title: "Refine in one click", desc: "Not quite right? Click refine, regenerate, or adjust — all without writing a single prompt." },
              ].map((s) => (
                <div key={s.step} className="text-center">
                  <div className="text-4xl font-[family-name:var(--font-heading)] font-bold text-gold mb-4">{s.step}</div>
                  <h3 className="text-xl font-[family-name:var(--font-heading)] font-bold text-navy mb-3">{s.title}</h3>
                  <p className="text-charcoal-light text-sm">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}