# FIDELIS CONSULTING GROUP
## Information Architecture v1.0

---

### 1. SITE MAP OVERVIEW

```
FIDELIS CONSULTING GROUP
│
├── PUBLIC WEBSITE                    [/, public]
│   ├── Home                          [/]
│   ├── About                         [/about]
│   ├── Services                      [/services]
│   │   ├── English Department Consultancy   [/services/english-consultancy]
│   │   ├── Professional Development         [/services/professional-development]
│   │   └── AI Integration Training          [/services/ai-training]
│   ├── AI Platform                   [/ai-platform]
│   ├── Professional Development      [/professional-development]
│   │   ├── Track: English Teaching   [/professional-development/english-teaching]
│   │   └── Track: AI for Educators   [/professional-development/ai-for-educators]
│   ├── Resources                     [/resources]
│   │   ├── Blog                      [/resources/blog]
│   │   ├── Downloads                 [/resources/downloads]
│   │   ├── Case Studies              [/resources/case-studies]
│   │   └── Webinars                  [/resources/webinars]
│   ├── Insights                     [/insights]
│   ├── Careers                       [/careers]
│   ├── Contact                       [/contact]
│   ├── Login                         [/login]
│   ├── Privacy Policy                [/privacy]
│   ├── Terms of Service              [/terms]
│   ├── Cookie Policy                 [/cookies]
│   ├── 404                           [/404]
│   └── Search                        [/search]
│
├── SECURE EDUCATOR PLATFORM          [/app, authenticated]
│   │
│   ├── AUTH FLOW
│   │   ├── Login                     [/app/login]
│   │   ├── Register                  [/app/register]
│   │   ├── Verify Email              [/app/verify-email]
│   │   ├── Forgot Password           [/app/forgot-password]
│   │   └── Reset Password            [/app/reset-password]
│   │
│   ├── DASHBOARDS
│   │   ├── Administrator Dashboard   [/app/admin]
│   │   ├── School Admin Dashboard    [/app/school-admin]
│   │   ├── HoD Dashboard             [/app/hod]
│   │   └── Teacher Dashboard         [/app/teacher]
│   │
│   ├── AI TOOLS [FEATURE-FLAGGED]
│   │   ├── PLANNING
│   │   │   ├── Lesson Planner        [/app/tools/lesson-planner]
│   │   │   ├── Unit Planner          [/app/tools/unit-planner]
│   │   │   └── Learning Objective Generator  [/app/tools/learning-objectives]
│   │   │
│   │   ├── TEACHING
│   │   │   ├── Differentiation Assistant    [/app/tools/differentiation]
│   │   │   └── Exit Ticket Generator        [/app/tools/exit-tickets]
│   │   │
│   │   ├── RESOURCE CREATION
│   │   │   ├── Worksheet Builder     [/app/tools/worksheet-builder]
│   │   │   ├── Reading Passage Generator    [/app/tools/reading-passage]
│   │   │   ├── Writing Prompt Generator     [/app/tools/writing-prompts]
│   │   │   └── Homework Generator    [/app/tools/homework-generator]
│   │   │
│   │   ├── ASSESSMENT
│   │   │   ├── Quiz Builder          [/app/tools/quiz-builder]
│   │   │   ├── Assessment Generator  [/app/tools/assessment-generator]
│   │   │   ├── Rubric Builder        [/app/tools/rubric-builder]
│   │   │   └── Success Criteria Generator   [/app/tools/success-criteria]
│   │   │
│   │   ├── FEEDBACK
│   │   │   ├── Writing Feedback Assistant   [/app/tools/writing-feedback]
│   │   │   ├── Grammar Analysis      [/app/tools/grammar-analysis]
│   │   │   └── Student Feedback Generator   [/app/tools/student-feedback]
│   │   │
│   │   ├── COMMUNICATION
│   │   │   ├── Parent Letter Generator      [/app/tools/parent-letter]
│   │   │   └── Professional Email Generator [/app/tools/professional-email]
│   │   │
│   │   ├── PROFESSIONAL DEVELOPMENT
│   │   │   └── Meeting Agenda Generator     [/app/tools/meeting-agenda]
│   │   │
│   │   └── DEPARTMENT LEADERSHIP
│   │       ├── Department Report Generator  [/app/tools/dept-report]
│   │       └── Department Improvement Planner [/app/tools/dept-improvement]
│   │
│   ├── PROFESSIONAL DEVELOPMENT
│   │   ├── My Workshops              [/app/workshops]
│   │   ├── Workshop View             [/app/workshops/[id]]
│   │   ├── My Courses                [/app/courses]
│   │   ├── Course View               [/app/courses/[id]]
│   │   ├── My Certificates           [/app/certificates]
│   │   └── Certificate View          [/app/certificates/[id]]
│   │
│   ├── PROFILE & SETTINGS
│   │   ├── My Profile                [/app/profile]
│   │   ├── Account Settings          [/app/settings]
│   │   │   ├── Language Preferences  [Interface / Output]
│   │   │   ├── Notification Settings
│   │   │   └── Subscription          [/app/settings/subscription]
│   │   └── Usage & Billing           [/app/billing]
│   │
│   ├── ADMIN (Role-Gated)
│   │   ├── User Management           [/app/admin/users]
│   │   ├── School Management         [/app/admin/schools]
│   │   ├── Subscription Management   [/app/admin/subscriptions]
│   │   ├── AI Usage Monitoring       [/app/admin/ai-usage]
│   │   ├── Feature Flag Control      [/app/admin/features]
│   │   ├── Content Management        [/app/admin/content]
│   │   ├── System Settings           [/app/admin/settings]
│   │   └── Audit Log                 [/app/admin/audit]
│   │
│   ├── SCHOOL ADMIN (Role-Gated)
│   │   ├── Manage Teachers           [/app/school-admin/teachers]
│   │   ├── Manage Subscriptions      [/app/school-admin/subscriptions]
│   │   ├── School Reports            [/app/school-admin/reports]
│   │   └── AI Usage Overview         [/app/school-admin/ai-usage]
│   │
│   └── FUTURE MODULES [DISABLED - FEATURE FLAGGED]
│       ├── Student Portal            [/app/students]
│       ├── Parent Portal             [/app/parents]
│       ├── Timetables                [/app/timetables]
│       ├── Attendance                [/app/attendance]
│       ├── OCR / Handwriting         [/app/ocr]
│       ├── Bulk Grading              [/app/grading]
│       ├── School Analytics          [/app/analytics]
│       ├── Accreditation             [/app/accreditation]
│       ├── HR                        [/app/hr]
│       ├── Recruitment               [/app/recruitment]
│       ├── LMS                       [/app/lms]
│       └── Finance                   [/app/finance]
│
└── GLOBAL
    ├── Public API                    [/api/]
    ├── Webhooks                      [/api/webhooks/]
    └── Health Check                  [/api/health]
```

