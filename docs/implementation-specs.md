# FIDELIS CONSULTING GROUP
## Implementation Specifications v1.0

---

### 1. PROJECT SCAFFOLDING

```
fidelis-platform/
├── .env.example
├── .gitignore
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── docker-compose.yml
├── Dockerfile
│
├── public/
│   ├── fonts/
│   ├── images/
│   ├── icons/
│   ├── og-images/
│   ├── robots.txt
│   └── sitemap.xml
│
├── messages/
│   ├── en/
│   │   ├── common.json
│   │   ├── home.json
│   │   ├── about.json
│   │   ├── services.json
│   │   ├── ai-platform.json
│   │   ├── pd.json
│   │   ├── resources.json
│   │   ├── legal.json
│   │   ├── seo.json
│   │   └── app.json
│   └── ar/
│       └── (same structure)
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── src/
│   ├── app/
│   │   ├── [locale]/                    # Internationalized routes
│   │   │   ├── page.tsx                 # Home
│   │   │   ├── about/page.tsx
│   │   │   ├── services/
│   │   │   ├── ai-platform/page.tsx
│   │   │   ├── professional-development/
│   │   │   ├── resources/
│   │   │   ├── insights/
│   │   │   ├── careers/
│   │   │   ├── contact/
│   │   │   ├── privacy/
│   │   │   ├── terms/
│   │   │   ├── cookies/
│   │   │   ├── search/
│   │   │   ├── login/
│   │   │   └── not-found.tsx
│   │   │
│   │   ├── app/                          # Secure educator platform
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                  # Dashboard redirect
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── dashboard/
│   │   │   ├── tools/
│   │   │   ├── workshops/
│   │   │   ├── courses/
│   │   │   ├── certificates/
│   │   │   ├── profile/
│   │   │   ├── settings/
│   │   │   ├── billing/
│   │   │   └── admin/
│   │   │
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── ai/
│   │   │   ├── workshops/
│   │   │   ├── subscriptions/
│   │   │   ├── webhooks/
│   │   │   └── health/
│   │   │
│   │   └── layout.tsx
│   │
│   ├── components/
│   │   ├── ui/                      # Design system primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Dropdown.tsx
│   │   │   ├── Tabs.tsx
│   │   │   ├── Breadcrumb.tsx
│   │   │   ├── Pagination.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── Skeleton.tsx
│   │   │
│   │   ├── layout/                   # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── MobileNav.tsx
│   │   │   ├── LanguageSwitcher.tsx
│   │   │   └── BreadcrumbNav.tsx
│   │   │
│   │   ├── sections/                 # Page sections
│   │   │   ├── HeroSection.tsx
│   │   │   ├── ServicesGrid.tsx
│   │   │   ├── TestimonialCarousel.tsx
│   │   │   ├── CTASection.tsx
│   │   │   ├── StatsCounter.tsx
│   │   │   ├── NewsletterSignup.tsx
│   │   │   └── TrustedBySection.tsx
│   │   │
│   │   ├── ai/                       # AI tool components
│   │   │   ├── AIFormShell.tsx
│   │   │   ├── AIDropdown.tsx
│   │   │   ├── AIResultCard.tsx
│   │   │   ├── RefinementBar.tsx
│   │   │   ├── CreditDisplay.tsx
│   │   │   └── ToolHistory.tsx
│   │   │
│   │   └── dashboard/               # Dashboard components
│   │       ├── DashboardCard.tsx
│   │       ├── ActivityFeed.tsx
│   │       ├── UsageChart.tsx
│   │       └── QuickActions.tsx
│   │
│   ├── lib/
│   │   ├── prisma.ts                 # Database client
│   │   ├── auth.ts                   # Auth configuration
│   │   ├── i18n.ts                   # Internationalization
│   │   ├── feature-flags.ts          # Feature flag resolution
│   │   ├── permissions.ts            # RBAC utilities
│   │   ├── ai-router.ts             # OpenRouter routing
│   │   ├── ai-cache.ts              # AI response caching
│   │   ├── ai-cost.ts               # Cost tracking
│   │   ├── seo.ts                   # SEO utilities
│   │   ├── utils.ts                 # General utilities
│   │   └── constants.ts             # App constants
│   │
│   ├── hooks/
│   │   ├── useFeatureFlag.ts
│   │   ├── usePermissions.ts
│   │   ├── useAI.ts
│   │   ├── useLocalization.ts
│   │   └── useDebounce.ts
│   │
│   ├── types/
│   │   ├── index.ts
│   │   ├── ai.ts
│   │   ├── auth.ts
│   │   ├── subscription.ts
│   │   └── feature-flags.ts
│   │
│   └── styles/
│       ├── globals.css
│       ├── design-tokens.css
│       └── rtl.css
│
└── scripts/
    ├── seed.ts
    ├── migrate.ts
    └── deploy.sh
```

