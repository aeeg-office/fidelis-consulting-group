# Fidelis Sequential Production Platform Implementation Plan

> **For Hermes:** Execute one phase at a time. Do not start a later phase until the current phase has passed its complete code-level and browser-level release gate.

**Goal:** Repair the public Fidelis site and progressively deliver a secure, multi-tenant education-consultancy and subscription AI platform with evidence-backed validation after every phase.

**Architecture:** Preserve the existing Next.js 15 App Router application and Prisma/PostgreSQL root schema. Establish automated code verification (unit, integration, static analysis and production build) alongside browser verification against a local production build and, after approval, the deployed domain. Cross-tenant, authorization, billing, and AI quota boundaries are server-enforced and verified independently of UI visibility.

**Tech Stack:** Next.js 15, React 19, TypeScript, Prisma 5/PostgreSQL, NextAuth v5 beta, next-intl, Tailwind v4, OpenAI SDK/OpenRouter-compatible service.

---

## Current verified context

- Active repair branch: `repair/production-platform-20260811`; current commit `af5a505 fix(public): repair broken routes and secure public entry points`.
- Root application scripts currently provide `dev`, `build`, `start`, and `lint`; no root unit/component/E2E framework is installed yet.
- Root Prisma datasource is PostgreSQL and the schema already contains initial School, Department, User, role, subscription, AI-usage, and audit concepts.
- Repository has no tracked root Prisma migration baseline. Treat schema deployment and production data changes as a separately approved, backup-first gate.
- `practice-buddy` is a separate application and must not be silently merged into the root platform. Its boundary is a deliberate later decision.
- The current worktree was clean when this plan was created.

## Universal release protocol for every phase

1. **Test design first (RED):** Add or update a small vertical test slice that expresses each new behavior before application code changes. Run it and record the expected failure.
2. **Minimum implementation (GREEN):** Implement only enough code to satisfy the tested behavior. Re-run the focused test, then the phase suite.
3. **Static and server checks:** Run TypeScript validation, ESLint, Prisma validation/generation when schema is involved, route/API integration tests, and a production `next build`.
4. **Browser checks:** Run the local production build (`next build` + `next start`) and inspect rendered routes, accessibility tree, browser console, navigation, forms, error states, keyboard behavior, and response behavior. Exercise narrow/mobile viewport in a true browser viewport, not by source inspection alone.
5. **Security/data checks:** For any auth, tenant, billing, admin, or AI functionality, call endpoints as unauthenticated, authorized, wrong-role, and wrong-tenant actors. Verify server responses and persisted data, not merely hidden UI controls.
6. **Regression and evidence:** Record commands, results, tested URLs, console errors, test counts, browser workflow outcomes, database checks, and known limitations in a phase QA report.
7. **Gate decision:** Only mark the phase passed if all required tests pass and no Critical/High issue remains. Otherwise repair through additional RED→GREEN cycles and re-run the full phase gate. Present a concise finding report before any scope-expanding work.
8. **Commit boundary:** Commit only the tested phase, including tests and QA/runbook documentation. Do not deploy without explicit approval and a deploy-specific verification checklist.

## Test tooling foundation (created in Phase 0)

Introduce only tools needed for durable verification:

- **Unit/component:** Vitest plus React Testing Library and jsdom.
- **Route/integration:** Vitest invoking route handlers/services with isolated test fixtures; use a disposable PostgreSQL database or transaction-cleaned dedicated test schema when Prisma persistence is required.
- **Browser E2E:** Playwright with Chromium; store test artifacts (screenshots, video/trace on failure) outside committed application content or explicitly ignored under `test-results/`.
- **Accessibility:** axe-core via Playwright for automated route scans, supplemented by real keyboard/focus checks.
- **Security assertions:** scripted API requests/test helpers proving 401/403/404 boundaries and no cross-tenant data leaks.
- **CI:** a reproducible sequence that installs dependencies, generates Prisma client, runs unit/integration/browser tests, lint, type-check, and production build. Browser tests run against a production-mode local server.

