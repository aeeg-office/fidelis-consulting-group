# Phase 3 QA Report — Back Office and School, HOD, Teacher Workspaces

Branch: `repair/production-platform-20260811`
Date: 2026-08-12
Scope: Role-specific operational workspaces backed by server authorization and
tenant-scoped data, per the phased delivery plan.

## What was delivered

Authorization / tenant policy spine (pure, DB-free, unit-tested):
- `src/lib/workspace-policy.ts` — central role + tenant-scoping rules:
  - `workspaceLandingPath`: login-landing per role (admin → /app/dashboard/admin,
    school_admin → /app/school, hod → /app/hod, teacher → /app/dashboard/teacher).
  - `canApproveSchools` / `canManagePlatformUsers`: platform-admin only.
  - `canManageSchool` / `canProvisionTeacher` / `canCreateDepartment`: platform admin
    OR a school_admin whose `schoolId` equals the target school (the tenant boundary).
  - `canViewDepartment`: platform admin, school_admin of that school, or that exact HOD.
- `src/lib/principal.ts` — resolves the authenticated principal's `schoolId` /
  `departmentId` from the persisted User row (never from client input).
- `src/lib/audit.ts` — tenant-tagged audit writer used for privileged transitions.

Tenant-scoped API routes (all deny 401 unauthenticated / 403 wrong role or wrong tenant):
- `GET /api/admin/schools`, `POST /api/admin/schools` (create tenant + provision
  school_admin), `POST /api/admin/schools/[id]/approval` (approve/reject, audited).
- `GET /api/school/overview`, `GET|POST /api/school/departments`,
  `POST /api/school/teachers` (provision school-linked teacher, audited).
- `GET /api/hod/department` (HOD's own department + teacher oversight).

Workspace UI:
- `src/app/app/school/*` — school-admin workspace (overview, departments, teacher
  provisioning), guarded by a server layout (`requireAnyRole(["school_admin","admin"])`).
- `src/app/app/hod/*` — HOD workspace (department + teachers), guarded similarly.
- `src/app/app/dashboard/admin/schools/*` — platform-admin school approval queue,
  under the existing admin layout guard.
- `src/app/app/layout.tsx` — sidebar is now role-aware and points only at real
  routes (removed dead links to /app/ai-tools, /app/courses, /app/library, /app/users).

## Code-level gate results

- Prisma validate/generate: PASS
- TypeScript typecheck (`tsc --noEmit`): PASS
- ESLint: 0 errors, 39 warnings (pre-existing only; 2 warnings removed by deleting
  unused imports)
- Vitest unit: 22/22 PASS, including new `workspace-policy` suite (13 tests) covering
  role landing, platform-admin-only capabilities, the cross-school tenant boundary,
  department visibility, and role helpers.
- `next build` (production): PASS
- `git diff --check`: clean

## Browser / E2E gate results

Playwright against a production-mode server (`next build` + `next start`):
- 10/10 PASS, including the expanded `auth-rbac` suite which now verifies that
  unauthenticated visitors are redirected to `/app/login` from every protected
  workspace: `/app/dashboard/admin`, `/app/dashboard/teacher`, `/app/school`,
  `/app/hod`, `/app/dashboard/admin/schools`.

## Tenant / authorization evidence

Cross-tenant and wrong-role denial is enforced at the policy layer and re-checked in
every route against the DB-derived principal:
- A `school_admin` may manage only `principal.schoolId`; any other school ID returns 403.
- An HOD may view only `principal.departmentId`; another department returns 403.
- Department and teacher-provisioning payloads never carry a tenant ID — the tenant is
  always the principal's own school.
- Teacher provisioning refuses a `departmentId` that does not belong to the caller's school.
- School approval/create is platform-admin only and every transition writes an audit row.

## Known limitations / carried items

- Authenticated, role-specific browser E2E (signing in as an actual admin / school_admin /
  HOD and exercising forms) requires seeded accounts against a disposable DB; it is
  deferred to the Phase 6 full user-journey matrix with the integration harness.
- No live schema change was required in Phase 3 (all models already existed); no
  migration was produced.
- Production is untouched; this phase is committed to the repair branch only.
