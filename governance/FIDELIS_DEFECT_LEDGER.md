# Fidelis Consulting Group — Defect Ledger

## Status Definitions
| Status | Meaning |
|--------|---------|
| OPEN | Reported, not yet confirmed or assigned |
| CONFIRMED | Reproduced and documented |
| IN PROGRESS | Assigned and actively being worked |
| READY FOR TEST | Fix implemented, awaiting verification |
| FAILED RETEST | Verification failed, returned to implementer |
| VERIFIED | Tested and confirmed resolved |
| DEPLOYED | Fix live in production |
| PRODUCTION VERIFIED | Confirmed working on live site |
| BLOCKED | Cannot proceed (dependency, key, access) |
| DEFERRED | Acknowledged, scheduled for later phase |

---

## Open Defects

### FCG-D-001 — AI Route Unauthenticated
- **Severity:** HIGH
- **Status:** OPEN
- **Affected:** `src/app/api/ai/[tool]/route.ts`
- **Description:** AI route does not require session, permission, tenant entitlement, quota, rate limit, or tool allow-list. Returns internal provider error text. CORS: `Access-Control-Allow-Origin: *` explicitly enabled.
- **Reported:** 2026-08-11 (pre-change audit)
- **Reported By:** Pre-change audit
- **Root Cause:** Missing authentication middleware on AI API routes
- **Expected Fix:** Add session verification, rate limiting, and scope CORS to specific origins
- **Assigned To:** PENDING
- **Dependency:** `OPENROUTER_API_KEY` must be available for end-to-end verification

### FCG-D-002 — OpenRouter API Key Not Configured
- **Severity:** MEDIUM
- **Status:** OPEN
- **Affected:** `.env` (production)
- **Description:** `OPENROUTER_API_KEY=PENDING_FROM_OWNER` — AI features non-functional until key is provided
- **Reported:** 2026-08-20 (reconnaissance)
- **Root Cause:** Owner key not yet provided
- **Expected Fix:** Owner provides key via private channel; deploy with updated .env
- **Assigned To:** Owner (blocks AI deployment)

### FCG-D-003 — Super-Admin emailVerified is NULL in Seed
- **Severity:** MEDIUM
- **Status:** OPEN
- **Affected:** `prisma/seed.ts` and production admin account
- **Description:** User.emailVerified is null in seed — login is blocked when null. Super-admin cannot sign in without manual DB fix.
- **Reported:** 2026-08-11 (pre-change audit) / 2026-08-12 (Phase 5 QA)
- **Root Cause:** Seed does not set emailVerified for admin account
- **Expected Fix:** Update seed to set emailVerified, or apply runbook fix per deployment docs
- **Assigned To:** Fidelis Bot (during deployment)

### FCG-D-004 — Admin Sign-In Never End-to-End Verified
- **Severity:** MEDIUM
- **Status:** OPEN
- **Affected:** Platform admin sign-in flow
- **Description:** No authenticated admin E2E test exists. Super-admin dashboard has never been browser-tested through actual sign-in.
- **Reported:** 2026-08-12 (Phase 4 QA)
- **Root Cause:** Requires seeded disposable DB with credentials — deferred to Phase 6
- **Expected Fix:** Create seeded test DB + Playwright auth flow for admin role
- **Assigned To:** PENDING

### FCG-D-005 — Authenticated Multi-Role E2E Tests Not Implemented
- **Severity:** LOW
- **Status:** DEFERRED
- **Affected:** `tests/e2e/`
- **Description:** No Playwright tests exercise actual sign-in and form submission for any role (admin, school_admin, HOD, teacher)
- **Reported:** 2026-08-12 (Phase 3 QA)
- **Root Cause:** Requires seeded accounts against a disposable DB — deferred to Phase 6
- **Expected Fix:** Implement full user-journey matrix with seeded disposable DB
- **Assigned To:** PENDING

### FCG-D-006 — Full Arabic/RTL Workspace Flows Not Implemented
- **Severity:** LOW
- **Status:** DEFERRED
- **Affected:** All authenticated workspace flows
- **Description:** Arabic/RTL is a cross-cutting concern — not yet implemented across workspace UIs
- **Reported:** 2026-08-12 (Phase 5 QA)
- **Root Cause:** Large task touching next-intl on app shell — deferred
- **Expected Fix:** Implement Arabic/RTL across all authenticated pages
- **Assigned To:** PENDING

### FCG-D-007 — VPS SSH Unreachable
- **Severity:** INFO
- **Status:** OPEN
- **Affected:** VPS 191.218.165.228
- **Description:** SSH connection times out as of 2026-08-20T13:00. Cannot verify/update production deployment remotely.
- **Reported:** 2026-08-20
- **Root Cause:** Unknown (network/VPS issue)
- **Expected Fix:** Investigate VPS connectivity; attempt via VPS provider dashboard
- **Assigned To:** PENDING

---

## Resolved Defects

### (Pre-Change Audit Resolved Items)
All P0/P1 defects from the 2026-08-11 audit were resolved in the repair branch `repair/production-platform-20260811` (merged to main at `4190347`):

| Original ID | Description | Severity | Resolution | Closed Date |
|-------------|-------------|----------|------------|-------------|
| AUD-P0-001 | Public routes return 404 (12 routes) | CRITICAL | All routes created | 2026-08-12 |
| AUD-P0-002 | Public login link to wrong path | HIGH | `/login` route created | 2026-08-12 |
| AUD-P0-003 | Header/Footer inert conversion controls | HIGH | Wired to real routes/forms | 2026-08-12 |
| AUD-P0-004 | Generic README | LOW | Deployment runbook created | 2026-08-12 |
| AUD-P0-005 | No migration baseline | HIGH | Baseline migration created | 2026-08-12 |
| AUD-P1-001 | Registration allows role selection | HIGH | Registration hardened | 2026-08-12 |
| AUD-P1-002 | Middleware only checks login, not role | HIGH | Workspace policy + role guards | 2026-08-12 |
| AUD-P1-003 | No test infrastructure | HIGH | Vitest + Playwright configured | 2026-08-12 |
| AUD-P1-004 | No CI workflow | MEDIUM | GitHub Actions quality.yml | 2026-08-12 |

---

## Defect Statistics

| Status | Count |
|--------|-------|
| OPEN | 4 (1 HIGH, 2 MEDIUM, 1 INFO) |
| DEFERRED | 2 (LOW) |
| VERIFIED | 0 |
| DEPLOYED | 0 |
| PRODUCTION VERIFIED | 0 |
| RESOLVED (from pre-change audit) | 8 |

**Total Open+Deferred: 6**
**Total Critical/High Open: 1 (FCG-D-001)**

---

## Notes
- Defects may only be closed by canonical verification (browser-level where applicable)
- Regressions must be reopened when reproduced, even if previously marked resolved
- All user-facing repairs require browser-level verification before closure