No existing test framework is claimed as present. Installation and configuration are a Phase 0 deliverable.

---

## Phase 0 — Quality Harness and Release Baseline

**Objective:** Establish the repeatable test harness and baseline evidence required to make all subsequent gates meaningful.

**Estimated implementation:** 6–10 hours.

**Likely files:**
- Modify: `package.json`, lockfile, `.gitignore`, CI workflow files if absent.
- Create: `vitest.config.*`, `playwright.config.*`, `tests/unit/**`, `tests/integration/**`, `tests/e2e/**`, `tests/helpers/**`, `docs/qa/phase-0-baseline.md`.
- Inspect/possibly modify: `tsconfig.json`, `eslint.config.*`, `next.config.*`, Prisma client helper.

**Test-first tasks:**
1. Add one failing unit test proving the selected runner discovers TypeScript tests, then configure the runner until it passes.
2. Add a failing route smoke test for a known current public route, then create reusable route-test setup.
3. Add a failing Playwright homepage smoke test requiring a visible landmark, one H1, no console errors, and successful navigation to a known route; make the harness start the production server and pass.
4. Add a failing axe smoke test for the homepage and establish an explicitly reviewed baseline for any legitimate third-party exclusions.
5. Add CI commands that fail if any harness stage fails.

**Code-level gate:**
- `npm run lint`
- `npx tsc --noEmit`
- `npx prisma validate` and `npx prisma generate`
- unit/component and route smoke suites
- Playwright smoke suite on `next build` + `next start`
- `npm run build`

**Browser gate:**
- Homepage, primary navigation, footer, `/robots.txt`, and `/sitemap.xml` directly inspected.
- Browser console checked before and after navigation; no uncaught errors or failed first-party requests.
- Desktop and narrow viewport captured; keyboard Tab/Shift+Tab focus is visible and logical.

**Pass criteria:** Tests are deterministic on a clean checkout; local production browser smoke test works; failure artifacts are collected; baseline limitations are documented.

---

## Phase 1 — Public Site Completion, SEO, Legal, and English/Arabic Public Experience

**Objective:** Complete the public marketing and lead-generation experience so every advertised route/control works, is localized appropriately, and is technically discoverable.

**Estimated implementation:** 16–28 hours.

**Scope:**
- Repair or remove every broken public navigation/footer/CTA destination.
- Ensure contact/newsletter/lead forms have validated server handling, durable persistence or an explicitly configured delivery mechanism, success/error states, abuse controls, and privacy consent where applicable.
- Complete metadata: `metadataBase`, per-route titles/descriptions, canonical URLs, Open Graph/Twitter cards, `robots.ts`, `sitemap.ts`, structured Organization/ProfessionalService/WebSite data, and language alternate links.
- Complete public legal pages: privacy, terms, cookie/AI disclosure as applicable, contact identity, and consent links.
- Implement public Arabic routes and correct document `lang`/`dir`, typography/layout direction, labels, page metadata, and locale switch/reversion behavior. English remains the default.
- Make public pages accessible: one meaningful H1, landmarks, semantic controls, form labels/descriptions/errors, image alt text, focus, skip link, contrast, and reduced motion.

**Likely files:**
- Modify: `src/app/layout.tsx`, public page components under `src/app/**`, `src/components/layout/**`, `src/messages/en/**`, `src/messages/ar/**`, form/API route modules, metadata helpers.
- Create/modify: `src/app/robots.ts`, `src/app/sitemap.ts`, locale route/layout components, legal page components, JSON-LD helper, public form validation/service modules.
- Create: focused unit, route, component, and E2E tests; `docs/qa/phase-1-public-site.md`.

