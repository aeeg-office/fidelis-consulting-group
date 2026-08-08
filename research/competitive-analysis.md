# Fidelis Consulting Group — Platform Research Summary

**Date:** July 2026  
**Context:** Bilingual (EN/AR) education platform for international schools in MENA  
**Scope:** Public website + secure educator platform with AI tools

---

## 1. Educational Consulting Company Websites (International Schools Focus)

### 1.1 Market Leaders & Their Approach

| Company | Focus | Key Differentiator | Tech Stack Signals |
|---------|-------|-------------------|--------------------|
| **Finalsite** | K-12 international schools, 4,000+ schools | All-in-one platform: CMS, LMS, CRM, enrollment, mobile apps, AI chatbot, Composer drag-and-drop CMS | Custom CMS, responsive mobile-first, AI chatbot, multilingual |
| **International EdTech** | Global EdTech consulting | Leadership consultation, planning/assessment, data systems design, digital citizenship | WordPress site, service-focused, no product platform |
| **OpenApply** (Faria) | International school admissions | Bilingual online forms, CRM, AI analytics, multi-language support | Part of ManageBac+ ecosystem, built for IB schools |
| **DreamCo Design** | General school web design | Security, reliability, simplicity | Custom development |

### 1.2 Key UX Patterns in Education Consulting Sites

- **Service-first navigation:** Clear service categories (consulting, training, assessment, tech) with dropdown menus
- **Trust signals prominently placed:** Client logos, school counts, testimonials above the fold
- **Multi-language as a feature:** Finalsite and OpenApply explicitly market multilingual capabilities
- **AI as differentiator:** Finalsite's AI chatbot ("Fewer Clicks, Better Answers") for 24/7 multilingual family inquiries
- **Free audits/reviews:** "Free Website Report Card" / "Free School Communications Audit" — low-friction lead generation
- **Mobile-first responsive design:** Non-negotiable for international schools
- **Case studies + portfolio:** School-specific success stories with measurable outcomes

### 1.3 What Works for MENA / International Schools

- **Bilingual by default** — not an afterthought
- **Curriculum-specific messaging** — IB, British, American curricula framed explicitly
- **Admissions pipeline integration** — inquiry → tour → application → enrollment tracking
- **Parent communication tools** — push notifications, newsletters, multilingual messaging
- **QR code / WhatsApp integration** — critical for MENA markets

### 1.4 Fidelis Implications

- Lead with **service categories** + **trust signals** (school logos, case studies, AI tools preview)
- Offer a **free digital audit** as lead gen mechanism
- Market the **AI teacher platform** as a core differentiator — not just consulting
- Must have **EN/AR toggle** on every page, not just translated content

---

## 2. Teacher AI Platforms — Deep Analysis

### 2.1 Platform Comparison

| Feature | MagicSchool AI | Eduaide.ai | Brisk Teaching |
|---------|---------------|-----------|---------------|
| **# of AI Tools** | 80+ | 30+ | 20+ (Chrome extension) |
| **Pricing (Individual)** | Free + $12.99/mo | Free (15 gen/mo) + $5.99/mo | Free + $9.99/mo ($99/yr) |
| **Pricing (District)** | Custom quote-based | Custom quote-based | Quote-based |
| **Best For** | All-in-one platform, non-tech teachers | Pedagogy-aware content generation | Google Workspace teachers |
| **Key UX Pattern** | Standalone web app, guided inputs, built-in examples | Template library, content generators | Chrome extension, works inside Docs/Slides |
| **Certification** | 3 levels of AI certification | None | None |
| **Compliance** | SOC 2, FERPA, COPPA | FERPA | FERPA |
| **Integrations** | Google Docs, Classroom, Canvas, MS Teams | Google Classroom, Canvas | Google Docs, Forms, Slides, YouTube, PDFs |
| **Weaknesses** | Generic outputs, limited customization, overlapping tools | Fewer tools, limited free tier | Google-only ecosystem, fewer tools overall |

### 2.2 AI Tool Categories (MagicSchool's 80+ tools mapped)

