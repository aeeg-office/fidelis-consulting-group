# Phase 4 QA Report — PD/Workshops, Subscription Entitlements, and Consultancy CRM

Branch: `repair/production-platform-20260811`
Date: 2026-08-12
Decision: Because the billing provider is not yet selected (plan deferral), this
phase implements the full non-payment commercial core behind a config-driven
payment **stub**, so the entitlement lifecycle is testable end-to-end without a
live provider. A real provider adapter can be added later without touching the
entitlement logic.

## What was delivered

Entitlements (single server-side resolver):
- `src/lib/entitlements.ts` — pure `resolveEntitlement` handling active / trial /
  expired / past_due / canceled (incl. cancel-at-period-end grace) / unpaid /
  audited admin-override. UI visibility is never the gate.

Payment adapter (pluggable, provider-agnostic):
- `src/lib/payments.ts` — `PaymentProvider` interface + deterministic `MockProvider`
  with `createCheckout`, `parseEvent`, and `applyEvent` mapping billing events to
  persisted subscription patches. Chosen via `PAYMENT_PROVIDER` (default "mock").
- `src/lib/subscription-service.ts` — finds the user's (or school's) subscription,
  converts it to an entitlement input, and applies provider events to subscription
  state with audit logging.
- `POST /api/billing/webhook` — accepts only mock-mode events; auto-creates a
  subscription on `checkout.completed` (dev/test convenience); every transition audited.
- `GET /api/billing/status` — resolves and returns the current user's entitlement + plan.

Workshops:
- `src/lib/workshop-enrollment.ts` — pure capacity / duplicate / published rules.
- `POST /api/workshops/[id]/enroll` — transactional enroll with capacity + duplicate
  checks (409 on full / duplicate, 403 on unpublished), audited.

Consultancy CRM (built on the existing `ContactInquiry` record — no schema change):
- `src/lib/crm.ts` — pure lead-create / lead-update validation with a fixed pipeline
  (new → qualified → contacted → proposal → won / lost).
- `GET|POST /api/crm/leads`, `PATCH /api/crm/leads/[id]` — platform-admin only, audited.

UI:
- `/app/billing` — shows resolved plan + entitlement and mock provider controls to
  exercise activate / payment-failure / cancel and verify the lifecycle live.
- `/app/dashboard/admin/crm` — platform-admin lead list, create, and pipeline updates.
- Sidebar updated with Billing (all) and Consultancy CRM (admin) links.

## Code-level gate results

- Prisma validate/generate: PASS
- TypeScript typecheck: PASS
- ESLint: 0 errors, 41 warnings (pre-existing style only)
- Vitest unit: 49/49 PASS. New suites: entitlements (7), payments (8), workshop
  enrollment (5), CRM (7). Existing workspace-policy (13), public-registration (5),
  role-access (2), quality-harness (2).
- `next build`: PASS (62 static routes)
- `git diff --check`: clean

## Browser / E2E gate results

- Playwright production-mode: 10/10 PASS (public smoke, discovery/SEO/a11y, and the
  expanded auth-rbac suite covering all 5 protected workspace routes).

## Security / data evidence

- Entitlement resolution is pure and unit-tested; it can never be overridden from a
  client payload (only an audited admin override flag grants access when expired).
- Workshop enrollment runs inside a transaction: a full cohort cannot be overbooked
  and a duplicate enrollment is rejected even when two requests race.
- CRM status changes are validated against a fixed pipeline; arbitrary statuses are
  rejected. All lead/subscription/workshop transitions write AuditLog rows.
- Billing webhook is mock-only until a provider is selected; a production adapter must
  add server-side signature verification.

## Known limitations / carried items

- Live payment provider integration (Stripe or another) is deferred pending provider
  selection; the adapter interface is ready for it.
- Authenticated multi-role browser E2E (signing in as specific roles and exercising
  forms end-to-end) is deferred to the Phase 6 full user-journey matrix against a
  disposable DB with seeded accounts.
- No schema change was required in Phase 4; no migration was produced.
- Production is untouched; this phase is committed to the repair branch only.
