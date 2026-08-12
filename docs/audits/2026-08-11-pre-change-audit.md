# Fidelis Consulting Group — Pre-change Technical Audit

Date: 2026-08-11
Repository baseline: `cda2e557f64fdec3d2dab5c3fbb26df9e0a9a909` (`main`)
Working branch: `repair/production-platform-20260811`

## Verification performed

- Pulled/fetched the latest `origin/main` and confirmed a clean local baseline.
- Inspected the application routes, layout/navigation, Prisma schema and seed, authentication, permissions, API routes, middleware, Next.js/TypeScript/ESLint configuration, README, and deployed Nginx configuration.
- Ran `npm ci --ignore-scripts`, `npm run lint`, and `npm run build` locally.
- Crawled the public homepage links against production and started a local production server on port 3005 for comparison.
- Inspected the production server through SSH. Nginx terminates TLS and proxies the public site to `127.0.0.1:3004`; the deployed working tree is `/opt/fidelis-fcg` at the same commit. Production configuration contains the expected secret names, which were not read or logged.

## Baseline result

| Check | Result | Evidence |
| --- | --- | --- |
| Production home | Pass | HTTPS `200`, public Nginx proxy to port 3004 |
| Local production build | Pass with lint defect | `next build` completes; its lint stage reports a missing package |
| Lint | Fail | `eslint-config-next` is imported by `eslint.config.mjs` but is absent from `package.json` / lockfile |
| Automated tests | Not implemented | No test script or tracked test runner/configuration |
| Migrations | Not implemented | Prisma schema and seed exist; no tracked migration history |
| Public link crawl | Fail | 12 visible homepage destinations return production 404 |

## Verified P0/P1 defects

1. `Header.tsx` and `Footer.tsx` advertise routes that do not exist. Production 404s: `/ar`, `/insights`, `/login`, `/professional-development/ai-for-educators`, `/professional-development/english-teaching`, `/resources`, `/resources/blog`, `/resources/case-studies`, `/resources/downloads`, `/services/ai-training`, `/services/professional-development`.
2. Public login is linked as `/login`, but the only current login page is `/app/login`.
3. Header “Get Started” and Footer newsletter controls are presentational, not wired to persistent functionality.
4. `README.md` is an unmodified generic Next.js starter document and does not describe operation, deployment, security configuration, or recovery.
5. The schema covers portions of tenancy, roles, subscriptions, flags, AI usage, and workshops, but lacks tracked migrations and several required persistence concepts/workflows.

## Verified security and architecture risks

1. `src/app/api/ai/[tool]/route.ts` does not require a session, permission, tenant entitlement, quota, rate limit, or tool allow-list. It returns internal provider error text and explicitly enables `Access-Control-Allow-Origin: *`.
2. `src/lib/ai-router.ts` uses hard-coded model mappings; its usage logging is a console TODO rather than durable metering. Its in-process cache risks cross-user/school disclosure for generated content and cannot enforce quota consistently across instances.
3. `src/app/api/auth/register/route.ts` allows a public caller to select `school_admin`, creates an active account before email verification, and logs verification tokens. It lacks the required teacher and school-registration fields/approval lifecycle.
4. `src/middleware.ts` only confirms that a user is logged in for `/app/*`; it does not route or block dashboards by role. Server-side API authorization is not systematically enforced.
5. Role strings and permissions are inconsistent with required canonical roles and are not adequate as an authorization boundary.

## Deployment baseline

- Host: production Nginx with Certbot TLS; reverse-proxy upstream is local Next.js port 3004.
- Source: `/opt/fidelis-fcg`, commit `cda2e557f64fdec3d2dab5c3fbb26df9e0a9a909`.
- No versioned deployment workflow, systemd service definition, backup/runbook, or CI workflow has been identified yet.
- Production database credentials were intentionally not accessed or copied. A backup and migration plan must be verified before any deployment that changes persistence.

## Repair priority

1. P1: fix all public routes/navigation and replace inert conversion controls with real routes/forms.
2. P2/P3: establish canonical roles, centralized server-side guards, tenant scope primitives, safe registration/verification/reset flows, migrations and tests.
3. P4+: implement only durable workflows for dashboards, workshops, subscriptions/entitlements, CRM/consultancy, and AI metering.
4. P5: localization/RTL, legal-policy alignment, SEO, accessibility and end-to-end regression checks.
