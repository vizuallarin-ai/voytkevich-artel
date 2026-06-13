#!/bin/bash
# Rotate DASHBOARD_ACCESS_TOKEN on VPS and restart container.
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/stroistroy}"
cd "$APP_DIR"

if [ ! -f .env ]; then
  echo "ERROR: .env not found"
  exit 1
fi

TOKEN=$(openssl rand -hex 32)
if grep -q '^DASHBOARD_ACCESS_TOKEN=' .env; then
  sed -i "s/^DASHBOARD_ACCESS_TOKEN=.*/DASHBOARD_ACCESS_TOKEN=${TOKEN}/" .env
else
  echo "DASHBOARD_ACCESS_TOKEN=${TOKEN}" >> .env
fi

docker compose up -d --force-recreate

echo ""
echo "=== NEW DASHBOARD_ACCESS_TOKEN ==="
echo "$TOKEN"
echo "=================================="
echo "Save it — old sessions are invalidated."
