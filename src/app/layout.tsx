import type { Metadata } from "next";
import "@/styles/globals.css";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  applicationName: "Fidelis Consulting Group",
  title: {
    default: "Fidelis Consulting Group | Supporting Schools. Developing People. Improving Learning.",
    template: "%s | Fidelis Consulting Group",
  },
  description:
    "Premium education consultancy for international schools in the Middle East and North Africa. English department consultancy, teacher professional development, and AI platform.",
  keywords: [
    "education consultancy",
    "international schools",
    "MENA education",
    "English department audit",
    "teacher professional development",
    "AI for teachers",
    "school improvement",
  ],
  openGraph: {
    title: "Fidelis Consulting Group",
    description:
      "Supporting Schools. Developing People. Improving Learning. Premium education consultancy for international schools.",
    url: "https://fidelisconsultingroup.com",
    siteName: "Fidelis Consulting Group",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fidelis Consulting Group",
    description:
      "Supporting Schools. Developing People. Improving Learning.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    languages: {
      en: "/",
      ar: "/ar",
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-white font-[family-name:var(--font-body)] text-charcoal antialiased">
        <a href="#main-content" className="sr-only fixed left-4 top-4 z-[100] rounded bg-navy px-4 py-2 font-semibold text-white focus:not-sr-only">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}