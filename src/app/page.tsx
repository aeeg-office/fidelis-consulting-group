import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
};

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative bg-ivory overflow-hidden">
          <div className="container-wide py-20 md:py-28 lg:py-36">
            <div className="max-w-3xl">
              <span className="inline-block text-navy text-sm font-semibold uppercase tracking-widest mb-6">
                Fidelis Consulting Group
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-[family-name:var(--font-heading)] font-bold text-navy leading-tight mb-6 text-balance">
                Supporting Schools.{" "}
                <span className="text-gold">Developing People.</span>{" "}
                Improving Learning.
              </h1>
              <p className="text-lg md:text-xl text-charcoal-light leading-relaxed mb-10 max-w-2xl">
                Premium education consultancy for international schools in the
                Middle East and North Africa. English department audits,
                professional development, and an AI platform that requires zero
                prompt engineering.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="/services"
                  className="inline-flex items-center justify-center h-13 px-8 bg-gold text-white font-semibold rounded-lg hover:bg-gold-light transition-all duration-200 shadow-md text-lg"
                >
                  Explore Our Services
                </a>
                <a
                  href="/ai-platform"
                  className="inline-flex items-center justify-center h-13 px-8 bg-transparent text-navy font-semibold rounded-lg border-2 border-navy hover:bg-navy/5 transition-all duration-200 text-lg"
                >
                  View AI Platform
                </a>
              </div>
            </div>
          </div>
          {/* Decorative element */}
          <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-navy/5 rounded-full blur-3xl" />
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-gold/10 rounded-full blur-3xl" />
        </section>

        {/* Services Section */}
        <section className="py-20 md:py-28">
          <div className="container-wide">
            <div className="text-center mb-16">
              <span className="inline-block text-gold text-sm font-semibold uppercase tracking-widest mb-4">
                Our Services
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-[family-name:var(--font-heading)] font-bold text-navy">
                Everything your school needs to excel
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Service 1 */}
              <div className="bg-white border border-border rounded-lg p-8 shadow-sm hover:shadow-md transition-all duration-200 group">
                <div className="w-14 h-14 bg-navy rounded-lg flex items-center justify-center mb-6 group-hover:bg-navy-light transition-colors">
                  <svg className="w-7 h-7 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-xl font-[family-name:var(--font-heading)] font-bold text-navy mb-3">
                  English Department Consultancy
                </h3>
                <p className="text-charcoal-light leading-relaxed mb-5">
                  Comprehensive audits, curriculum reviews, assessment design,
                  and one-on-one coaching for Heads of Department and teachers.
                </p>
                <a
                  href="/services/english-consultancy"
                  className="text-navy font-semibold text-sm hover:text-gold transition-colors inline-flex items-center gap-1"
                >
                  Learn more →
                </a>
              </div>

              {/* Service 2 */}
              <div className="bg-white border border-border rounded-lg p-8 shadow-sm hover:shadow-md transition-all duration-200 group">
                <div className="w-14 h-14 bg-navy rounded-lg flex items-center justify-center mb-6 group-hover:bg-navy-light transition-colors">
                  <svg className="w-7 h-7 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-[family-name:var(--font-heading)] font-bold text-navy mb-3">
                  Professional Development
                </h3>
                <p className="text-charcoal-light leading-relaxed mb-5">
                  Two tracks: English Teaching and AI for Educators. Workshops,
                  courses, certificates, and ongoing support.
                </p>
                <a
                  href="/professional-development"
                  className="text-navy font-semibold text-sm hover:text-gold transition-colors inline-flex items-center gap-1"
                >
                  Learn more →
                </a>
              </div>

              {/* Service 3 */}
              <div className="bg-white border border-border rounded-lg p-8 shadow-sm hover:shadow-md transition-all duration-200 group">
                <div className="w-14 h-14 bg-navy rounded-lg flex items-center justify-center mb-6 group-hover:bg-navy-light transition-colors">
                  <svg className="w-7 h-7 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-[family-name:var(--font-heading)] font-bold text-navy mb-3">
                  AI Platform for Teachers
                </h3>
                <p className="text-charcoal-light leading-relaxed mb-5">
                  20+ structured AI tools — lesson planning, assessment, rubrics,
                  feedback, and more. Zero prompt engineering required.
                </p>
                <a
                  href="/ai-platform"
                  className="text-navy font-semibold text-sm hover:text-gold transition-colors inline-flex items-center gap-1"
                >
                  Learn more →
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-navy py-16">
          <div className="container-wide">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { number: "15+", label: "Years Experience" },
                { number: "50+", label: "Schools Served" },
                { number: "1,000+", label: "Teachers Trained" },
                { number: "22", label: "AI Tools" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-3xl md:text-4xl font-[family-name:var(--font-heading)] font-bold text-gold mb-2">
                    {stat.number}
                  </div>
                  <div className="text-ivory/80 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-28 bg-ivory">
          <div className="container-wide text-center">
            <h2 className="text-3xl md:text-4xl font-[family-name:var(--font-heading)] font-bold text-navy mb-6">
              Ready to transform your school?
            </h2>
            <p className="text-lg text-charcoal-light max-w-2xl mx-auto mb-10">
              Whether you need a department audit, professional development, or
              AI tools for your teachers — we're here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center justify-center h-13 px-8 bg-navy text-white font-semibold rounded-lg hover:bg-navy-light transition-all duration-200 text-lg"
              >
                Book a Consultation
              </a>
              <a
                href="/ai-platform"
                className="inline-flex items-center justify-center h-13 px-8 bg-transparent text-navy font-semibold rounded-lg border-2 border-navy hover:bg-navy/5 transition-all duration-200 text-lg"
              >
                Explore AI Platform
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}