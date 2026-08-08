import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="container-wide py-20 max-w-3xl mx-auto prose prose-lg text-charcoal-light">
        <h1 className="text-4xl font-[family-name:var(--font-heading)] font-bold text-navy">Terms of Service</h1>
        <p>Last updated: 2024</p>
        <p>By using Fidelis Consulting Group services, you agree to these terms.</p>
        <h2>Services</h2>
        <p>We provide education consultancy, professional development, and AI platform services. Service specifics are defined in your service agreement or subscription plan.</p>
        <h2>Subscriptions</h2>
        <p>Subscription plans auto-renew unless cancelled. You may cancel at any time. Refunds are provided per our refund policy.</p>
        <h2>Intellectual Property</h2>
        <p>All content generated through our AI platform remains your property. Our platform, branding, and materials are our intellectual property.</p>
        <h2>Limitation of Liability</h2>
        <p>Fidelis Consulting Group provides services on an &quot;as is&quot; basis. We are not liable for indirect damages arising from service use.</p>
      </main>
      <Footer />
    </>
  );
}