#!/bin/bash
# Smoke test production from VPS or locally.
set -euo pipefail

BASE="${1:-https://stroistroy.ru}"
FAIL=0

check() {
  local name="$1"
  local url="$2"
  local expect="$3"
  local code
  code=$(curl -s -o /tmp/stroistroy-check.out -w "%{http_code}" --connect-timeout 15 "$url" || echo "000")
  if [ "$code" = "$expect" ]; then
    echo "OK  $name ($code)"
  else
    echo "FAIL $name expected $expect got $code"
    FAIL=1
  fi
}

echo "==> Production checks: $BASE"

check "home" "$BASE/" "200"
check "calculator" "$BASE/calculator" "200"
check "crm-login" "$BASE/dashboard/login" "200"
check "health" "$BASE/api/health" "200"
check "robots" "$BASE/robots.txt" "200"
check "sitemap" "$BASE/sitemap.xml" "200"
check "http-redirect" "http://${BASE#https://}/" "301"

if curl -sf "$BASE/api/health" | grep -q '"ok":true'; then
  echo "OK  health payload"
else
  echo "FAIL health payload"
  FAIL=1
fi

if curl -sf "$BASE/api/health" | grep -q '"dashboard":true'; then
  echo "OK  dashboard auth configured"
else
  echo "WARN dashboard auth not configured"
fi

if curl -sf "$BASE/sitemap.xml" | grep -q "<loc>${BASE}</loc>"; then
  echo "OK  sitemap contains homepage"
else
  echo "FAIL sitemap missing homepage URL"
  FAIL=1
fi

EXPORT_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/dashboard/export")
if [ "$EXPORT_CODE" = "401" ]; then
  echo "OK  export protected (401)"
else
  echo "FAIL export should be 401, got $EXPORT_CODE"
  FAIL=1
fi

if [ "$FAIL" -eq 0 ]; then
  echo ""
  echo "All checks passed."
else
  echo ""
  echo "Some checks failed."
  exit 1
fi