**Test-first tasks:**
1. For each previously broken link/CTA, add a route/link test that fails on missing or wrong target; implement route or correct destination.
2. Add tests that invalid contact/newsletter submissions return structured validation errors, valid submissions persist/deliver exactly once, and no public request can forge privileged fields.
3. Add metadata tests per representative page: unique title/description, canonical production host, OG/Twitter fields, one H1, and no unintended `noindex`.
4. Add tests for `/robots.txt` and sitemap URL content, excluding private/auth/dashboard routes and using the Fidelis production domain.
5. Add locale tests for `/ar`, Arabic language switch, reverse switch, `<html lang="ar" dir="rtl">`, translated controls, RTL-safe logical CSS, and Arabic `hreflang`/canonical relations.
6. Add accessibility tests for navigation, forms, error announcement, and keyboard focus; fix every introduced violation.

**Code-level gate:**
- Phase 0 suite plus public route inventory test.
- All public form validation/API tests, locale tests, metadata tests, and axe scans pass.
- A static internal-link crawl finds no linked 404 route or empty/inert primary CTA.
- Type-check, lint, and production build pass.

**Browser gate:**
- Visit every unique public internal link discovered from header, main content, and footer on desktop and narrow viewport.
- Fill only non-sensitive test data into each public form; verify client and server validation, success, reload behavior, duplicate submission behavior, and data destination through test-only fixtures/logs.
- Navigate EN → AR → EN; verify destination, text direction, browser title, console, and controls in both locales.
- Inspect source-rendered metadata and JSON-LD in browser; directly visit `robots.txt` and `sitemap.xml`.
- Keyboard-test menu, locale switch, forms, modal/dialogs, and skip link. Run browser axe scans on every public route.

**Pass criteria:** No broken advertised public route/control; public forms are real and protected; English and Arabic public journeys pass; no Critical/High public SEO or accessibility defect remains.

---

## Phase 2 — Database Migration Baseline, Authentication, RBAC, and Tenant Isolation

**Objective:** Make identity, authorization, and tenant boundaries safe, persisted, auditable, and deployable before opening privileged workspaces.

**Estimated implementation:** 28–44 hours, excluding production change-window approval.

**Prerequisite approval:** Production database backup, schema introspection, current data inventory, migration strategy, rollback plan, and maintenance-window decision must be reviewed before any production migration.

**Scope:**
- Reconcile schema versus deployed PostgreSQL state; create a versioned migration baseline and an idempotent deployment/runbook procedure.
- Define typed role/capability policy for platform admin, school admin, HOD, teacher, and ordinary/pending users. Public registration always creates a least-privileged pending role/state.
- Implement a single secure login/session contract, password hashing, server-side registration validation, rate limiting, audit events, safe redirects, account status checks, and secret-safe errors.
- Apply tenant scoping in all root data services/routes: scope by authenticated school and, where applicable, department; never accept a client-provided tenant ID as authorization.
- Add audit logs for credential, role, tenant, approval, entitlement, and privileged operational events.

**Likely files:**
- Modify: `prisma/schema.prisma`, auth/session configuration, user/role service modules, API routes, middleware/proxy, database helper, environment documentation.
- Create: `prisma/migrations/**`, policy helpers, tenant repository/service boundaries, seed/test fixtures, auth/RBAC/integration tests, `docs/runbooks/database-migrations.md`, `docs/qa/phase-2-security-data.md`.

**Test-first tasks:**
1. Add a migration validation test/CI preflight against an empty disposable PostgreSQL database; then create and apply the baseline migration.
2. Add failing policy unit tests for each role/capability and pending-state denial; implement pure typed policy helpers.
3. Add route tests proving anonymous requests are 401, unauthorized roles are 403, and authorized roles receive only their permitted response shape.
4. Add two-school/two-department integration fixtures; test every tenant-aware service/API for cross-school and cross-department denial, including guessed IDs and altered request payloads.
5. Add registration tests proving arbitrary `role`, `schoolId`, approval, and entitlement fields are ignored/rejected; implement least-privilege server behavior.
6. Add session/password/redirect/rate-limit tests, including bad credentials, suspended/pending accounts, expired session, callback URL validation, and audit log creation.

