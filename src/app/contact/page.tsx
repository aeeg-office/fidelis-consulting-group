import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Fidelis Consulting Group. Book a consultation, inquire about our services, or learn more about our AI platform for teachers.",
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main>
        <section className="container-wide py-20 md:py-28">
          <div className="grid md:grid-cols-2 gap-16 max-w-5xl mx-auto">
            <div>
              <span className="text-gold text-sm font-semibold uppercase tracking-widest mb-4 block">
                Contact Us
              </span>
              <h1 className="text-4xl md:text-5xl font-[family-name:var(--font-heading)] font-bold text-navy mb-6">
                Let&apos;s work together
              </h1>
              <p className="text-charcoal-light leading-relaxed mb-8">
                Whether you&apos;re interested in a department audit, professional
                development, or our AI platform, we&apos;d love to hear from you.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-ivory rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-5 h-5 text-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-navy">Email</p>
                    <p className="text-charcoal-light text-sm">info@fidelisconsultingroup.com</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-ivory rounded-lg p-8">
              <form className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-navy mb-1.5">Full Name</label>
                  <input type="text" className="w-full h-11 px-4 rounded-md border border-border bg-white text-sm focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy" placeholder="Your name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-1.5">Email</label>
                  <input type="email" className="w-full h-11 px-4 rounded-md border border-border bg-white text-sm focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy" placeholder="your@email.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-1.5">School (optional)</label>
                  <input type="text" className="w-full h-11 px-4 rounded-md border border-border bg-white text-sm focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy" placeholder="School name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-1.5">Subject</label>
                  <select className="w-full h-11 px-4 rounded-md border border-border bg-white text-sm focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy">
                    <option value="">Select a subject</option>
                    <option value="consultancy">English Department Consultancy</option>
                    <option value="pd">Professional Development</option>
                    <option value="ai">AI Platform</option>
                    <option value="general">General Inquiry</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-1.5">Message</label>
                  <textarea rows={5} className="w-full px-4 py-3 rounded-md border border-border bg-white text-sm focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy resize-none" placeholder="Tell us about your needs..." />
                </div>
                <button
                  type="submit"
                  className="w-full h-12 bg-navy text-white font-semibold rounded-lg hover:bg-navy-light transition-all duration-200"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}