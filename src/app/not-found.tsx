import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Not Found",
};

export default function NotFound() {
  return (
    <>
      <Header />
      <main>
        <section className="container-wide py-28 text-center">
          <h1 className="text-6xl md:text-8xl font-[family-name:var(--font-heading)] font-bold text-gold mb-4">
            404
          </h1>
          <h2 className="text-2xl md:text-3xl font-[family-name:var(--font-heading)] font-bold text-navy mb-4">
            Page not found
          </h2>
          <p className="text-charcoal-light mb-8 max-w-md mx-auto">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <a
            href="/"
            className="inline-flex items-center justify-center h-12 px-6 bg-navy text-white font-semibold rounded-lg hover:bg-navy-light transition-all"
          >
            Back to Home
          </a>
        </section>
      </main>
      <Footer />
    </>
  );
}