import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Professional Development",
  description:
    "Two tracks for teacher professional development: English Teaching and AI for Educators. Workshops, courses, certificates, and ongoing support.",
};

export default function PDMainPage() {
  return (
    <>
      <Header />
      <main>
        <section className="bg-ivory">
          <div className="container-wide py-20 md:py-28">
            <div className="max-w-3xl">
              <span className="text-gold text-sm font-semibold uppercase tracking-widest mb-4 block">
                Professional Development
              </span>
              <h1 className="text-4xl md:text-5xl font-[family-name:var(--font-heading)] font-bold text-navy mb-6">
                Two tracks. One goal: better teaching.
              </h1>
              <p className="text-lg text-charcoal-light leading-relaxed max-w-2xl">
                Choose your path — English Teaching or AI for Educators — and
                access workshops, courses, resources, and certificates designed
                for international school teachers.
              </p>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container-wide grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <a href="/professional-development/english-teaching" className="group bg-white border-2 border-navy/10 rounded-lg p-8 hover:border-navy/30 transition-all shadow-sm hover:shadow-md">
              <div className="text-3xl mb-4">📚</div>
              <h2 className="text-2xl font-[family-name:var(--font-heading)] font-bold text-navy mb-3">English Teaching Track</h2>
              <p className="text-charcoal-light text-sm mb-4">Workshops, courses, and resources for English language teachers in international schools.</p>
              <span className="text-navy font-semibold text-sm group-hover:text-gold transition-colors">Explore track →</span>
            </a>

            <a href="/professional-development/ai-for-educators" className="group bg-white border-2 border-gold/20 rounded-lg p-8 hover:border-gold/40 transition-all shadow-sm hover:shadow-md">
              <div className="text-3xl mb-4">🤖</div>
              <h2 className="text-2xl font-[family-name:var(--font-heading)] font-bold text-navy mb-3">AI for Educators Track</h2>
              <p className="text-charcoal-light text-sm mb-4">Practical AI training for educators — no technical background required.</p>
              <span className="text-navy font-semibold text-sm group-hover:text-gold transition-colors">Explore track →</span>
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}