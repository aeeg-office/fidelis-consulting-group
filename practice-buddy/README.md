# AEEG Test Prep Practice Buddy

## Complete Platform Documentation

### Overview
The AEEG Test Prep Practice Buddy is a comprehensive SAT/ACT/EST/IELTS preparation platform built for the American Egyptian Education Group. It provides a unified practice experience across web, Android, iOS, and Windows platforms.

### Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Frontend Layer                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │ Website  │ │ Android  │ │   iOS    │ │ Windows  │ │
│  │ (Next.js)│ │ (React   │ │ (React   │ │(Electron)│ │
│  │          │ │  Native) │ │  Native) │ │          │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
├─────────────────────────────────────────────────────┤
│                   API Layer (Express.js)              │
│         Authentication · Practice · Analytics         │
│         Questions · Admin · Teacher · Subscriptions   │
├─────────────────────────────────────────────────────┤
│                   Database Layer (PostgreSQL)          │
│   Users · Questions · Sessions · Attempts · Mastery   │
│   Classes · Assignments · Access Codes · Subscriptions│
└─────────────────────────────────────────────────────┘
```

### Technology Stack

| Component | Technology | Justification |
|-----------|-----------|---------------|
| **Backend** | Node.js + Express + TypeScript | Fast, scalable, large ecosystem |
| **Database** | PostgreSQL + Prisma | Reliable, ACID-compliant, great DevX |
| **Frontend (Web)** | Next.js 15 + Tailwind v4 | Existing AEEG stack, SSR, SEO |
| **Mobile** | React Native | Code sharing across Android + iOS |
| **Desktop** | Electron | Cross-platform Windows + Mac |
| **Auth** | JWT + bcrypt | Stateless, secure, simple |
| **Math Rendering** | KaTeX (via next/katex) | Fast, accessible math typesetting |

### Getting Started

#### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

#### Backend Setup

```bash
cd practice-buddy/backend
npm install
cp .env.example .env  # Edit database credentials
npx prisma db push
npx tsx src/seed.ts   # Seed with demo data
npx tsx src/index.ts  # Start API server on :3001
```

#### Frontend Setup (Website Integration)

```bash
cd /path/to/fidelis-platform
npm install
# Visit http://localhost:3000/practice-buddy
```

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Sign in
- `GET /api/auth/me` - Get current user
- `POST /api/auth/change-password` - Change password

#### Questions
- `GET /api/questions` - List questions (filterable)
- `GET /api/questions/:id` - Get question
- `POST /api/questions/:id/reveal` - Reveal answer
- `POST /api/questions/:id/bookmark` - Toggle bookmark
- `POST /api/questions/:id/flag` - Flag issue

#### Practice
- `POST /api/practice/sessions` - Start session
- `POST /api/practice/sessions/:id/answer` - Submit answer
- `GET /api/practice/sessions` - List sessions
- `GET /api/practice/sessions/:id` - Session details
- `POST /api/practice/sessions/:id/complete` - Complete session

#### Mastery
- `GET /api/mastery` - Get all mastery data
- `GET /api/mastery/summary` - Get mastery summary

#### Teacher
- `GET/POST /api/teacher/classes` - Manage classes
- `GET/POST /api/teacher/assignments` - Manage assignments
- `GET/POST /api/teacher/students` - Manage students

#### Admin
- `GET/POST/PUT /api/admin/questions` - Manage question bank
- `GET /api/admin/flags` - Review question flags
- `GET /api/admin/users` - Manage users
- `POST /api/access-codes` - Create access codes
- `POST /api/subscriptions/plans` - Manage plans
- `GET /api/analytics/admin` - Platform analytics

### Practice Modes

1. **Targeted Practice** - Select subject, domain, difficulty, question count
2. **Quick Practice** - One-tap options (5-min warm-up, 10Q mix, timed sprint)
3. **Random Practice** - Mixed question sets
4. **Adaptive Practice** - Automated difficulty based on performance
5. **Exam Simulation** - Full-length 33Q RW or 27Q Math module
6. **Assignment Mode** - Teacher-assigned practice with deadlines

### Answer & Feedback Flow

**First Attempt:**
- Correct → Praise + Strategy + Optional Explanation
- Incorrect → "Not quite" + Strategy + Hint + Try Again

**Second Attempt:**
- Correct → "Correct on second attempt!" + Explanation
- Incorrect → Reveal answer + Full explanation + Misconceptions

### Roles & Permissions

| Role | Capabilities |
|------|-------------|
| **Student** | Practice, view progress, redeem access codes |
| **Free Student** | Limited daily questions |
| **Teacher** | Create classes, assign work, view student progress, create student accounts |
| **Parent** | Manage child accounts, set goals, view progress |
| **Administrator** | Full Q&A management, user management, access codes |
| **Super Administrator** | All permissions including audit logs |

### Deployment

#### Backend (VPS)
```bash
# Using PM2
npm install -g pm2
cd practice-buddy/backend
pm2 start npx --name "practice-buddy-api" -- tsx src/index.ts
pm2 save
pm2 startup
```

#### Frontend (Part of Next.js site)
```bash
cd /path/to/fidelis-platform
npm run build
pm2 restart next
```

### Security Checklist

- [x] JWT authentication with expiry
- [x] Password hashing (bcrypt, 12 rounds)
- [x] Rate limiting on auth endpoints
- [x] CORS configured for frontend origin
- [x] Helmet security headers
- [x] Role-based access control
- [x] Account lockout after failed attempts
- [x] Input validation via Zod
- [x] SQL injection prevention (Prisma)
- [x] No plain-text passwords stored
- [x] Answer keys hidden from students

### Content Protection

- Students never receive correct answers in question fetch
- Answer keys only revealed after practice attempt
- Token-based authentication required for all endpoints
- No downloadable question banks
- Rate limiting to prevent scraping
- Audit logging for all admin actions

### Demo Accounts

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Teacher | teacher | teacher123 |
| Student | student | student123 |
| Access Code | AEEG-DEMO-2024 | — |

### Future Enhancements

1. Stripe billing integration for subscription plans
2. AI tutoring layer (OpenAI-powered hints)
3. Full-length adaptive test engine
4. Spaced repetition review system
5. Parent dashboard
6. School/institutional analytics
7. iOS App Store deployment
8. Google Play Store deployment
9. Windows Store / direct download distribution
10. Arabic language interface (RTL support)

### Database Schema Overview

- **17 models**: User, Question, Exam, Subject, Domain, Category, Subcategory, PracticeSession, StudentAttempt, Mastery, Class, Assignment, AccessCode, Subscription, AuditLog, etc.
- **Relations**: Full relational integrity with cascading deletes where appropriate
- **Indexes**: Unique constraints on code fields, composite indexes on common queries

### File Structure

```
practice-buddy/
├── backend/
│   ├── prisma/schema.prisma    # Database schema
│   ├── src/
│   │   ├── index.ts            # API entry point
│   │   ├── seed.ts             # Database seed
│   │   ├── middleware/auth.ts  # JWT authentication
│   │   └── routes/             # API route handlers
│   ├── .env                    # Environment variables
│   └── package.json
├── frontend/
│   ├── components/             # React components
│   │   ├── PracticeBuddyApp.tsx # Main app wrapper
│   │   ├── LoginPage.tsx       # Authentication
│   │   ├── PracticePage.tsx    # Practice interface
│   │   ├── StudentDashboard.tsx
│   │   ├── TeacherDashboard.tsx
│   │   └── AdminDashboard.tsx
│   ├── lib/api.ts              # API client
│   └── styles/                 # CSS modules
├── mobile/                     # React Native (Android + iOS)
│   └── src/
├── desktop/                    # Electron (Windows)
│   └── src/
├── docs/                       # Documentation
└── scripts/                    # Utility scripts
```