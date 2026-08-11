"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";

// In a real setup, this would come from next-intl or similar i18n library
// For now, we use a simple locale-based approach
const locale = "en";
const messages = {
  en: {
    nav: {
      home: "Home",
      about: "About",
      services: "Services",
      aiPlatform: "AI Platform",
      professionalDevelopment: "Professional Development",
      resources: "Resources",
      insights: "Insights",
      careers: "Careers",
      contact: "Contact",
      login: "Login",
      getStarted: "Get Started",
    },
  },
  ar: {
    nav: {
      home: "الرئيسية",
      about: "عن الشركة",
      services: "الخدمات",
      aiPlatform: "منصة الذكاء الاصطناعي",
      professionalDevelopment: "التطوير المهني",
      resources: "الموارد",
      insights: "الرؤى",
      careers: "الوظائف",
      contact: "اتصل بنا",
      login: "تسجيل الدخول",
      getStarted: "ابدأ الآن",
    },
  },
};

const navItems = [
  { key: "home", href: "/" },
  { key: "about", href: "/about" },
  {
    key: "services",
    href: "/services",
    children: [
      { key: "englishConsultancy", href: "/services/english-consultancy", label: "English Department Consultancy" },
      { key: "professionalDevelopment", href: "/services/professional-development", label: "Professional Development" },
      { key: "aiTraining", href: "/services/ai-training", label: "AI Integration Training" },
    ],
  },
  { key: "aiPlatform", href: "/ai-platform" },
  {
    key: "professionalDevelopment",
    href: "/professional-development",
    children: [
      { key: "englishTeaching", href: "/professional-development/english-teaching", label: "English Teaching Track" },
      { key: "aiForEducators", href: "/professional-development/ai-for-educators", label: "AI for Educators Track" },
    ],
  },
  {
    key: "resources",
    href: "/resources",
    children: [
      { key: "blog", href: "/resources/blog", label: "Blog" },
      { key: "downloads", href: "/resources/downloads", label: "Downloads" },
      { key: "caseStudies", href: "/resources/case-studies", label: "Case Studies" },
    ],
  },
  { key: "insights", href: "/insights" },
  { key: "contact", href: "/contact" },
];

export function Header() {
  const pathname = usePathname() ?? "/";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = messages[locale as keyof typeof messages].nav;

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-border">
      <div className="container-wide flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-navy rounded-lg flex items-center justify-center">
            <span className="text-gold font-bold text-lg font-[family-name:var(--font-heading)]">F</span>
          </div>
          <div className="hidden sm:block">
            <span className="font-[family-name:var(--font-heading)] font-bold text-navy text-lg leading-tight block">
              Fidelis
            </span>
            <span className="text-xs text-charcoal-light leading-tight block">
              Consulting Group
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <div key={item.key} className="relative group">
                <Link
                  href={item.href}
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-1",
                    isActive
                      ? "text-navy bg-ivory"
                      : "text-charcoal-light hover:text-navy hover:bg-ivory/50"
                  )}
                >
                  {t[item.key as keyof typeof t]}
                  {item.children && <ChevronDown className="w-3.5 h-3.5" />}
                </Link>
                {/* Dropdown */}
                {item.children && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-4 py-2 text-sm text-charcoal-light hover:text-navy hover:bg-ivory transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden sm:inline-flex text-sm font-medium text-charcoal-light hover:text-navy transition-colors"
          >
            {t.login}
          </Link>
          <Link
            href="/app/register"
            className="hidden sm:inline-flex h-9 items-center justify-center rounded-md bg-gold px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-gold-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
          >
            {t.getStarted}
          </Link>
          {/* Language Switcher */}
          <Link
            href="/ar"
            className="text-sm font-medium text-charcoal-light hover:text-navy transition-colors px-2 py-1 border border-border rounded"
          >
            العربية
          </Link>
          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 text-navy"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-white">
          <div className="container-wide py-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <div key={item.key}>
                  <Link
                    href={item.href}
                    className={cn(
                      "block px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive ? "text-navy bg-ivory" : "text-charcoal-light hover:text-navy hover:bg-ivory/50"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t[item.key as keyof typeof t]}
                  </Link>
                  {item.children && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-3 py-1.5 text-sm text-charcoal-light hover:text-navy rounded-md transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            <div className="pt-3 border-t border-border">
              <Link
                href="/login"
                className="block px-3 py-2 text-sm font-medium text-charcoal-light"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t.login}
              </Link>
              <Link
                href="/app/register"
                className="mt-2 flex h-11 w-full items-center justify-center rounded-md bg-gold px-4 font-semibold text-white shadow-sm transition-colors hover:bg-gold-light"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t.getStarted}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}