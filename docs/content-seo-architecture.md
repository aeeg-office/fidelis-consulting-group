# FIDELIS CONSULTING GROUP
## Content Architecture & SEO Strategy v1.0

---

### 1. BILINGUAL CONTENT STRATEGY

**Content Approach:**
- Every page exists in English and Arabic
- English is the primary authoring language
- Arabic content is professionally translated, NOT machine-translated
- Arabic content respects cultural context, not just language
- Separate SEO metadata for each language

**Language Detection:**
- First visit: browser `Accept-Language` header
- Remembered: user preference cookie / localStorage
- Override: language switcher in header/footer
- App: interface language is user account setting
- URLs: `/page` for English, `/ar/page` for Arabic (public only)

### 2. PAGE CONTENT MATRIX

| Page | EN Title | AR Title | Purpose | Key SEO Keywords (EN) |
|------|---------|---------|---------|---------------------|
| / | Fidelis Consulting Group | فيديليس للاستشارات | Hero + services overview + CTA | education consultancy, international schools, MENA |
| /about | About Us | عن الشركة | Company story, mission, team | education consulting firm, school improvement experts |
| /services | Our Services | خدماتنا | Service overview | education consultancy services, school development |
| /services/english-consultancy | English Department Consultancy | استشارات قسم اللغة الإنجليزية | Department audits, coaching | English department audit, curriculum review, teacher coaching |
| /services/professional-development | Professional Development | التطوير المهني | PD overview | teacher professional development, CPD courses |
| /services/ai-training | AI Integration Training | التدريب على الذكاء الاصطناعي | AI training for educators | AI for teachers, AI in education training |
| /ai-platform | AI Platform for Teachers | منصة الذكاء الاصطناعي للمعلمين | AI tool platform overview | AI tools for teachers, lesson planning AI |
| /professional-development | Professional Development | التطوير المهني | Two tracks overview | teacher workshops, online CPD |
| /professional-development/english-teaching | English Teaching PD | التطوير المهني لتدريس اللغة الإنجليزية | English teaching track | English teaching certification, ESL workshops |
| /professional-development/ai-for-educators | AI for Educators PD | الذكاء الاصطناعي للمعلمين | AI education track | AI in education course, AI certification teachers |
| /resources | Resources | الموارد | Blog, downloads, case studies | education resources, teaching downloads |
| /resources/blog | Blog | المدونة | Educational articles | education blog, teaching tips, ESL |
| /insights | Insights | الرؤى | Research, analysis, thought leadership | education insights, school improvement research |
| /careers | Careers | الوظائف | Job openings | education consultancy careers, teaching jobs |
| /contact | Contact Us | اتصل بنا | Contact form + info | contact education consultant |
| /privacy | Privacy Policy | سياسة الخصوصية | Legal | privacy policy |
| /terms | Terms of Service | شروط الخدمة | Legal | terms of service |
| /cookies | Cookie Policy | سياسة ملفات تعريف الارتباط | Legal | cookie policy |

### 3. SEO IMPLEMENTATION

```typescript
// Per-page SEO configuration
interface SEOConfig {
  title: string;                    // 50-60 chars
  title_ar: string;                 // Arabic title
  description: string;              // 150-160 chars
  description_ar: string;           // Arabic description
  ogTitle: string;
  ogDescription: string;
  ogImage: string;                  // 1200×630 px
  canonical: string;                // Canonical URL
  alternates: {
    en: string;                     // English URL
    ar: string;                     // Arabic URL
  };
  schema: object;                   // JSON-LD structured data
  robots: string;                   // 'index,follow' or 'noindex,nofollow'
}
```

**SEO Components:**

1. **Next.js Metadata API** — per-page `generateMetadata()` with alternates
2. **JSON-LD Structured Data** — Organization, Website, BreadcrumbList, Article, FAQ
3. **Sitemap** — `/sitemap.xml` with all pages in both languages + `<xhtml:link rel="alternate">`
4. **Robots** — `/robots.txt` with sitemap URL
5. **OpenGraph** — Full OG tags for social sharing
6. **Twitter Cards** — `summary_large_image` for all pages
7. **Canonical URLs** — Prevent duplicate content across languages
8. **Hreflang Tags** — Proper language targeting

### 4. JSON-LD STRUCTURED DATA

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Fidelis Consulting Group",
  "alternateName": "فيدليس للاستشارات",
  "url": "https://fidelisconsultingroup.com",
  "logo": "https://fidelisconsultingroup.com/logo.png",
  "description": "Premium education consultancy for international schools in the Middle East and North Africa.",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "EG"
  },
  "foundingDate": "2024",
  "knowsLanguage": ["en", "ar"],
  "offers": [
    {
      "@type": "Service",
      "name": "English Department Consultancy",
      "description": "Comprehensive English department audits, curriculum reviews, and teacher coaching"
    },
    {
      "@type": "Service",
      "name": "Professional Development",
      "description": "Workshops and courses for English teachers and AI in education"
    }
  ]
}
```

### 5. BILINGUAL CONTENT MANAGEMENT

**Content Types:**
- **Static Content** — Pages, services, about (hardcoded in i18n files)
- **Dynamic Content** — Blog posts, resources, workshops (DB-backed with both language fields)
- **AI-Generated Content** — Tool outputs (generated in user's chosen output language)

**i18n Architecture:**
```
messages/
  en/
    common.json       # Navigation, buttons, labels, footer
    home.json         # Home page content
    about.json        # About page
    services.json     # Services pages
    ai-platform.json  # AI platform page
    pd.json           # Professional development
    resources.json    # Resources
    legal.json        # Privacy, terms, cookies
    seo.json          # SEO metadata per page
  ar/
    common.json
    home.json
    about.json
    ...
```

**Translation Workflow:**
1. Content authored in English
2. Arabic content created by professional translator
3. Both stored in the same format (parallel JSON files)
4. Future: Arabic content kan be managed through admin CMS

### 6. KEY CONTENT SECTIONS

**Home Page Hero:**
- EN: "Supporting Schools. Developing People. Improving Learning."
- AR: "دعم المدارس. تطوير الأشخاص. تحسين التعلم."

**Value Propositions:**
1. Premium English Department Consultancy for International Schools
2. Professional Development Tracks (English Teaching + AI for Educators)
3. AI Platform for Teachers — Zero Prompt Engineering Required

**Trust Signals:**
- Years of experience
- Schools served
- Teacher testimonials
- Certifications and accreditations
- Case studies with results