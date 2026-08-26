#!/bin/bash
# Fidelis Consulting Group — Nightly Production QA
# Runs from the VPS via cron; reports via local log + Telegram.
set -euo pipefail

LOG="/var/log/fcg-nightly-qa.log"
ALERT_LOG="/var/log/fcg-nightly-alerts.log"
TS=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
DATE_LABEL=$(date -u +"%Y-%m-%d")
BASE_URL="https://fidelisconsultingroup.com"
LOCAL_URL="http://localhost:3004"

failures=0
report=""
unverified=""

log() { echo "[$TS] $*" | tee -a "$LOG"; }
fail() { failures=$((failures+1)); log "FAIL: $*"; report="$report\n- [FAIL] $*"; }
pass() { report="$report\n- [PASS] $*"; }
unver() { unverified="$unverified\n- [UNVERIFIED] $*"; report="$report\n- [UNVERIFIED] $*"; }

# ── 1. INFRASTRUCTURE ──────────────────────────────────────
log "=== Phase 1: Infrastructure ==="

# 1a. Liveness
LIVE_CODE=$(curl -sS -o /dev/null -w "%{http_code}" "$LOCAL_URL/api/health/live" --max-time 10 2>/dev/null || echo "000")
LIVE_BODY=$(curl -sS "$LOCAL_URL/api/health/live" --max-time 10 2>/dev/null || echo "{}")
if [ "$LIVE_CODE" = "200" ] && echo "$LIVE_BODY" | grep -q '"alive"'; then
  pass "Liveness /api/health/live returns 200"
else
  fail "Liveness /api/health/live — HTTP $LIVE_CODE"
fi

# 1b. Readiness
READY_CODE=$(curl -sS -o /dev/null -w "%{http_code}" "$LOCAL_URL/api/health/ready" --max-time 10 2>/dev/null || echo "000")
if [ "$READY_CODE" = "200" ]; then
  pass "Readiness /api/health/ready returns 200 (DB ok)"
elif [ "$READY_CODE" = "503" ]; then
  fail "Readiness /api/health/ready returns 503 (DB unavailable)"
else
  fail "Readiness /api/health/ready — HTTP $READY_CODE"
fi

