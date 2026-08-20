# Fidelis Consulting Group — Deployment State

## Current Production Deployment

| Field | Value |
|-------|-------|
| **Live Host** | `https://www.fidelisconsultingroup.com` |
| **Production Server** | VPS 191.218.165.228 |
| **Deployed Branch** | `main` (assumed — cannot verify remotely) |
| **Deployed Commit** | `4190347` (assumed — unable to verify) |
| **Previous Commit** | `cda2e55` (pre-repair baseline) |
| **Deployment Timestamp** | Unknown (VPS unreachable) |
| **DB Schema** | Migration `20260811160800_baseline` (1 applied) |
| **DB Name** | `fidelis_fcg` |
| **Next.js Port** | 3004 |
| **Nginx** | Active (TLS termination, proxy to :3004) |
| **PM2 Process** | `fidelis-fcg` |
| **PostgreSQL** | Running locally on VPS |
| **Certbot** | Active (LetsEncrypt TLS) |

---

## Verification Status

| Check | Status | Last Verified | Notes |
|-------|--------|---------------|-------|
| Site reachable | UNVERIFIED | — | VPS SSH timeout; cannot curl |
| Health endpoint | UNVERIFIED | — | VPS unreachable |
| Security headers | UNVERIFIED | — | VPS unreachable |
| Smoke tests | UNVERIFIED | — | VPS unreachable |
| Browser verification | UNVERIFIED | — | VPS unreachable |

---

## Rollback Information

| Field | Value |
|-------|-------|
| **Rollback Point Commit** | `cda2e55` |
| **Rollback Procedure** | `docs/runbooks/deployment.md` §7 |
| **Rollback Type** | Application: point PM2 to previous release directory. Data: restore verified pg_dump if migration introduced business change. |
| **Rollback Trigger** | Health check fails, smoke assertions fail, unexpected data error |

---

## Deployment Runbook Reference

The canonical deployment procedure is documented at:
`docs/runbooks/deployment.md`

**Key steps:**
1. Build release artifact from pushed commit (`npm ci && npm run prisma:generate && npm run build`)
2. Backup production (`pg_dump` of fidelis_fcg, SHA-256 verified)
3. Apply migrations (`prisma migrate deploy`)
4. Deploy application (PM2 reload at port 3004)
5. Smoke test (`/api/health`, homepage, robots.txt, login, register)
6. Provision/verify super-admin (emailVerified + credentials delivered via private channel)
7. Observation window
8. Record deployment evidence

---

## Deployment History

| Date | Commit | Branch | Performed By | Status | Evidence |
|------|--------|--------|-------------|--------|----------|
| Prior to 2026-08-11 | `cda2e55` | main | (prior automation) | LIVE | Pre-change audit baseline |
| 2026-08-12 | `4190347` | main | (merged, not deployed) | NOT DEPLOYED | VPS unreachable; cannot confirm |

---

## Known Production Issues

| Issue | Impact | Status |
|-------|--------|--------|
| Commit `4190347` may not be deployed | All P0-P5 repairs not live on production | UNVERIFIED |
| `OPENROUTER_API_KEY` not set | AI features non-functional | OPEN |
| Super-admin `emailVerified` may be null | Admin login blocked | OPEN |
| AI route unauthenticated (FCG-D-001) | Security risk if deployed | OPEN |

---

## Environment Variables (Production)

| Variable | Value | Status |
|----------|-------|--------|
| `DATABASE_URL` | `postgresql://fidelis:***@localhost:5432/fidelis_fcg` | SET |
| `NEXTAUTH_URL` | `https://www.fidelisconsultingroup.com` | SET |
| `NEXTAUTH_SECRET` | Redacted | SET |
| `OPENROUTER_API_KEY` | `PENDING_FROM_OWNER` | NOT SET |
| `NEXT_PUBLIC_API_URL` | `https://www.fidelisconsultingroup.com` | SET |
| `PAYMENT_PROVIDER` | `mock` | SET (production default) |

---

## Notes
- VPS is currently unreachable via SSH — all deployment state marked as UNVERIFIED
- Deployment commit `4190347` should be deployed as the next action once VPS is reachable
- Follow deployment runbook exactly — never deploy uncommitted tree
- Always back up before touching production data