**Code-level gate:**
- Prisma format/validate/generate and migration apply/redeploy succeed against a disposable database.
- Authentication, role, registration, tenant-isolation, audit-log, and negative-security test suites pass.
- Dependency/security review has no unaddressed Critical/High finding.
- Type-check, lint, full unit/integration suite, and production build pass.

**Browser gate:**
- Test anonymous, pending registrant, teacher, HOD, school administrator, and platform administrator using isolated seeded accounts.
- For each protected URL/API path, test direct entry, login return flow, allowed access, denied access, logout, expired-session behavior, and no privileged controls appearing for unauthorized users.
- Use browser devtools/network-equivalent request evidence or controlled endpoint checks to prove denied roles cannot retrieve protected data merely by manually entering URLs.
- Verify two tenant accounts cannot discover each other’s school/department/user records through UI, search, URL changes, or API requests.

**Pass criteria:** Migration is reproducible and rollback documented; registration cannot mint privilege; every protected route/service proves server-side role and tenant enforcement; no cross-tenant data exposure.

---

## Phase 3 — Back Office and School, HOD, and Teacher Workspaces

**Objective:** Deliver real, role-specific operational workspaces backed by Phase 2 authorization and persistent tenant-scoped data.

**Estimated implementation:** 36–60 hours.

**Scope:**
- Platform-admin back office for school approval, user/role management, tenant status, audits, product/catalogue visibility, and support-safe administration.
- School administrator workspace for school profile, departments, invitations/teacher lifecycle, and authorized reports.
- HOD workspace for department membership, subject/grade context, teacher oversight, and approved departmental workflows.
- Teacher workspace for own profile, assigned resources/workflows, and relevant school/department data only.
- Registration/approval journey with clear pending/approved/rejected states, notification hooks (not necessarily a full outbound email platform unless configured), and auditable transitions.

**Likely files:**
- Create/modify: protected App Router layouts/pages under `src/app/(platform|school|hod|teacher)/**`, role navigation components, form schemas, tenant-scoped repositories/services, server actions/API routes, dashboard component tests, browser fixtures, `docs/qa/phase-3-workspaces.md`.

**Test-first tasks:**
1. Add failing route/navigation tests for correct role landing destinations and role-specific navigation; implement central destination policy.
2. Add failing admin tests for school approval and role assignment that verify audit event and no escalation by non-platform admins.
3. Add failing school-admin tests for department/user management scoped to the current school; implement only approved capabilities.
4. Add failing HOD and teacher tests for data visibility/edit restrictions, ownership checks, and error/empty/loading states.
5. Add browser E2E flows for registration → pending → platform approval → login → correct workspace, plus rejection/suspension paths.

**Code-level gate:**
- Every UI capability is paired with a server authorization and tenant-scope test.
- Component tests cover loading, empty, success, validation error, permission-denied, and stale/refresh states for each workspace.
- Route and service tests cover privilege escalation, altered IDs, and direct URL access.
- Full suites, static checks, migration checks (if any), and production build pass.

**Browser gate:**
- E2E role matrix covers each workspace on desktop and narrow viewport.
- Create/update/approve/invite workflows persist after refresh and a new session.
- Try direct protected URLs and modified resource IDs under wrong roles/tenants; verify denial and no sensitive data flash.
- Check console/network errors, keyboard navigation, focus/error behavior, responsive sidebar/menu, and print no false success indication.

**Pass criteria:** Every dashboard action persists correctly, refreshes correctly, and is provably inaccessible to inappropriate roles/tenants; all lifecycle states have usable UI and server enforcement.

---

## Phase 4 — Professional Development, Workshops, Consultancy CRM, and Subscription Entitlements

**Objective:** Implement revenue and service operations with correct lifecycle, tenant ownership, entitlement enforcement, and auditability.

