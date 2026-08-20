# Fidelis Consulting Group Project State

## Last Updated
- **Timestamp:** 2026-08-20T13:15:00+02:00
- **Governance Commit:** `12a5f98` (9 state files created and pushed)
- **Definition of Done:** 10/14 criteria satisfied (all policy + procedure criteria; 4 pending fleet/telegram verification)
- **Orchestrator:** Fidelis Consulting Group Desktop Bot (M2 / AsusSilver)
- **Source Machine:** M2
- **Active Mission ID:** FCG-GOV-001 — Canonical Project Governance & Fleet Synchronization

---

## Current Production State
- **Live URL:** `https://www.fidelisconsultingroup.com`
- **Deployment Host:** VPS root@191.218.165.228
- **Deployment Commit:** `4190347` (merged `repair/production-platform-20260811` → `main`)
- **Branch:** `main`
- **Database Schema:** Baseline migration `20260811160800_baseline` — 1 applied migration
- **Services:**
  - Nginx (TLS termination, reverse proxy → localhost:3004)
  - PM2 (`fidelis-fcg` on port 3004)
  - PostgreSQL (`fidelis_fcg` database)
  - Certbot (LetsEncrypt TLS)
- **Known Production Defects:**
  - VPS currently unreachable via SSH (connection timeout as of 2026-08-20T13:00) — deployment state unverifiable remotely
  - `OPENROUTER_API_KEY=PENDING_FROM_OWNER` — AI features non-functional in production
  - Super-admin `emailVerified` may be `null` (seed leaves it unset) — admin login blocked until corrected per deployment runbook
  - Production health verification: PENDING (VPS unreachable)

---

## Current Mission
- **Title:** FCG-GOV-001 — Canonical Project Governance & Fleet Synchronization
- **Source:** Owner direct instruction via Hermes Desktop on M2
- **Start Time:** 2026-08-20T12:45:00+02:00
- **Current Phase:** Phase 3 — Complete (Governance Established)
- **Status:** COMPLETE
- **Commit:** `12a5f98`
- **Governance DoD Score:** 10/14

---

## Current Architecture

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS (globals.css)
- **Internationalization:** `next-intl` (Arabic/English RTL support)
- **On-page Components:** Header, Footer, LocaleDocument, ContactForm, InformationPage

### Backend / API
- **Framework:** Next.js Route Handlers (App Router API routes)
- **Auth:** NextAuth.js (Credentials provider)
- **RBAC:** `workspace-policy.ts` (role+tenant policy spine), `role-access.ts`, `authorization.ts`, `principal.ts`
- **Rate Limiting:** Sliding-window in-memory (`rate-limit.ts`)
- **Security Headers:** Central policy via `next.config.ts` (`security-headers.ts`)
- **Audit Logging:** Tenant-tagged `audit.ts` for privileged transitions

### Database
- **Engine:** PostgreSQL
- **ORM:** Prisma (1 baseline migration)
- **Models:** Users, Roles, UserRole, Sessions, Accounts, Schools, Departments, Subscriptions, ContactInquiry, AuditLog, Workshop, WorkshopEnrollment, SubscriptionEvent, AIMetering, FeatureOverride, SchoolFeatureOverride

### Commercial
- **Payments:** Mock adapter (`payments.ts`), `PAYMENT_PROVIDER=mock` config
- **Subscriptions:** `subscription-service.ts` with full lifecycle (active/trial/expired/past_due/canceled/unpaid)
- **Entitlements:** Pure resolver `entitlements.ts` — never overridable from client
- **CRM:** `crm.ts` — lead pipeline (new→qualified→contacted→proposal→won/lost) — admin-only
- **Workshops:** Enrollment with capacity+duplicate checks (`workshop-enrollment.ts`)

### AI
- **Router:** `ai-router.ts` — hard-coded model mappings, console.log usage tracking
- **API:** `ai/[tool]/route.ts` — currently unauthenticated, CORS wildcard, no rate limiting

### Workspaces
- **Admin:** School approval queue, CRM, billing
- **School Admin:** School overview, departments, teacher provisioning
- **HOD:** Department view + teacher oversight
- **Teacher:** Dashboard (minimal)
- **Auth Wall:** All workspaces redirect unauthenticated → `/app/login`

---

## Current Compliance / Audit State
- **Latest Audit:** `docs/audits/2026-08-11-pre-change-audit.md`
- **Critical Count:** 0 (all P0/P1 defects from original audit resolved in repair branch)
- **High Count:** 1 (AI route unauthenticated + no CORS restriction)
- **Medium Count:** 3 (OpenRouter key not set, emailVerified not seeded, admin sign-in not verified)
- **Low Count:** 2 (carried E2E authenticated user-journey tests, Arabic/RTL workspace flows)
- **Open Regressions:** 0

---

