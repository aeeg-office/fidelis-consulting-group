# Fidelis Deployment & Super-Admin Runbook

Branch: `repair/production-platform-20260811`
Scope: Safe, reversible release of a tested commit to the production VPS, and
provisioning / verifying the platform super-admin account.

> Principles: never deploy an uncommitted tree; always back up before touching
> production data; migrate only after preflight; keep credentials out of the
> repo, logs, and commits; provide secrets to the owner directly.

## 0. Preconditions

- Working tree clean; target commit tagged/locked.
- A fresh, protected database backup exists and its SHA-256 was verified.
- `prisma migrate status` reports up to date on the disposable rehearsal DB.

## 1. Build the release artifact from the pushed commit

```bash
git fetch origin repair/production-platform-20260811
git checkout --detach origin/repair/production-platform-20260811
git status --porcelain   # must be empty
npm ci
npm run prisma:generate
npm run build            # must pass
```

## 2. Backup production

Take a pg_dump of `fidelis_fcg` to a protected path, chmod 0600, record SHA-256.
Do not print credentials.

## 3. Apply migrations (only if the commit adds any)

If `prisma/migrations` gained new migrations, rehearse on a disposable DB, then:
```bash
prisma migrate deploy --schema prisma/schema.prisma   # production DB
prisma migrate status
```
If the baseline-only case (no new business migrations), verify `migrate status`
reports up to date and skip mutation.

## 4. Deploy the application

- Place the built app at the release directory (e.g. `/opt/releases/fidelis-<sha>`).
- Point PM2 (`fidelis-fcg`) at the new path, port 3004.
- Set env: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_TRUST_HOST=true`,
  `PAYMENT_PROVIDER=mock` (until a provider is selected), `NEXTAUTH_URL`/origin.
- `pm2 reload fidelis-fcg` and confirm it stays up.

## 5. Smoke test

```bash
curl -fsS https://<host>/api/health            # expect status ok, db ok
curl -fsSI https://<host>/                    # expect security headers
curl -fsS https://<host>/robots.txt
# Login, register (independent teacher), admin backend reachable
```

## 6. Provision / verify the super-admin account

Platform super-admin role is `admin`, sign-in at `/app/login`.

To create or reset the admin (server-side, never in a commit):
1. Ensure `user.emailVerified` is set (login is blocked when null).
2. Set a strong `SEED_ADMIN_PASSWORD` and run the seed upsert, OR update the
   existing `admin@fidelisconsultingroup.com` record with `bcrypt` hash + verified.
3. Confirm the `UserRole` row links the admin user to the `admin` role.
4. Verify sign-in and that `/app/dashboard/admin`, `/app/dashboard/admin/schools`,
   and `/app/dashboard/admin/crm` render.

**Delivery of credentials:** send the email + password to the site owner through a
private channel, exactly once; advise the owner to rotate the password after first
login. Do not store the plaintext password in memory, files, or the repo.

## 7. Rollback

- Application: point PM2 back at the previous release directory and reload.
- Data: restore the verified backup only if the migration introduced a business
  change; otherwise record-rollback is not needed.
- Trigger criteria: health check fails after reload, smoke test assertions fail,
  or an unexpected data error is observed during the observation window.

## Observation

Monitor `/api/health`, PM2 logs, and error tracking for the agreed window after
release before publishing the evidence-only release report.
