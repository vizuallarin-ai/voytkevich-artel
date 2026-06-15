#!/bin/bash
# Set human-readable CRM login on VPS.
# Usage: bash scripts/set-dashboard-password.sh "YourPassword"
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/stroistroy}"
USERNAME="${DASHBOARD_USERNAME:-stroistroy}"
PASSWORD="${1:-}"

cd "$APP_DIR"

if [ ! -f .env ]; then
  echo "ERROR: .env not found"
  exit 1
fi

if [ -z "$PASSWORD" ]; then
  echo "Usage: bash scripts/set-dashboard-password.sh \"your-password\""
  exit 1
fi

if grep -q '^DASHBOARD_USERNAME=' .env; then
  sed -i "s/^DASHBOARD_USERNAME=.*/DASHBOARD_USERNAME=${USERNAME}/" .env
else
  echo "DASHBOARD_USERNAME=${USERNAME}" >> .env
fi

if grep -q '^DASHBOARD_PASSWORD=' .env; then
  sed -i "s|^DASHBOARD_PASSWORD=.*|DASHBOARD_PASSWORD=${PASSWORD}|" .env
else
  echo "DASHBOARD_PASSWORD=${PASSWORD}" >> .env
fi

docker compose up -d

echo ""
echo "=== CRM login ==="
echo "URL:      https://stroistroy.ru/dashboard/login"
echo "Login:    ${USERNAME}"
echo "Password: (the one you just set)"
echo "================="
