import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Cookie Policy" };

export default function CookiesPage() {
  return (
    <>
      <Header />
      <main className="container-wide py-20 max-w-3xl mx-auto prose prose-lg text-charcoal-light">
        <h1 className="text-4xl font-[family-name:var(--font-heading)] font-bold text-navy">Cookie Policy</h1>
        <p>Last updated: 2024</p>
        <p>Fidelis Consulting Group uses cookies to improve your browsing experience and provide personalized content.</p>
        <h2>What Are Cookies</h2>
        <p>Cookies are small text files stored on your device when you visit a website. They help us remember your preferences and understand how you use our site.</p>
        <h2>Cookies We Use</h2>
        <ul>
          <li>Essential cookies: Required for site functionality</li>
          <li>Preference cookies: Remember your language and region</li>
          <li>Analytics cookies: Help us improve our site</li>
        </ul>
        <h2>Managing Cookies</h2>
        <p>You can control cookies through your browser settings. Disabling certain cookies may affect site functionality.</p>
      </main>
      <Footer />
    </>
  );
}