## Active Workstreams
| Task ID | Machine | Delegate | Files Owned | Status | Dependency |
|---------|---------|----------|-------------|--------|------------|
| FCG-GOV-001 | M2 | Fidelis Consulting Bot | governance/* | IN PROGRESS | — |
| (no other active workstreams) | | | | | |

---

## Completed Work
- **2026-08-11:** Pre-change technical audit (docs/audits/2026-08-11-pre-change-audit.md)
- **2026-08-11:** Phased production delivery plan (.hermes/plans/)
- **2026-08-12:** Phase 3 — Back-office workspaces (school_admin, HOD, teacher) — QA verified
- **2026-08-12:** Phase 4 — Commercial core (entitlements, payments mock, CRM, workshops) — QA verified
- **2026-08-12:** Phase 5 — Security hardening (headers, rate-limit, health endpoint) — QA verified
- **2026-08-12:** Full merge of `repair/production-platform-20260811` → `main` (commit `4190347`)
- **54/54** Vitest unit tests passing (all phases)
- **10/10** Playwright E2E tests passing (public smoke, discovery/SEO/a11y, auth-rbac, security)

---

## In Progress
- **FCG-GOV-001:** Creating canonical governance state files (this document + 7 supporting files)

---

## Known Defects
| ID | Severity | Status | Summary |
|----|----------|--------|---------|
| FCG-D-001 | HIGH | OPEN | AI route `/api/ai/[tool]` unauthenticated, CORS wildcard, no rate limiting |
| FCG-D-002 | MEDIUM | OPEN | `OPENROUTER_API_KEY` not configured — AI features non-functional |
| FCG-D-003 | MEDIUM | OPEN | Super-admin `emailVerified` null in seed — login blocked without manual fix |
| FCG-D-004 | MEDIUM | OPEN | Admin sign-in never verified end-to-end (no seeded admin E2E test) |
| FCG-D-005 | LOW | DEFERRED | Authenticated multi-role user-journey E2E tests not yet implemented |
| FCG-D-006 | LOW | DEFERRED | Full Arabic/RTL workspace flows not yet implemented |
| FCG-D-007 | INFO | OPEN | VPS SSH unreachable — remote verification blocked |

---

## Resolved Defects
| ID | Severity | Resolution |
|----|----------|------------|
| (from pre-change audit) All P0/P1 public route 404s | CRITICAL | Routes created in repair branch |
| (from pre-change audit) Public login link broken | HIGH | `/login` route created redirecting to `/app/login` |
| (from pre-change audit) Missing test runner | HIGH | Vitest + Playwright configured |
| (from pre-change audit) No migration baseline | HIGH | Migration `20260811160800_baseline` created |
| (from pre-change audit) No CI | MEDIUM | `.github/workflows/quality.yml` created |
| (from pre-change audit) No deployment docs | MEDIUM | `docs/runbooks/deployment.md` created |
| Phase 3-5 QA items | ALL | Verified passing in QA reports |

---

## Test State
- **Unit (Vitest):** 54/54 PASS — last run 2026-08-12
- **E2E (Playwright):** 10/10 PASS — last run 2026-08-12
- **Test Suites:** quality-harness, public-registration, role-access, workspace-policy, rate-limit, security-headers, entitlements, payments, workshop-enrollment, CRM, public-smoke, public-discovery, auth-rbac, security

---

## Database State
- **Engine:** PostgreSQL
- **DB Name:** `fidelis_fcg`
- **Migrations:** 1 applied (20260811160800_baseline)
- **Migration Status:** Up to date (no pending changes)

---

## Deployment State
- **Host:** VPS 191.218.165.228 (currently unreachable)
- **Commit:** `4190347` — assumed deployed unless otherwise verified
- **Rollback Point:** `cda2e55` (pre-repair baseline)
- **Runbook:** `docs/runbooks/deployment.md`

---

## Fleet State
| Machine | Role | Status | Notes |
|---------|------|--------|-------|
| M2 (AsusSilver) | Orchestrator + Canonical Bot | ACTIVE | Hermes Desktop running |
| M1 | Fleet Delegate | UNVERIFIED | SSH pending |
| M3 | Fleet Delegate | UNVERIFIED | SSH pending |
| M4 | Fleet Delegate | UNVERIFIED | SSH pending |
| M5 | Fleet Delegate | UNVERIFIED | SSH pending |
| M6 | Fleet Delegate | UNVERIFIED | SSH pending |
| VPS | Production Server | UNREACHABLE | SSH timeout 2026-08-20T13:00 |

---

## Telegram State
- **Remote Command Channel:** Telegram (established)
- **Gateway Health:** To be verified in FCG-GOV-001 verification phase

---

## Architecture Decisions
| ID | Decision | Rationale | Date |
|----|----------|-----------|------|
| ADR-001 | M2 = canonical authority | Single source of truth prevents fragmented project history | 2026-08-20 |
| ADR-002 | All tasks sync via M2 first | Prevents isolated/conflicting changes | 2026-08-20 |
| ADR-003 | Persistent state files as durable recovery | Survives context compression, restarts, machine handoffs | 2026-08-20 |
| ADR-004 | Defects closed only via canonical verification | Prevents premature "fixed" claims from isolated machines | 2026-08-20 |
| ADR-005 | Mock payment provider until real provider selected | Enables full entitlement lifecycle testing without live provider | 2026-08-12 |

---

## Owner Requirements
- All Practice platform work must check current assessment taxonomy, question counts, answer-key correctness
- Admin/back-office work must verify server-side RBAC — never rely on hidden UI as security
- AI features need OpenRouter key before production activation
- Cross-project work (FCG + AEEG + Practice Buddy + Fidelis Auto) must remain isolated

---

## Next Actions
1. ⬜ **Owner action:** Review governance setup, confirm cross-machine sync model — see `FIDELIS_CANONICAL_CONTEXT_STATUS.md` DoD scorecard
2. ⬜ Re-establish VPS SSH connection and verify current production deployment
3. ⬜ Verify Telegram gateway connectivity from canonical bot (gateway running, Telegram configured)
4. ⬜ Deploy commit `4190347` to production via runbook
5. ⬜ Provision super-admin account with verified email
6. ⬜ Set `OPENROUTER_API_KEY` in production
7. ⬜ Fix AI route authentication (FCG-D-001)
8. ⬜ Implement authenticated multi-role E2E tests
9. ⬜ Implement Arabic/RTL workspace flows

---

## Blockers
- VPS SSH connection timeout — cannot verify/update production deployment remotely
- `OPENROUTER_API_KEY` pending from owner — AI features cannot be completed