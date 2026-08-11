import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

type InformationPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: Array<{ title: string; items: string[] }>;
  cta?: { label: string; href: string };
};

export function InformationPage({ eyebrow, title, intro, sections, cta = { label: "Talk to Fidelis", href: "/contact" } }: InformationPageProps) {
  return (
    <>
      <Header />
      <main>
        <section className="bg-ivory">
          <div className="container-wide py-20 md:py-28">
            <span className="text-gold text-sm font-semibold uppercase tracking-widest mb-4 block">{eyebrow}</span>
            <h1 className="max-w-4xl text-4xl md:text-5xl font-[family-name:var(--font-heading)] font-bold text-navy mb-6">{title}</h1>
            <p className="max-w-3xl text-lg text-charcoal-light leading-relaxed">{intro}</p>
          </div>
        </section>
        <section className="container-wide py-16 md:py-20">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sections.map((section) => (
              <section key={section.title} className="rounded-lg border border-border bg-white p-7 shadow-sm">
                <h2 className="mb-4 text-xl font-[family-name:var(--font-heading)] font-bold text-navy">{section.title}</h2>
                <ul className="space-y-3 text-sm leading-relaxed text-charcoal-light">
                  {section.items.map((item) => <li key={item} className="flex gap-2"><span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />{item}</li>)}
                </ul>
              </section>
            ))}
          </div>
          <div className="mt-12 rounded-lg bg-navy p-8 text-center text-white">
            <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold">Start a focused conversation</h2>
            <p className="mx-auto mt-3 max-w-2xl text-ivory/80">Tell us what your school, department, or teaching team needs. We will respond with an appropriate next step.</p>
            <Link href={cta.href} className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-gold px-6 font-semibold text-navy hover:bg-gold-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">{cta.label}</Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
