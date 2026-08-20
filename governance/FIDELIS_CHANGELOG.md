# Fidelis Consulting Group — Changelog

## Log Format
Entries are chronological. Each entry records: date, commit (or task), machine, summary of changes, verification status.

---

### 2026-08-20 — FCG-GOV-001: Canonical Project Governance
- **Commit:** N/A (documentation)
- **Machine:** M2 (Fidelis Consulting Bot)
- **Description:** Created 8 canonical state files establishing permanent governance model:
  - `governance/FIDELIS_CONSULTING_PROJECT_STATE.md` — full project state
  - `governance/FIDELIS_ACTIVE_WORKSTREAMS.md` — workstream tracking with file locks
  - `governance/FIDELIS_DEFECT_LEDGER.md` — canonical defect management
  - `governance/FIDELIS_TEST_STATE.md` — test coverage and results
  - `governance/FIDELIS_DEPLOYMENT_STATE.md` — deployment tracking
  - `governance/FIDELIS_DECISIONS.md` — architecture decision records
  - `governance/FIDELIS_CHANGELOG.md` — this history
  - `governance/FIDELIS_FLEET_STATUS.md` — fleet node state
- **Verification:** In progress (governance setup phase)

---

### 2026-08-12 — Full Merge: Production Platform Repair (P0-P5)
- **Commit:** `4190347` (merge commit)
- **Machine:** M2 (Fidelis Bot / Git)
- **Description:** Merged `repair/production-platform-20260811` into `main`. Complete production platform repair covering:
  - Security hardening (headers, rate-limit, health endpoint)
  - Authentication & RBAC (registration hardened, workspace policy, role guards)
  - Workspaces (school_admin, HOD, teacher back-office)
  - Commercial (entitlements, mock payments, subscriptions, CRM, workshops)
  - Public routes (12 previously-broken routes created)
  - Deployment runbook
  - CI workflow (GitHub Actions)
- **Files Changed:** 98 files, +11,483 lines
- **Tests:** 54/54 unit PASS, 10/10 E2E PASS
- **Build:** PASS (62 static routes)
- **Deployment Status:** NOT DEPLOYED (VPS unreachable)

---

### 2026-08-12 — Phase 5: Security Hardening & Deployment Readiness
- **Branch:** `repair/production-platform-20260811`
- **Machine:** M2
- **Delivered:**
  - `security-headers.ts` — central header policy (XFO DENY, CSP, etc.)
  - `rate-limit.ts` — sliding-window in-memory limiter (10/min per IP on registration)
  - `/api/health` — liveness/readiness probe verifying DB connectivity
  - `docs/runbooks/deployment.md` — backup→migrate→deploy→smoke→rollback procedure
  - `tests/e2e/security.spec.ts` — header + health assertions
- **Tests:** 54/54 unit PASS (new: security-headers 2, rate-limit 3)

### 2026-08-12 — Phase 4: Commercial Core
- **Branch:** `repair/production-platform-20260811`
- **Machine:** M2
- **Delivered:**
  - `entitlements.ts` — pure resolver (active/trial/expired/past_due/canceled/unpaid)
  - `payments.ts` — pluggable PaymentProvider + MockProvider
  - `subscription-service.ts` — subscription lifecycle with audit
  - `crm.ts` — lead pipeline (new→qualified→contacted→proposal→won/lost)
  - `workshop-enrollment.ts` — capacity/duplicate checks
  - API routes: billing/webhook, billing/status, crm/leads, workshops/enroll
  - UI: /app/billing, /app/dashboard/admin/crm
- **Tests:** 49/49 unit PASS (new: entitlements 7, payments 8, workshop-enrollment 5, CRM 7)

### 2026-08-12 — Phase 3: Back-Office Workspaces
- **Branch:** `repair/production-platform-20260811`
- **Machine:** M2
- **Delivered:**
  - `workspace-policy.ts` — central role+tenant scoping rules
  - `principal.ts` — authenticated principal resolver (schoolId, departmentId from DB)
  - `audit.ts` — tenant-tagged audit logger
  - API routes: admin/schools, school/overview, school/departments, school/teachers, hod/department
  - UI: /app/dashboard/admin/schools, /app/school/*, /app/hod/*
- **Tests:** 22/22 unit PASS (new: workspace-policy 13)

### 2026-08-11 — Baseline Pre-Change Audit
- **Commit:** `cda2e55`
- **Machine:** M2 (Fidelis Bot)
- **Delivered:** `docs/audits/2026-08-11-pre-change-audit.md`
  - Identified 12 P0/P1 production defects
  - Identified 5 security/architecture risks
  - Established repair priorities P1-P5
- **Tests/Lint:** ESLint reported missing package; no test infrastructure existed

### 2026-08-11 — Phased Delivery Plan
- **Commit:** `cda2e55`
- **Machine:** M2
- **Delivered:** `.hermes/plans/2026-08-11_174643-fidelis-sequential-production-platform.md`
  - 5-phase sequential delivery plan for production platform repair
  - Phase 3: workspaces, Phase 4: commercial, Phase 5: security/deployment

---

## Unreleased / Pending
- Deploy commit `4190347` to production (blocked: VPS unreachable)
- Set `OPENROUTER_API_KEY` (blocked: pending from owner)
- Fix super-admin emailVerified (blocked: VPS unreachable)
- Fix AI route authentication (FCG-D-001) (scheduled)
- Authenticated multi-role E2E tests (deferred)
- Arabic/RTL workspace flows (deferred)