| Category | Tools | Fidelis Opportunity |
|----------|-------|-------------------|
| **Lesson Planning** | Lesson plans, unit plans, project-based learning | Core offering — must support EN/AR curriculum standards |
| **Assessment** | Quiz generator, rubric maker, exit tickets | Support IB/IGCSE/American standards |
| **Differentiation** | Leveled texts, multilingual support, IEP goals | Arabic differentiation is a major gap in market |
| **Communication** | Parent emails, newsletters, behavior reports | Arabic parent communication — huge need |
| **Content Creation** | Worksheets, presentations, visuals, videos | Support Arabic content generation |
| **Student Support** | Accommodations, SEL, behavior plans | Culturally adapted SEL for MENA |
| **Math/Science** | Math spiral review, science lab generator | Arabic STEM content — underserved |
| **Administration** | IEP writing, 504 plans, data analysis | MENA-specific compliance docs |

### 2.3 Critical UX Patterns in Teacher AI Platforms

1. **Guided Inputs, Not Blank Prompts** — MagicSchool succeeds because teachers don't need prompt engineering. Forms with dropdowns, grade levels, standards, and context fields.
2. **Built-in Examples & Tips** — Each tool shows example output so teachers see value immediately.
3. **Zero-data Training** — Every major platform promises "we don't use your data to train AI." This is the #1 district concern.
4. **Chrome Extension Distribution** — Brisk Teaching's 600K teachers came from being *inside* Docs/Classroom, not from a website. "Standalone web apps under-distribute by default."
5. **Output Quality Over Quantity** — Eduaide wins on quality despite fewer tools. MagicSchool's 80 tools have overlapping/uneven quality.
6. **District Dashboards** — Admin tools for rollout, usage analytics, and compliance monitoring are essential for school-wide adoption.
7. **Certification Programs** — MagicSchool's 3-level certification is a key differentiator for district adoption.

### 2.4 Pricing Strategy Insights

- **Free tier** is mandatory for individual teacher adoption (viral bottom-up)
- **District licensing** is where the real revenue is — quote-based, per-school or per-district
- **Annual plans** are the norm ($72-$100/yr for individual Pro)
- **Per-teacher pricing** is standard for individual; per-school for districts
- Bundle with **professional development** to justify higher price point

### 2.5 Fidelis Implications

- Build **guided tool forms** (not blank prompts) — critical for teacher adoption
- Offer **Arabic-first AI tools** — this is a massive gap MagicSchool/Eduaide don't fill
- **Chrome extension** distribution is a must — teachers live in Google Workspace
- Free tier + district licensing model
- Certifications = adoption flywheel
- AI tools must be **context-aware** of IB/British/American curriculum standards

---

## 3. SaaS Educational Platforms for Schools

### 3.1 Platform Architecture Patterns

| Platform | Core Function | Architecture Pattern | Key Features |
|----------|--------------|---------------------|--------------|
| **PowerSchool/Schoology** | SIS + LMS (K-12) | Unified cloud platform, shared data model, PowerBuddy AI tutor | Grade sync, assessment, curriculum & instruction, community |
| **ManageBac+** (Faria) | Curriculum-first LMS (IB) | Multi-curricula, modular (Curriculum, Teaching & Learning, Assessment, Communications) | IB integration, AI-powered AssessPrep, KeyChat, multi-curricula reporting |
| **OpenApply** | Admissions CRM | Bilingual forms, CRM, AI analytics, payment processing | Multi-language, re-enrolment, event management, parent portal |
| **Schoology Learning** | LMS (now PowerSchool) | Cloud-based, SIS-agnostic (stronger with PowerSchool SIS) | Grade passback, AI content creation, third-party AI tool integration |

### 3.2 Common Architecture Patterns

1. **Modular/Micro-frontend Architecture**
   - ManageBac+ modules: Curriculum, Teaching & Learning, Assessment, Communications, Service as Action
   - PowerSchool modules: SIS, LMS, Assessment, Curriculum & Instruction, Community
   - Each module independently deployable, share a common data model