**Estimated implementation:** 42–70 hours. Payment-provider integration time varies materially with the selected provider and webhook credentials.

**Scope:**
- PD/workshop catalogue, scheduling, registration, capacity/waitlist rules if required, attendance/completion evidence, and school/individual eligibility.
- Consultancy lead/engagement CRM: qualified lead, contact, school association, pipeline status, notes/tasks, and consent/privacy controls.
- Product/subscription catalogue, plans, trial/cancel/renewal/expiry states, entitlement resolution, and admin override audit trail.
- Payment provider adapter only after provider selection; webhook signature verification, idempotency, reconciliation, retry/error procedures, and no client-side payment-trust decisions.

**Likely files:**
- Modify/create: Prisma models/migrations as approved, catalogue/service/entitlement modules, protected routes/pages, CRM services, webhook API route, payment adapter, test fixtures, `docs/runbooks/billing-webhooks.md`, `docs/qa/phase-4-commercial.md`.

**Test-first tasks:**
1. Add failing entitlement-resolution unit tests for active, trial, expired, canceled, suspended, override, and tenant boundary cases; implement a single server-side resolver.
2. Add workshop route/service tests for schedule validation, capacity and waitlist behavior, duplicate registration, eligibility, and tenant access.
3. Add CRM tests for lead/contact school linkage, access policy, data validation, consent, and audit history.
4. If a payment provider is selected, add webhook signature, idempotency, event-ordering, retry, and unknown-event tests before adapter implementation.
5. Add browser E2E for authorized purchase/activation simulation using provider test mode, resulting entitlement, workspace access, cancellation/expiry, and denied feature access after expiry.

**Code-level gate:**
- Migration applies to disposable DB and reversibility/rollback impact is documented.
- Entitlement logic is tested independently from the UI and cannot be overridden from client payloads.
- Webhook tests cover signature failures, replay/idempotency, and state transitions; secrets never appear in logs/test snapshots.
- Full suite, security negative tests, type-check, lint, and production build pass.

**Browser gate:**
- Staff can create/manage catalogue, workshop, and CRM records only within their permissions.
- School/teacher users can see and take allowed actions only for their tenant and entitlement state.
- Simulate payment success, cancellation, expiry, failed webhook, duplicate webhook, and retry in test mode; verify audited final state.
- Verify refresh/new-session persistence, error copy, keyboard journey, mobile behavior, and console-clean flow.

**Pass criteria:** Commercial/PD/CRM state is durable, tenant scoped, audited, server-authorized, and resilient to duplicate/out-of-order billing events; no entitlement bypass.

---

## Phase 5 — OpenRouter AI Workflows, Metering, Quotas, and Safe Operations

**Objective:** Add useful AI features without exposing provider credentials, allowing unbounded spend, mixing tenant data, or presenting unverified output as authoritative.

**Estimated implementation:** 30–52 hours, excluding model/provider selection and any external evaluation corpus creation.

**Scope:**
- Define narrowly scoped AI workflows (for example, teaching-resource drafting or consultancy assistance) with explicit user inputs, output expectations, and non-authoritative-use notices.
- Create a server-only OpenRouter-compatible provider adapter; no API key in client bundles, browser logs, or error messages.
- Implement model allowlist/version configuration, timeouts, retry rules, content/input limits, per-user/per-school quotas, token/cost metering, entitlement linkage, kill switch, and audit/usage records.
- Add safe prompt/data handling, data-minimization rules, tenant-scoped retrieval if any exists, refusal/error UX, and operator dashboards for usage/limits.

**Likely files:**
- Create/modify: AI server service/adapter, config validation, usage/quota services, API routes/server actions, Prisma migration if needed, secure logging/redaction helper, AI UI components, tests, `docs/runbooks/ai-operations.md`, `docs/qa/phase-5-ai.md`.

