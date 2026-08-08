import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Fidelis Consulting Group — our mission, expertise, and commitment to improving learning in international schools across the Middle East and North Africa.",
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main>
        <section className="container-wide py-20 md:py-28">
          <div className="max-w-3xl mx-auto">
            <span className="text-gold text-sm font-semibold uppercase tracking-widest mb-4 block">
              About Us
            </span>
            <h1 className="text-4xl md:text-5xl font-[family-name:var(--font-heading)] font-bold text-navy mb-8">
              Committed to educational excellence
            </h1>
            <div className="prose prose-lg max-w-none text-charcoal-light">
              <p>
                Fidelis Consulting Group is a premium education consultancy
                serving international schools across the Middle East and North
                Africa. Founded on the principle that every school deserves
                access to world-class educational expertise, we combine deep
                pedagogical knowledge with practical, results-driven approaches.
              </p>
              <h2 className="text-2xl font-[family-name:var(--font-heading)] font-bold text-navy mt-10 mb-4">
                Our Mission
              </h2>
              <p>
                Supporting Schools. Developing People. Improving Learning.
                These three pillars guide everything we do. We believe that
                sustainable school improvement comes through empowering
                teachers, strengthening departments, and leveraging technology
                intelligently.
              </p>
              <h2 className="text-2xl font-[family-name:var(--font-heading)] font-bold text-navy mt-10 mb-4">
                Our Expertise
              </h2>
              <p>
                With extensive experience in international education, our
                consultants have worked with schools across the IGCSE, IB,
                American, and British curricula. We specialize in English
                department development, integrating AI into teaching practice,
                and designing professional development that creates lasting
                change.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}