2. **Multi-Curricula Support**
   - ManageBac+ supports IB (PYP/MYP/DP/CP), British, American, and International curricula
   - Curriculum-specific views, standards alignment, reporting templates
   - **Critical for Fidelis** — MENA schools run IB, British, American, and national curricula

3. **Unified Data Model**
   - PowerSchool's acquisition of Schoology + Naviance creates a unified K-12 data model
   - Student record → LMS → college/career → assessment → analytics
   - Single source of truth for student data across all modules

4. **AI Integration Layer**
   - PowerSchool's PowerBuddy: conversational AI tutor + AI content creation
   - ManageBac's AI-Powered AssessPrep: automated assessment creation
   - Third-party AI tool integration (Schoology)
   - **Key insight:** AI is being embedded into existing workflows, not standalone

5. **Parent/Student/Teacher Portals**
   - Role-based views of the same data
   - Parent: attendance, grades, communication
   - Teacher: lesson planning, grading, assessment
   - Student: assignments, submissions, feedback
   - Admin: analytics, compliance, reporting

### 3.3 Multi-Language Support

- ManageBac: multi-language, multi-currency, multi-curricula
- OpenApply: "Online bilingual forms" — explicitly built for international schools
- Multilingual chatbots (Finalsite AI): 24/7 answers in family's language
- **English/Arabic is a stated feature** for Middle East deployments

### 3.4 Fidelis Implications

- **Modular architecture** — schools buy what they need, add modules over time
- **Multi-curricula from day one** — IB, British, American, Saudi/UAE national
- **Unified data model** — student, teacher, school, parent records with cross-module access
- **AI embedded in workflow** — not a separate product, but inside lesson planning, assessment, communication
- **Role-based portals** — Teacher, Admin, Student, Parent views of the same system
- **Bilingual (EN/AR) core** — not bolted on, but baked into the data model and UI

---

## 4. Bilingual (English/Arabic) Website Design & RTL Implementation

### 4.1 Core Principles

1. **Mirror the Entire Layout, Not Just Text**
   - Logo moves to the right
   - Navigation menus invert
   - "Back" arrows point right, "Next" arrows point left
   - Carousel animations flow opposite direction
   - Eye scan pattern: Arabic = top-right (vs English top-left "F" pattern)

2. **Typography Is the #1 Failure Point**
   - English fonts: taller, narrower; Arabic: wider, shorter
   - Same font size → Arabic looks tiny and unreadable
   - **Solution:** Dynamic CSS variables to increase font-size and line-height for Arabic
   - Font pairing: e.g., Syne (English) + Almarai (Arabic)
   - Arabic text is 15-20% more verbose — layout must accommodate expansion

3. **CSS Logical Properties (Not Directional Properties)**
   ```css
   /* BAD — hardcoded direction */
   .margin-left { margin-left: 20px; }
   
   /* GOOD — logical properties */
   .margin-start { margin-inline-start: 20px; }
   /* LTR → margin-left, RTL → margin-right */
   ```
   - Use `inset-inline-start`/`inset-inline-end` instead of `left`/`right`
   - Use `padding-inline` instead of `padding-left`/`padding-right`
   - Use `border-inline-start` instead of `border-left`
   - Use `text-align: start`/`end` instead of `left`/`right`

4. **Tailwind CSS Logical Properties**
   - `ml-*` → `ms-*` (margin-inline-start)
   - `mr-*` → `me-*` (margin-inline-end)
   - `pl-*` → `ps-*` (padding-inline-start)
   - `pr-*` → `pe-*` (padding-inline-end)
   - `text-left` → `text-start`, `text-right` → `text-end`
   - `left-*` → `inset-inline-start-*` or `start-*`
   - `right-*` → `inset-inline-end-*` or `end-*`

5. **Mixed Directionality Handling**
   - Code blocks remain LTR in Arabic mode
   - Numbers remain LTR (Arabic numerals are written LTR even in Arabic)
   - Geographic maps stay in natural orientation
   - English text within Arabic content stays LTR
   - Use `<bdi>` (Bi-Directional Isolation) for user-generated content

### 4.2 Implementation Strategy