### 2. IMPLEMENTATION ORDER

**Phase A — Foundation (Sprint 1-2)**
1. Next.js project setup with TypeScript + Tailwind
2. Internationalization (next-intl)
3. Design system components (Button, Card, Input, etc.)
4. Layout components (Header, Footer, LanguageSwitcher)
5. Home page with hero, services, CTA sections
6. About, Contact pages
7. SEO implementation (metadata, hreflang, sitemap, robots)

**Phase B — Public Site (Sprint 3-4)**
1. Services pages (English Consultancy, PD, AI Training)
2. AI Platform landing page
3. Professional Development pages (both tracks)
4. Resources (Blog, Downloads)
5. Insights, Careers pages
6. Legal pages (Privacy, Terms, Cookies)
7. Search functionality
8. 404 page

**Phase C — Auth & Platform (Sprint 5-6)**
1. Database setup (Prisma + PostgreSQL)
2. Auth.js integration (email + password)
3. Registration flows (school + teacher)
4. Email verification
5. Password reset
6. Role-based access control
7. Feature flag system
8. Dashboard layouts (per role)

**Phase D — AI Tools (Sprint 7-9)**
1. OpenRouter client setup
2. AI routing engine (model selection, fallback, caching)
3. Prompt template system
4. Lesson Planner tool (full implementation)
5. Quiz Builder tool
6. Worksheet Builder tool
7. Writing Feedback Assistant
8. Remaining tools (batch)
9. AI usage tracking
10. Credit system

**Phase E — PD & Subscriptions (Sprint 10-11)**
1. Workshop portal
2. Course delivery system
3. Certificate generation
4. Subscription plans + Stripe integration
5. School admin dashboard
6. Billing & invoicing
7. Admin dashboard (user, school, subscription management)

**Phase F — Polish & Launch (Sprint 12)**
1. Arabic content completion
2. Performance optimization
3. Security audit
4. Deploy to production
5. Documentation

### 3. API ROUTE DESIGN

```
/api/auth/[...nextauth]       — Auth.js endpoints
/api/ai/[tool]/generate       — AI tool generation
/api/ai/[tool]/refine         — Refinement call
/api/ai/usage                 — Usage stats
/api/workshops                — CRUD workshops
/api/workshops/[id]/enroll    — Enroll in workshop
/api/courses/[id]/enroll      — Enroll in course
/api/subscriptions            — Subscription management
/api/subscriptions/plans      — Plan listing
/api/webhooks/stripe          — Stripe webhooks
/api/contact                  — Contact form submission
/api/content/posts            — Blog CRUD (admin)
/api/upload                   — File upload (S3)
/api/health                   — Health check
```

### 4. DEPLOYMENT ARCHITECTURE

```
┌─────────────────────────────────────────────────┐
│                    Cloudflare                    │
│           DNS · CDN · DDoS Protection            │
│           SSL/TLS · Caching                      │
└─────────────────────┬───────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────┐
│               Nginx (Reverse Proxy)              │
│         SSL Termination · Rate Limiting          │
│         Static File Serving                      │
└─────────────────────┬───────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────┐
│          Next.js (PM2 · App Server)              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ Public   │  │ Platform │  │ API      │       │
│  │ Website  │  │ App      │  │ Routes   │       │
│  └──────────┘  └──────────┘  └──────────┘       │
└─────────────────────┬───────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────┐
│         PostgreSQL (Database)                    │
│         Redis (Cache + Sessions)                 │
│         Cloudflare R2 (File Storage)             │
└─────────────────────────────────────────────────┘
```

### 5. FUTURE-MODULE READY GATES

Every future module follows this pattern:

1. **Database** — Table exists (empty), feature flag registered
2. **Navigation** — Entry exists but hidden behind feature flag check
3. **API Routes** — Routes exist, return 404 if flag disabled
4. **Permissions** — Permission codes registered, assigned to roles
5. **UI Components** — Components exist in codebase, gated by feature flag hook
6. **Documentation** — Module documented in admin manual

Activation requires: Admin → Feature Flags → Enable module → Module appears in navigation.