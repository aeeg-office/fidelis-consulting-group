/**
 * Security response headers applied to every route via next.config.
 * Kept in a module so the policy is unit-testable and reviewable in one place.
 */

export interface HeaderRule {
  key: string;
  value: string;
}

export function securityHeaders(): { key: string; value: string }[] {
  return [
    // Block MIME-type sniffing.
    { key: "X-Content-Type-Options", value: "nosniff" },
    // Never frame the site (clickjacking protection).
    { key: "X-Frame-Options", value: "DENY" },
    // Avoid leaking the referrer across origins.
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    // Basic CSP. `unsafe-inline` for styles/scripts is required by Next.js
    // inline hydration data; tightened further in a hosted proxy if needed.
    {
      key: "Content-Security-Policy",
      value: [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob: https:",
        "font-src 'self' data:",
        "connect-src 'self' https:",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join("; "),
    },
    // Prevent browsers from overriding the declared charset.
    { key: "X-DNS-Prefetch-Control", value: "off" },
    // Basic cross-origin isolation signal; harmless in mixed hosting.
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  ];
}

/** Attach headers to a Next.js headers() response. */
export function securityHeaderEntries(): readonly { source: string; headers: { key: string; value: string }[] }[] {
  return [
    {
      source: "/:path*",
      headers: securityHeaders(),
    },
  ];
}