| Layer | Approach | Tools |
|-------|----------|-------|
| **HTML** | `dir="rtl"` on `<html>` or `<body>`, `lang="ar"` | Automatic attribute switching |
| **CSS** | Logical properties only, no hardcoded directional values | Tailwind CSS `rtl:` modifier, logical utilities |
| **Framework** | Next.js i18n routing or `next-intl` | `next-intl`, `next-i18next`, or custom middleware |
| **Fonts** | Arabic-optimized font stack + dynamic sizing | Almarai, Cairo, Noto Naskh Arabic, Tajawal |
| **Images** | RTL-flipped icons (arrows, chevrons, progress indicators) | SVG with `dir`-aware transforms |
| **Animations** | Direction-aware slide/fade | `@starting-style` with logical properties |
| **Forms** | Inputs auto-dir based on content | `auto` dir detection, `inputmode` for Arabic |
| **SEO** | `hreflang` tags, separate sitemaps for AR | `link rel="alternate" hreflang="ar"` |

### 4.3 Cultural UX Considerations

- **Color psychology:** Green is positive in Islamic culture; avoid pure black for text (use dark charcoal)
- **Imagery:** Culturally appropriate visuals (modest dress, local architecture, family contexts)
- **Date formats:** Hijri calendar support alongside Gregorian
- **Numbers:** Eastern Arabic numerals (٠١٢٣٤٥٦٧٨٩) as option alongside Western (0123456789)
- **Calligraphy:** Arabic typography is an art form — invest in quality Arabic fonts
- **Content volume:** Arabic text is typically 20-30% longer than English — design flexible grids

### 4.4 SEO for Bilingual Sites

- `hreflang` tags: `en` and `ar` versions of each page
- Separate URL structure: `/en/...` and `/ar/...` (path-based) or subdomain
- Arabic keyword research is distinct (not translated English keywords)
- Google serves Arabic results to Arabic-language searches
- Local ccTLD or `.com` with hreflang is fine

### 4.5 Fidelis Implications

- **Build bilingual from day one** — retrofitting RTL is painful and expensive
- **Use Tailwind CSS logical properties** — `ms-*`, `me-*`, `text-start`, `text-end`
- **Dynamic Arabic font sizing** — use CSS custom properties to scale up for Arabic
- **Arabic font stack** — Almarai + Noto Naskh Arabic as primary, Cairo as fallback
- **Accommodate 25% text expansion** in grid layouts
- **Direction-aware animations** — carousels, progress bars, timeline elements
- **Bilingual SEO strategy** — separate keyword research for Arabic

---

## 5. Modern Next.js SaaS Architecture Patterns

### 5.1 Multi-Tenancy — Three Patterns

| Pattern | Isolation | Complexity | Best For | Implementation |
|---------|-----------|-----------|----------|---------------|
| **Shared DB + tenant_id** | Row-level (RLS) | Low | 95% of SaaS products | Supabase RLS, Prisma with organization_id filter |
| **Schema-per-tenant** | Schema-level | Medium | Regulated industries | PostgreSQL schemas, multi-tenant migration tooling |
| **Database-per-tenant** | Database-level | High | Enterprise ($100K+ contracts) | Separate DB instances, connection pooling |

**Recommendation for Fidelis:** Shared DB + tenant_id with Supabase RLS enforcement at the database level. This is the 2026 industry standard for indie-to-scale B2B SaaS.

### 5.2 Tenant Resolution Strategies

| Strategy | Example | Pros | Cons |
|----------|---------|------|------|
| **Subdomain-based** | `school1.fidelis.com` | Professional, custom domains, per-tenant SSL | Wildcard DNS, complex in dev |
| **Path-based** | `fidelis.com/school1` | Simple, no DNS setup, easy dev | Less professional, URL conflicts |
| **Header-based** | `X-Tenant-ID` header | API-native, works for programmatic access | Not visible to users |

**Recommendation:** Path-based tenancy (`fidelis.com/en/school-slug/dashboard`) with subdomain support as an upgrade path for enterprise clients.

### 5.3 RBAC (Role-Based Access Control)

**Role Hierarchy Model (recommended for Fidelis):**

