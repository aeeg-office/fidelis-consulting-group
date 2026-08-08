# FIDELIS CONSULTING GROUP
## Product Vision Document v1.0

---

### 1. EXECUTIVE SUMMARY

Fidelis Consulting Group delivers a premium bilingual (English/Arabic) education consultancy platform with an integrated AI-powered teacher productivity suite. The platform serves international schools across the Middle East and North Africa, providing English Department consultancy, professional development, and AI tools that feel like software — not chatbots.

### 2. PRODUCT MISSION

*"Supporting Schools. Developing People. Improving Learning."*

Empower every international school educator in the MENA region with consultancy-grade tools, professional development, and AI assistance that requires zero prompt engineering — all delivered through a premium, bilingual interface.

### 3. PRODUCT PRINCIPLES

| Principle | Description |
|-----------|-------------|
| **AI as Software** | Every AI interaction uses structured forms, dropdowns, presets — never blank text boxes requiring prompt engineering |
| **Bilingual by Default** | English and Arabic are first-class citizens; every surface supports both with independent interface/output language settings |
| **Modular by Design** | Feature flags control every capability; future modules activate without architecture changes |
| **Consultancy-Grade Quality** | Every output reflects the quality standards expected of a premium education consultancy |
| **Cost-Optimized AI** | OpenRouter model routing minimizes cost without sacrificing quality through intelligent model selection |
| **Scalable from Solo to Enterprise** | Architecture supports single consultant today, hundred-school organization tomorrow |

### 4. TARGET AUDIENCE

**Primary:**
- International School English Departments (MENA region)
- School Administrators seeking consultancy
- Teachers seeking professional development
- Independent teachers subscribing to AI platform

**Secondary (future):**
- Students and parents (separate portals)
- Schools outside MENA region
- Non-English departments

### 5. BUSINESS MODEL — THREE REVENUE STREAMS

| Stream | Product | Pricing Model |
|--------|---------|---------------|
| **Consultancy** | English Department audits, coaching, improvement plans | Per-engagement project fees |
| **Professional Development** | Workshops, courses, certificates (English Teaching + AI for Educators tracks) | Per-workshop / course bundles |
| **AI Subscription** | 20+ AI tools for teachers | Monthly per-teacher; tiered school plans |

Independent revenue streams — teachers can subscribe to AI without attending workshops.

### 6. COMPETITIVE LANDSCAPE

| Category | Competitors | Fidelis Advantage |
|----------|------------|-------------------|
| Teacher AI | MagicSchool AI (80+ tools, EN-only), Eduaide (30+ tools, EN-only), Brisk Teaching (20+ tools, EN-only, 600K teachers) | **Only bilingual EN/AR teacher AI platform**, consultancy-backed quality, MENA curriculum support |
| School SaaS | PowerSchool, ManageBac, Schoology | Modular AI-first, lower cost, independent teacher subscriptions, Arabic-first |
| Education Consultancy | ISC Research, ACER, regional firms | Integrated AI platform, PD-consultancy-software trifecta |
| PD Platforms | Coursera for Campus, edX for Schools | Region-specific content, Arabic language, AI integration |

### 7. PRODUCT ROADMAP

**Phase A — MVP (Current Build)**
- Public website (17 pages, bilingual EN/AR)
- Secure educator platform (auth, RBAC)
- 22 core AI tools
- School & teacher registration
- Workshop portal (content delivery)
- Admin dashboard

**Phase B — Enhanced AI & Subscriptions**
- Tiered subscription system (Stripe/Paddle)
- AI usage tracking & quotas
- School administrator dashboard
- Professional development certification engine
- Payment integration

**Phase C — Advanced Features**
- Student & parent portals (locked behind feature flags)
- Department leadership tools
- Bulk operations for school administrators
- Advanced analytics

**Phase D — Full SaaS Platform**
- School timetables
- OCR/handwriting recognition
- Bulk grading
- Accreditation tools
- HR & recruitment
- LMS integration
- Mobile app

### 8. KEY METRICS (TARGETS)

| Metric | Target |
|--------|--------|
| Lighthouse score | 95+ |
| AI tool response time | <3s |
| Supported languages | 2 (EN/AR) → 4+ |
| WCAG compliance | AA |
| Uptime | 99.9% |
| AI cost per teacher/month | <$2 |

### 9. TECHNOLOGY STACK (DECIDED)

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14+ (App Router) |
| Language | TypeScript (strict) |
| UI Framework | Tailwind CSS v4 + custom design system |
| RTL | Tailwind RTL plugin + CSS logical properties |
| Backend | Next.js API routes + tRPC |
| Database | PostgreSQL (via Supabase or direct) |
| ORM | Prisma |
| Auth | NextAuth.js / Auth.js |
| AI | OpenRouter API (cost-optimized routing) |
| Payments | Stripe / Paddle |
| Feature Flags | GrowthBook / custom flag system |
| File Storage | S3-compatible (Cloudflare R2) |
| Deployment | Docker + Coolify / VPS |
| Cache | Redis (Upstash) |

### 10. ASSUMPTIONS & DECISIONS

**Assumptions:**
- MENA international schools primarily use English curriculum (IGCSE, IB, American)
- Teachers prefer structured tools over free-form AI chat
- School procurement cycles prefer annual contracts with monthly payment options
- Arabic-speaking teachers want Arabic interface with AI outputs in English for student materials

**Decisions Made:**
- Next.js App Router over Pages Router (better RTL/i18n support)
- tRPC for type-safe API communication
- OpenRouter over direct model APIs (cost optimization through model routing)
- PostgreSQL over NoSQL (relational data needs for school/user/permission hierarchies)
- Feature flags in database, not environment variables (dynamic per-tenant control)