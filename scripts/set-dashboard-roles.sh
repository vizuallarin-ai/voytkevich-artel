#!/bin/bash
# Set CRM passwords for admin, director, and manager roles on VPS.
# Usage: bash scripts/set-dashboard-roles.sh
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/stroistroy}"
cd "$APP_DIR"

ADMIN_PASS="${1:-$(openssl rand -hex 16)}"
DIRECTOR_PASS="${2:-$(openssl rand -hex 16)}"
MANAGER_PASS="${3:-$(openssl rand -hex 16)}"

set_kv() {
  local key="$1"
  local val="$2"
  if grep -q "^${key}=" .env 2>/dev/null; then
    sed -i "s|^${key}=.*|${key}=${val}|" .env
  else
    echo "${key}=${val}" >> .env
  fi
}

set_kv DASHBOARD_USERNAME stroistroy
set_kv DASHBOARD_PASSWORD "$ADMIN_PASS"
set_kv DASHBOARD_DIRECTOR_USERNAME director
set_kv DASHBOARD_DIRECTOR_PASSWORD "$DIRECTOR_PASS"
set_kv DASHBOARD_MANAGER_USERNAME manager
set_kv DASHBOARD_MANAGER_PASSWORD "$MANAGER_PASS"

echo "=== CRM passwords (save securely) ==="
echo "admin    stroistroy / $ADMIN_PASS"
echo "director director   / $DIRECTOR_PASS"
echo "manager  manager    / $MANAGER_PASS"
echo ""
echo "Restart: docker compose up -d --force-recreate web"