```
Platform-level:        Super Admin → Platform Manager → Support Agent
School-level:          School Admin → Principal → Department Head → Teacher → Staff
Classroom-level:       Teacher → Teaching Assistant → Student → Parent (read-only)
```

**Implementation layers:**

| Layer | Mechanism | Enforcement |
|-------|-----------|-------------|
| **Database** | Row-Level Security (RLS) | PostgreSQL policies, cannot be bypassed |
| **API Routes** | Next.js middleware + route handler checks | `middleware.ts` + server-side validation |
| **Server Components** | Session-based permission checks | `await auth()` → check role → render/redirect |
| **Client Components** | UI element visibility (never security) | Conditional rendering, use `hasPermission()` hook |
| **Edge Middleware** | Organization resolution + route protection | `x-tenant` header, subdomain parsing |

**Clerk Organizations** is the 2026 recommended approach:
- Built-in organization/team management
- Role-based membership (owner, admin, member)
- Organization switching built-in
- CVE-2025-29927 patched — validate in middleware AND server-side

### 5.4 Feature Flags Architecture

**Recommended approach:** GrowthBook or LaunchDarkly (managed) or a simple DB-backed system

```
Feature Flag Model:
  flag_name: string
  enabled: boolean
  tenant_ids: string[]     // specific schools
  user_ids: string[]        // beta testers
  percentage: number        // gradual rollout
  conditions: JSON          // AB test conditions
```

**Pattern for Fidelis:**
- **Per-school feature flags** — roll out AI tools to pilot schools first
- **Per-plan feature flags** — Free vs Pro vs Enterprise feature tiers
- **Gradual rollout** — 10% → 50% → 100% for new AI features
- **A/B testing** — compare AI tool variants

### 5.5 Recommended Fidelis Tech Stack (2026)

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Framework** | Next.js 15+ (App Router) | RSC, streaming, middleware, edge runtime |
| **Auth** | Clerk | Built-in organizations, RBAC, multi-tenancy, MFA |
| **Database** | PostgreSQL + Supabase | RLS, real-time, vector embeddings for AI |
| **ORM** | Prisma | Type-safe, migrations, multi-tenancy support |
| **UI** | Tailwind CSS v4 + shadcn/ui | Logical properties, RTL support, accessible |
| **i18n** | next-intl | Type-safe translations, ICU messages, RTL |
| **AI/LLM** | Vercel AI SDK + OpenRouter | Streaming, tool calling, multi-model |
| **Billing** | Stripe | Per-seat, per-school, metered billing |
| **Feature Flags** | GrowthBook (OSS) | Self-hosted, per-tenant flags |
| **Background Jobs** | Inngest | Queue-based, durable, cron |
| **Email** | Resend | Transactional emails, notifications |
| **Analytics** | PostHog | Product analytics, feature flags, session replay |

### 5.6 Key Architectural Decisions

1. **App Router with RSC** — Server Components keep data fetching close to the DB, reduce client bundles
2. **Middleware for tenant resolution** — Extract organization slug from URL path, set `x-tenant` header
3. **RLS at DB level** — Enforce tenant isolation in PostgreSQL, not just application code
4. **Server-side authorization** — Never trust client-side role checks; validate in middleware and route handlers
5. **Modular monorepo** — Turborepo with shared packages for UI, types, utilities, validation
6. **API routes as BFF** — Backend-for-frontend pattern, aggregate data from multiple services
7. **Streaming for AI** — Use Vercel AI SDK for streaming responses to AI tool outputs

### 5.7 Fidelis Implications

- **Start with shared DB + tenant_id** — scale to schema-per-tenant if needed
- **Path-based routing** for schools: `fidelis.com/{lang}/{school-slug}/{module}`
- **Clerk Organizations** for auth + RBAC — saves 150-300 developer hours
- **Supabase RLS** as the security foundation — cannot be bypassed by application bugs
- **Feature flags per school** — essential for phased AI tool rollout
- **Modular architecture** — schools buy modules (Consulting, AI Tools, LMS, Communications)
- **Billing per-seat or per-school** — Stripe with metered usage for AI tool calls

