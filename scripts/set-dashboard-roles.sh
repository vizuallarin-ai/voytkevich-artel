#!/bin/bash
# Set CRM passwords: stroistroy (full access) + manager (leads only).
# Usage: bash scripts/set-dashboard-roles.sh [admin_pass] [manager_pass]
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/stroistroy}"
cd "$APP_DIR"

ADMIN_PASS="${1:-$(openssl rand -hex 16)}"
MANAGER_PASS="${2:-$(openssl rand -hex 16)}"

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
set_kv DASHBOARD_MANAGER_USERNAME manager
set_kv DASHBOARD_MANAGER_PASSWORD "$MANAGER_PASS"

# Удалить устаревшую роль director
sed -i '/^DASHBOARD_DIRECTOR_/d' .env 2>/dev/null || true

echo "=== CRM passwords (save securely) ==="
echo "stroistroy (всё)  / $ADMIN_PASS"
echo "manager  (заявки) / $MANAGER_PASS"
echo ""
echo "Restart: docker compose up -d --force-recreate web"