**Test-first tasks:**
1. Add failing unit tests proving server-only configuration rejects missing/invalid provider settings and never serializes secrets to client response/log objects.
2. Add failing quota tests for user/school/plan limits, concurrent requests, exact threshold behavior, exhausted quota, and entitlement loss.
3. Add failing adapter tests with a fake provider for allowed model selection, input size validation, timeout, retry, error mapping, and usage record accuracy.
4. Add tenant tests proving usage records, prompts, generated artifacts, and any retrieval context cannot cross school/department boundaries.
5. Add browser E2E for authorized generation, loading/cancel/error states, quota exhaustion, user disclosure, refresh persistence, and unauthorized direct endpoint access.

**Code-level gate:**
- Mock-provider tests never call external paid AI services in CI.
- Credential scanning confirms no key in committed files, build output, logs, or browser bundles.
- Rate/limit, authorization, tenant, metering, cost-estimation, and error-path tests pass.
- Full test suite, static checks, security review, and production build pass.

**Browser gate:**
- Confirm unauthenticated request is 401, wrong-role/tenant is denied, entitled user succeeds, and exhausted user is blocked before provider dispatch.
- Inspect browser network payloads and console to confirm no provider secret or hidden tenant data is exposed.
- Verify accessible labels, status announcements, retry behavior, Arabic rendering if feature is localized, narrow viewport, and no deceptive claim that AI output is verified expert advice.

**Pass criteria:** AI use is server-only, entitlement-gated, tenant-isolated, accurately metered, rate/size bounded, auditable, failure-safe, and browser-validated without credential exposure.

---

## Phase 6 — Cross-Cutting Arabic RTL, Accessibility, Security Hardening, Performance, and Production Readiness

**Objective:** Complete full-platform quality, resilience, observability, deployability, and independent final acceptance testing.

**Estimated implementation:** 32–54 hours, plus deployment window and post-deploy observation.

**Scope:**
- Extend Arabic/RTL from public pages to every authenticated flow, validation message, email/notification template, metadata, date/number presentation, navigation, tables, and charts.
- Complete WCAG-oriented accessibility remediation across public and protected experiences: semantic structure, contrast, keyboard/focus traps, dialogs, async/error announcements, touch targets, reduced motion, and accessible data tables/charts.
- Security hardening: headers/CSP appropriate to deployed assets, CSRF/session/cookie behavior, input validation, rate limits, anti-automation rules, authorization regression matrix, secure logs, dependency review, and abuse/error handling.
- Performance: route-level budgets, image/font optimization, loading/error boundaries, cache policy, production response checks, and Core Web Vitals-oriented browser measurements.
- Deployment readiness: environment-variable inventory without secret values, database backup/restore drill, migration deploy/rollback protocol, health checks, Nginx/hosting configuration review, CI artifact/check list, monitoring/alerting ownership, incident and release runbooks.

**Likely files:**
- Modify: all user-facing locale components/messages as necessary, global styles, security headers/middleware, Next configuration, operational documentation.
- Create: accessibility test helpers/specs, security regression tests, Playwright full regression projects/fixtures, deployment/rollback/incident runbooks, `docs/qa/phase-6-final-acceptance.md`.

**Test-first tasks:**
1. Add locale/component tests for all protected role routes: Arabic strings, RTL root/document behavior, logical CSS, no English-only validation errors, locale-preserving navigation.
2. Add axe scans and targeted keyboard/focus E2E tests to every representative public and protected route; fix violations before expanding exceptions.
3. Add security regression tests for headers, auth/session/CSRF behavior, validation, rate limits, role/tenant boundaries, security-sensitive error redaction, and dependency policy.
4. Add performance tests/budgets for critical public/auth/workspace routes and test degradation behavior on loading/error conditions.
5. Run a final full user-journey E2E matrix: visitor/Arabic visitor/registrant/pending user/teacher/HOD/school admin/platform admin/subscribed AI user/expired subscriber.
6. Perform backup restore and migration rehearsal only in a non-production environment; document exact observed results and rollback trigger criteria.