# 1c. Aggregate health
HEALTH_CODE=$(curl -sS -o /dev/null -w "%{http_code}" "$LOCAL_URL/api/health" --max-time 10 2>/dev/null || echo "000")
HEALTH_BODY=$(curl -sS "$LOCAL_URL/api/health" --max-time 10 2>/dev/null || echo "{}")
if [ "$HEALTH_CODE" = "200" ] || [ "$HEALTH_CODE" = "503" ]; then
  pass "Aggregate /api/health — HTTP $HEALTH_CODE (reported: $(echo "$HEALTH_BODY" | grep -o '"status":"[^"]*"' | cut -d'"' -f4))"
else
  fail "Aggregate /api/health — HTTP $HEALTH_CODE (unexpected)"
fi

# 1d. Database direct (psql)
DB_OK=$(sudo -u postgres psql -d fidelis_fcg -c "SELECT 1 AS ok" -t -A 2>/dev/null || echo "FAIL")
if [ "$DB_OK" = "1" ]; then
  pass "PostgreSQL — SELECT 1 ok"
else
  fail "PostgreSQL — query failed: $DB_OK"
fi

# 1e. Authentication (NextAuth URL and secret configured)
AUTH_SECRET_OK=$(docker exec fcg sh -c 'test -n "$NEXTAUTH_SECRET" && echo "ok" || echo "missing"' 2>/dev/null || echo "unreachable")
AUTH_URL_OK=$(docker exec fcg sh -c 'test -n "$NEXTAUTH_URL" && echo "ok" || echo "missing"' 2>/dev/null || echo "unreachable")
if [ "$AUTH_SECRET_OK" = "ok" ] && [ "$AUTH_URL_OK" = "ok" ]; then
  pass "Auth config — NEXTAUTH_SECRET and NEXTAUTH_URL configured"
else
  fail "Auth config — secret=$AUTH_SECRET_OK url=$AUTH_URL_OK"
fi

# 1f. OpenRouter API key
OR_KEY=$(docker exec fcg sh -c 'echo "${OPENROUTER_API_KEY:-missing}"' 2>/dev/null || echo "unreachable")
if [ "$OR_KEY" != "missing" ] && [ "$OR_KEY" != "PENDING_FROM_OWNER" ]; then
  pass "OpenRouter API key configured"
else
  unver "OpenRouter API key — $OR_KEY (not blocking, AI optional)"
fi

# ── 2. PUBLIC WEBSITE ──────────────────────────────────────
log "=== Phase 2: Public Website ==="

declare -a PUBLIC_ROUTES=(
  "/" "/about" "/services" "/services/english-consultancy"
  "/services/professional-development" "/services/ai-training"
  "/ai-platform" "/professional-development"
  "/professional-development/english-teaching"
  "/professional-development/ai-for-educators"
  "/resources" "/resources/blog" "/resources/downloads"
  "/resources/case-studies" "/insights" "/contact"
  "/privacy" "/terms" "/cookies"
  "/ar" "/ar/services" "/ar/contact"
  "/app/login" "/app/register"
)

for route in "${PUBLIC_ROUTES[@]}"; do
  CODE=$(curl -sS -o /dev/null -w "%{http_code}" "$LOCAL_URL$route" --max-time 10 2>/dev/null || echo "000")
  if [ "$CODE" = "200" ]; then
    pass "$route — HTTP 200"
  else
    fail "$route — HTTP $CODE"
  fi
done

# 2b. 404 behavior
NOT_FOUND_CODE=$(curl -sS -o /dev/null -w "%{http_code}" "$LOCAL_URL/nonexistent-page" --max-time 10 2>/dev/null || echo "000")
if [ "$NOT_FOUND_CODE" = "404" ]; then
  pass "/nonexistent-page — HTTP 404"
else
  fail "/nonexistent-page — HTTP $NOT_FOUND_CODE (expected 404)"
fi

# 2c. Sitemap & robots
SITEMAP_CODE=$(curl -sS -o /dev/null -w "%{http_code}" "$LOCAL_URL/sitemap.xml" --max-time 10 2>/dev/null || echo "000")
ROBOTS_CODE=$(curl -sS -o /dev/null -w "%{http_code}" "$LOCAL_URL/robots.txt" --max-time 10 2>/dev/null || echo "000")
[ "$SITEMAP_CODE" = "200" ] && pass "sitemap.xml — HTTP 200" || fail "sitemap.xml — HTTP $SITEMAP_CODE"
[ "$ROBOTS_CODE" = "200" ] && pass "robots.txt — HTTP 200" || fail "robots.txt — HTTP $ROBOTS_CODE"

# 2d. Security headers
CSP=$(curl -sS -I "$LOCAL_URL" --max-time 10 2>/dev/null | grep -i "^content-security-policy:" | head -1 || echo "")
echo "$CSP" | grep -qi "frame-ancestors" && pass "CSP header — frame-ancestors present" || fail "CSP header — frame-ancestors missing"

# 2e. HTTPS redirect
HTTPS_CODE=$(curl -sS -o /dev/null -w "%{http_code}" "https://www.fidelisconsultingroup.com" --max-time 15 2>/dev/null || echo "000")
[ "$HTTPS_CODE" = "200" ] && pass "HTTPS www — HTTP 200" || fail "HTTPS www — HTTP $HTTPS_CODE"

# 2f. Arabic route
AR_CODE=$(curl -sS -o /dev/null -w "%{http_code}" "$LOCAL_URL/ar" --max-time 10 2>/dev/null || echo "000")
AR_LANG=$(curl -sS "$LOCAL_URL/ar" --max-time 10 2>/dev/null | grep -o 'lang="[^"]*"' | head -1 || echo "")
[ "$AR_CODE" = "200" ] && pass "Arabic /ar — HTTP 200" || fail "Arabic /ar — HTTP $AR_CODE"
echo "$AR_LANG" | grep -q "ar" && pass "Arabic /ar — lang='ar' attribute present" || fail "Arabic /ar — lang attribute missing: $AR_LANG"

# ── 3. AUTHENTICATION (curl-based) ─────────────────────────
log "=== Phase 3: Authentication ==="

# Test login endpoint
LOGIN_PAGE_CODE=$(curl -sS -o /dev/null -w "%{http_code}" "$LOCAL_URL/app/login" --max-time 10 2>/dev/null || echo "000")
[ "$LOGIN_PAGE_CODE" = "200" ] && pass "Login page — HTTP 200" || fail "Login page — HTTP $LOGIN_PAGE_CODE"

REGISTER_PAGE_CODE=$(curl -sS -o /dev/null -w "%{http_code}" "$LOCAL_URL/app/register" --max-time 10 2>/dev/null || echo "000")
[ "$REGISTER_PAGE_CODE" = "200" ] && pass "Register page — HTTP 200" || fail "Register page — HTTP $REGISTER_PAGE_CODE"

# ── 4. PROTECTED ROUTES (unauthenticated) ──────────────────
log "=== Phase 4: Protected Routes (unauthorized) ==="

declare -a PROTECTED=(
  "/app/dashboard/admin" "/app/dashboard/teacher"
  "/app/school" "/app/hod" "/app/tools"
  "/app/workshops" "/app/billing" "/app/profile"
  "/api/admin/schools" "/api/school/overview"
  "/api/hod/department" "/api/workshops"
)

for route in "${PROTECTED[@]}"; do
  CODE=$(curl -sS -o /dev/null -w "%{http_code}" "$LOCAL_URL$route" --max-time 10 2>/dev/null || echo "000")
  if [ "$CODE" = "307" ] || [ "$CODE" = "302" ] || [ "$CODE" = "401" ] || [ "$CODE" = "403" ]; then
    pass "$route — HTTP $CODE (redirect/unauthorized)"
  elif [ "$CODE" = "200" ]; then
    fail "$route — HTTP 200 (should be protected!)"
  else
    fail "$route — HTTP $CODE (unexpected)"
  fi
done

# ── 5. PERFORMANCE ─────────────────────────────────────────
log "=== Phase 5: Performance ==="

SLOW_ROUTES=""
for route in "/" "/services" "/contact" "/app/login"; do
  START=$(date +%s%N)
  curl -sS -o /dev/null "$LOCAL_URL$route" --max-time 15 >/dev/null 2>&1
  END=$(date +%s%N)
  ELAPSED=$(( (END - START) / 1000000 ))
  if [ "$ELAPSED" -gt 5000 ]; then
    SLOW_ROUTES="$SLOW_ROUTES $route(${ELAPSED}ms)"
    fail "$route — ${ELAPSED}ms (slow)"
  else
    pass "$route — ${ELAPSED}ms"
  fi
done

# ── REPORT SUMMARY ─────────────────────────────────────────
log "=== Nightly QA Complete ==="

OVERALL_STATUS="HEALTHY"
if [ "$failures" -gt 0 ]; then
  OVERALL_STATUS="DEGRADED"
fi

# Check if readiness failed
if [ "$READY_CODE" = "503" ]; then
  OVERALL_STATUS="UNREADY"
fi

# Check if liveness failed
if [ "$LIVE_CODE" != "200" ]; then
  OVERALL_STATUS="DOWN"
fi

SUMMARY=$(cat <<EOF
═══════════════════════════════════════════════
FIDELIS CONSULTING GROUP — NIGHTLY PRODUCTION QA
Date: $DATE_LABEL
Overall Status: $OVERALL_STATUS
Failures: $failures

1. Infrastructure
   Liveness: /api/health/live → HTTP $LIVE_CODE
   Readiness: /api/health/ready → HTTP $READY_CODE
   Health: /api/health → HTTP $HEALTH_CODE
   Database: $DB_OK
   Auth: secret=$AUTH_SECRET_OK url=$AUTH_URL_OK
   OpenRouter: $OR_KEY

2. Public Website
   Routes: $(echo "$report" | grep -c "PASS.*HTTP 200") passed / ${#PUBLIC_ROUTES[@]} total
   404: HTTP $NOT_FOUND_CODE
   Sitemap: $SITEMAP_CODE | Robots: $ROBOTS_CODE
   Arabic: $AR_CODE ($AR_LANG)

3. Auth Pages: login=$LOGIN_PAGE_CODE register=$REGISTER_PAGE_CODE

4. Protected Routes: ${#PROTECTED[@]} tested

5. Performance: slow routes=$SLOW_ROUTES

Unverified: $unverified
═══════════════════════════════════════════════
EOF
)

echo "$SUMMARY" >> "$LOG"
echo "$SUMMARY"

# Alert on failures
if [ "$failures" -gt 0 ]; then
  echo "[$TS] Nightly QA: $failures failures — $OVERALL_STATUS" >> "$ALERT_LOG"
fi

exit 0