### 2. PAGE TYPES

| Type | Description | Example Pages |
|------|-------------|---------------|
| **Landing** | Marketing-focused, high-impact | Home, AI Platform |
| **Content** | Information delivery | About, Services, Resources |
| **Listing** | Filtered content collections | Blog, Workshops, Courses |
| **Detail** | Single item view | Blog Post, Workshop View |
| **Form** | Data collection | Contact, Register, Profile Edit |
| **Dashboard** | Data visualization + actions | All dashboards |
| **Tool** | AI-powered interactive | All AI tools |
| **Admin** | System management | All admin pages |
| **Utility** | Auth, legal, search | Login, Privacy, 404 |

### 3. NAVIGATION STRUCTURE

**Public Header (Primary):**
Home | About | Services ▼ | AI Platform | PD ▼ | Resources ▼ | Insights | Contact | [Login]

**Services Dropdown:**
English Department Consultancy | Professional Development | AI Integration Training

**PD Dropdown:**
Track: English Teaching | Track: AI for Educators

**Resources Dropdown:**
Blog | Downloads | Case Studies | Webinars

**Authenticated Header:**
[Dashboard] | [AI Tools ▼] | [My PD ▼] | [Admin ▼] | [Profile] | [Logout]

**AI Tools Dropdown:**
Planning | Teaching | Resource Creation | Assessment | Feedback | Communication | PD | Department Leadership

**Footer (Global):**
Brand + Tagline | Services | PD Tracks | Resources | Legal | Social | Newsletter Signup | [Language Switcher EN/AR]

### 4. BREADCRUMB PATTERNS

- Home > About
- Home > Services > English Department Consultancy
- Home > Resources > Blog > [Post Title]
- Home > [App] > AI Tools > Lesson Planner
- Home > [App] > Workshops > [Workshop Title]

### 5. BILINGUAL URL STRUCTURE

```
English:  /about
Arabic:   /ar/about
          /ar/%D8%AD%D9%88%D9%84

English:  /ai-platform
Arabic:   /ar/ai-platform
          /ar/%D9%85%D9%86%D8%B5%D8%A9-%D8%A7%D9%84%D8%B0%D9%83%D8%A7%D8%A1-%D8%A7%D9%84%D8%A7%D8%B5%D8%B7%D9%86%D8%A7%D8%B9%D9%8A

App URLs (always user-preference based, not path-based):
/app/tools/lesson-planner  → shown in user's chosen interface language
```

### 6. CONTENT HIERARCHY

| Level | Example | URL Pattern |
|-------|---------|-------------|
| L1 - Section | Professional Development | /professional-development |
| L2 - Track | AI for Educators | /professional-development/ai-for-educators |
| L3 - Module | Workshop: AI Lesson Planning | /professional-development/ai-for-educators/ai-lesson-planning |
| L4 - Unit | Session 1: Introduction | (within platform) |

### 7. SEARCH ARCHITECTURE

- **Public search**: Full-text across public pages, blog, resources
- **Platform search**: Scoped to user's accessible content
- **AI tool search**: Tool name and description search
- **PD search**: Workshops, courses, certificates, resources