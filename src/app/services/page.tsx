import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Explore our comprehensive services: English Department Consultancy, Professional Development, and AI Integration Training for international schools.",
};

export default function ServicesPage() {
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
                Comprehensive support for your school
              </h1>
              <p className="text-lg text-charcoal-light leading-relaxed max-w-2xl">
                From consultancy to professional development to AI-powered
                tools, we provide everything your school needs to excel.
              </p>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container-wide grid md:grid-cols-3 gap-8">
            <a href="/services/english-consultancy" className="group bg-white border border-border rounded-lg p-8 shadow-sm hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-navy rounded-lg flex items-center justify-center mb-6 group-hover:bg-navy-light transition-colors">
                <svg className="w-7 h-7 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h2 className="text-xl font-[family-name:var(--font-heading)] font-bold text-navy mb-3">English Department Consultancy</h2>
              <p className="text-charcoal-light text-sm mb-4">Department audits, curriculum reviews, coaching, and improvement planning.</p>
              <span className="text-navy font-semibold text-sm group-hover:text-gold transition-colors">Learn more →</span>
            </a>

            <a href="/services/professional-development" className="group bg-white border border-border rounded-lg p-8 shadow-sm hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-navy rounded-lg flex items-center justify-center mb-6 group-hover:bg-navy-light transition-colors">
                <svg className="w-7 h-7 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h2 className="text-xl font-[family-name:var(--font-heading)] font-bold text-navy mb-3">Professional Development</h2>
              <p className="text-charcoal-light text-sm mb-4">Workshops and courses in English teaching and AI for educators.</p>
              <span className="text-navy font-semibold text-sm group-hover:text-gold transition-colors">Learn more →</span>
            </a>

            <a href="/services/ai-training" className="group bg-white border border-border rounded-lg p-8 shadow-sm hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-navy rounded-lg flex items-center justify-center mb-6 group-hover:bg-navy-light transition-colors">
                <svg className="w-7 h-7 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-[family-name:var(--font-heading)] font-bold text-navy mb-3">AI Integration Training</h2>
              <p className="text-charcoal-light text-sm mb-4">Practical training for schools adopting AI in teaching and learning.</p>
              <span className="text-navy font-semibold text-sm group-hover:text-gold transition-colors">Learn more →</span>
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}