**Code-level gate:**
- Full unit/component/integration/security/AI/entitlement suite passes.
- Full browser E2E suite and automated axe scans pass across all supported locales and roles.
- Type-check, lint, Prisma validate/migration rehearsal, dependency security scan, secrets scan, and production build pass.
- No Critical/High issue remains in final defect register; any accepted Medium/Low issue has an owner, rationale, target release, and workaround if user-facing.

**Browser gate:**
- Full desktop and narrow/mobile viewport walkthrough of every supported role and locale with documented route matrix.
- Browser console and failed first-party network requests reviewed per workflow.
- Keyboard-only path covers login, registration, dashboard navigation, CRUD forms, PD registration, CRM, billing simulation, AI workflow, logout, and locale switching.
- Verify production-like headers, canonical/robots/sitemap, error pages, invalid URL behavior, offline/slow-loading handling where practical, and public share previews.

**Pass criteria:** The platform passes final acceptance with evidence from code, API/data, security, and real browser workflows; deployment, rollback, monitoring, and owner runbooks are executable without exposing secrets.

---

## Final deployment sequence (after Phase 6 passes and explicit deployment approval)

1. Freeze the tested commit and capture `git status`, commit SHA, dependency lockfile, migration list, and QA-report links.
2. Verify encrypted/approved database backup and a restore rehearsal record. Do not print credentials or copy secret values into source control.
3. Run staging/pre-production deployment using the exact production build artifact/configuration shape.
4. Apply approved Prisma migration procedure only after backup and preflight checks pass; validate schema version and critical record counts without exposing personal data.
5. Deploy application behind the configured web server, run health checks, and execute a short production smoke suite: public home, EN/AR, robots/sitemap, login, authorization denial, a permitted dashboard read, entitlement check, and AI endpoint denial/success with safe test accounts.
6. Monitor logs/errors/uptime for the agreed observation window. Roll back application and/or migration only according to the tested rollback plan.
7. Publish an evidence-only release report: deployed SHA, migrations, exact commands/results, tested URLs/workflows, known limitations, monitoring status, and rollback readiness.

## Time estimate summary

| Phase | Scope | Estimate |
|---|---|---:|
| 0 | Quality harness and baseline | 6–10 h |
| 1 | Public site, SEO/legal, public EN/AR | 16–28 h |
| 2 | Migration baseline, auth/RBAC/tenant isolation | 28–44 h |
| 3 | Platform/school/HOD/teacher workspaces | 36–60 h |
| 4 | PD/workshops, CRM, subscriptions/entitlements | 42–70 h |
| 5 | OpenRouter AI, quota/metering/safe operations | 30–52 h |
| 6 | Full RTL/a11y/security/performance/deploy readiness | 32–54 h |
| Deployment | Approved staging/production release and observation | 6–14 h |
| **Total** | **Sequential implementation and verification** | **196–332 h** |

**Calendar interpretation:** One focused engineer at 25–30 productive hours/week: approximately 7–13 weeks. Parallel work can reduce calendar time only after Phase 2 establishes stable interfaces; it must not bypass the phase gates. Payment provider selection, external email configuration, production database drift, and scope additions can extend the estimate.

## Explicit deferrals and decisions needed before affected phases

- Confirm the supported user roles, their exact capabilities, and any country-specific legal/cookie/privacy requirements before Phase 2/3.
- Select the billing provider, tax/invoice responsibility, and subscription catalogue before Phase 4.
- Select approved OpenRouter models, monthly spend ceiling, requested AI workflows, data-retention posture, and human-review language before Phase 5.
- Decide whether `practice-buddy` stays an independent product, gains SSO/API integration, or is migrated later; no assumption is made here.
- Approve production database preflight and migration window before any live schema change.

## Completion definition

The initiative is complete only when every phase has a signed-off QA report, each gate has passed from code and browser perspectives, the production deployment is verified against the frozen tested commit, and remaining limitations are explicitly recorded rather than hidden.
