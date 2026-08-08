import Link from "next/link";

const footerLinks = {
  services: [
    { label: "English Department Consultancy", href: "/services/english-consultancy" },
    { label: "Professional Development", href: "/services/professional-development" },
    { label: "AI Integration Training", href: "/services/ai-training" },
  ],
  pd: [
    { label: "English Teaching Track", href: "/professional-development/english-teaching" },
    { label: "AI for Educators Track", href: "/professional-development/ai-for-educators" },
  ],
  resources: [
    { label: "Blog", href: "/resources/blog" },
    { label: "Downloads", href: "/resources/downloads" },
    { label: "Case Studies", href: "/resources/case-studies" },
    { label: "Insights", href: "/insights" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="container-wide py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gold rounded-lg flex items-center justify-center">
                <span className="text-navy font-bold text-lg font-[family-name:var(--font-heading)]">F</span>
              </div>
              <div>
                <span className="font-[family-name:var(--font-heading)] font-bold text-gold text-lg leading-tight block">
                  Fidelis
                </span>
                <span className="text-xs text-ivory/70 leading-tight block">
                  Consulting Group
                </span>
              </div>
            </div>
            <p className="text-ivory/80 text-sm leading-relaxed max-w-sm mb-6">
              Supporting Schools. Developing People. Improving Learning.
            </p>
            {/* Newsletter */}
            <div className="max-w-sm">
              <label className="text-sm font-medium text-ivory/90 mb-2 block">
                Subscribe to our newsletter
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 h-10 px-4 rounded-md bg-navy-light border border-white/20 text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-gold"
                />
                <button className="h-10 px-4 bg-gold text-navy font-semibold rounded-md text-sm hover:bg-gold-light transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-[family-name:var(--font-heading)] font-bold text-gold text-sm mb-4 uppercase tracking-wider">
              Services
            </h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-ivory/70 hover:text-gold text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* PD */}
          <div>
            <h4 className="font-[family-name:var(--font-heading)] font-bold text-gold text-sm mb-4 uppercase tracking-wider">
              Professional Development
            </h4>
            <ul className="space-y-3">
              {footerLinks.pd.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-ivory/70 hover:text-gold text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-ivory/70 hover:text-gold text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-[family-name:var(--font-heading)] font-bold text-gold text-sm mb-4 uppercase tracking-wider">
              Legal
            </h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-ivory/70 hover:text-gold text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <Link
                href="/contact"
                className="text-ivory/70 hover:text-gold text-sm transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container-wide py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-ivory/50 text-xs">
            © {new Date().getFullYear()} Fidelis Consulting Group. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-ivory/50 hover:text-ivory/80 text-xs transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-ivory/50 hover:text-ivory/80 text-xs transition-colors">
              Terms of Service
            </Link>
            <Link href="/cookies" className="text-ivory/50 hover:text-ivory/80 text-xs transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}