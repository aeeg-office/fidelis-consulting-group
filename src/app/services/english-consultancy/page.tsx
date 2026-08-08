import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "English Department Consultancy",
  description:
    "Comprehensive English department audits, curriculum reviews, assessment design, and coaching for international schools. Expert consultancy for Heads of Department.",
};

const services = [
  {
    title: "Department Audits",
    desc: "Comprehensive evaluation of your English department's strengths, areas for growth, and alignment with best practices.",
  },
  {
    title: "Curriculum Reviews",
    desc: "In-depth analysis of your curriculum documents, schemes of work, and lesson plans to ensure coherence and rigor.",
  },
  {
    title: "Assessment Design",
    desc: "Develop valid, reliable assessments that accurately measure student progress and align with curriculum standards.",
  },
  {
    title: "Rubric Development",
    desc: "Create clear, criterion-referenced rubrics that improve marking consistency and student understanding of expectations.",
  },
  {
    title: "Teacher Coaching",
    desc: "One-on-one instructional coaching grounded in observation, feedback, and reflective practice.",
  },
  {
    title: "Head of Department Coaching",
    desc: "Leadership coaching for HoDs covering team management, curriculum leadership, and strategic planning.",
  },
  {
    title: "Department Improvement Plans",
    desc: "Evidence-based, actionable improvement plans tailored to your department's context and goals.",
  },
  {
    title: "School Improvement Planning",
    desc: "Strategic planning support for school leadership teams focused on measurable outcomes.",
  },
  {
    title: "Curriculum Alignment",
    desc: "Ensure your English curriculum is coherently aligned across year groups, standards, and assessment practices.",
  },
];

export default function EnglishConsultancyPage() {
  return (
    <>
      <Header />
      <main>
        <section className="bg-ivory">
          <div className="container-wide py-20 md:py-28">
            <div className="max-w-3xl">
              <span className="text-gold text-sm font-semibold uppercase tracking-widest mb-4 block">
                Services
              </span>
              <h1 className="text-4xl md:text-5xl font-[family-name:var(--font-heading)] font-bold text-navy mb-6">
                English Department Consultancy
              </h1>
              <p className="text-lg text-charcoal-light leading-relaxed max-w-2xl">
                From comprehensive audits to one-on-one coaching, we help
                international school English departments achieve excellence
                through evidence-based, practical consultancy.
              </p>
            </div>
          </div>
        </section>

        <section className="py-20 md:py-28">
          <div className="container-wide">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <div key={service.title} className="bg-white border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-all">
                  <h3 className="text-lg font-[family-name:var(--font-heading)] font-bold text-navy mb-3">
                    {service.title}
                  </h3>
                  <p className="text-charcoal-light text-sm leading-relaxed">
                    {service.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-ivory py-20">
          <div className="container-wide text-center">
            <h2 className="text-3xl font-[family-name:var(--font-heading)] font-bold text-navy mb-6">
              Ready to strengthen your department?
            </h2>
            <a
              href="/contact"
              className="inline-flex items-center justify-center h-13 px-8 bg-navy text-white font-semibold rounded-lg hover:bg-navy-light transition-all duration-200 text-lg"
            >
              Schedule a Consultation
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}