---

## 6. Cross-Cutting Recommendations for Fidelis

### 6.1 Product Roadmap Phasing

| Phase | Focus | Key Deliverables |
|-------|-------|-----------------|
| **Phase 1** | Public website + Consulting services | Bilingual EN/AR site, service pages, blog, contact, free audit lead gen |
| **Phase 2** | AI Teacher Tools (standalone) | 5-10 guided AI tools (lesson plans, assessments, parent communication), Chrome extension |
| **Phase 3** | School Platform (multi-tenant) | Dashboard, role-based portals, school onboarding, billing |
| **Phase 4** | Platform + AI integration | AI embedded in all workflows, analytics, reporting, compliance |

### 6.2 Competitive Moats

1. **Arabic-first AI tools** — No major competitor (MagicSchool, Eduaide, Brisk) supports Arabic well
2. **Multi-curricula support** — IB, British, American, Saudi/UAE national curricula
3. **Consulting + AI platform bundle** — Not just software, but expert services
4. **MENA-specific compliance** — Local data residency, regulations, cultural adaptation
5. **Bilingual by architecture** — Not translated, but designed for EN/AR from day one

### 6.3 Key UX Principles

- **Guided tool forms** — teachers don't write prompts, they fill forms
- **Chrome extension** — distribution channel for teacher adoption
- **Free tier + certifications** — viral adoption through teachers
- **District dashboards** — admin analytics for school-wide rollout
- **Mobile-first** — teachers and parents in MENA are mobile-heavy users
- **WhatsApp integration** — critical communication channel in MENA

### 6.4 Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| AI tool quality vs incumbents | Focus on Arabic quality — incumbents don't compete here |
| School sales cycles are long | Free tier for teachers (bottom-up) + consulting relationships (top-down) |
| RTL complexity | Build bilingual from day one, don't retrofit |
| Data privacy regulations | Local hosting options, SOC 2, GDPR, PDPL (Saudi) compliance |
| Multi-curricula complexity | Modular architecture, curriculum-specific plugins |

---

## 7. Key Sources

- Finalsite International Schools: finalsite.com/international-schools
- International EdTech: internationaledtech.com
- MagicSchool AI: magicschool.ai/magicschool
- TCEA Eduaide vs MagicSchool comparison: blog.tcea.org/eduaide-magicschool
- Kuraplan MagicSchool Review 2026: kuraplan.com/reviews/magicschool-ai-review
- SchoolGPT comparison: schoolgpt.app/versus/magicschool-vs-eduaide
- PowerSchool Products: powerschool.com/products
- ManageBac+: managebac.com
- OpenApply: openapply.com
- Fiikra RTL Design Guide: fiikra.com/blog-post-rtl-design
- Futurise Bilingual Design: futurise.studio/blog/arabic-english-bilingual-website-design-clinics-uae
- Achromatic Next.js Multi-Tenancy: achromatic.dev/blog/multi-tenant-architecture-nextjs
- TechNova Next.js Multi-Tenancy: technovateam.com/blog/multi-tenant-saas-architecture-in-nextjs-production-patterns
- Nextcraft Multi-Tenancy Guide: nextcraft.agency/resources/insights/nextjs-multi-tenancy
- VibeReady SaaS Starter: vibeready.sh/nextjs-saas-starter
- Medium SaaS Architecture Patterns: medium.com/appfoster/architecture-patterns-for-saas-platforms
- Clerk Organizations + RBAC: clerk.com/articles/organizations-and-role-based-access-control-in-nextjs
- Frontend Accelerator RBAC vs Multi-Tenancy: frontendaccelerator.com/blog/rbac-vs-organizations-vs-multi-tenancy-in-a-nextjs-saas
- CodeBitByBit Multi-Tenant Stack 2026: codebitbybit.com/blog/multi-tenant-saas-architecture-in-2026-next-js-supabase-rls-2026
- Marketing LTB Education Web Design: marketingltb.com/blog/agency/best-education-web-design-agencies
- Management Consulted Top Education Consulting Firms: managementconsulted.com/education-consulting-firms