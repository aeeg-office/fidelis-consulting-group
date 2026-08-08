import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="container-wide py-20 max-w-3xl mx-auto prose prose-lg text-charcoal-light">
        <h1 className="text-4xl font-[family-name:var(--font-heading)] font-bold text-navy">Privacy Policy</h1>
        <p>Last updated: 2024</p>
        <p>Fidelis Consulting Group respects your privacy. This policy explains how we collect, use, and protect your personal information.</p>
        <h2>Information We Collect</h2>
        <p>We collect information you provide directly: name, email, phone, school name, and professional details when you register, contact us, or use our services.</p>
        <h2>How We Use Your Information</h2>
        <p>To provide our consultancy services, professional development, and AI platform access. To communicate with you about our services. To improve our platform.</p>
        <h2>Data Protection</h2>
        <p>We implement industry-standard security measures. Your data is stored securely and never shared with third parties without your consent.</p>
        <h2>Contact</h2>
        <p>Email: privacy@fidelisconsultingroup.com</p>
      </main>
      <Footer />
    </>
  );
}