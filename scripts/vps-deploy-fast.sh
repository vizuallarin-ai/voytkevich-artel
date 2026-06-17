#!/bin/bash
# Fast deploy: pull + rebuild web + health check (for CI and routine updates).
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/stroistroy}"
cd "$APP_DIR"

echo "==> git pull"
git pull origin master

echo "==> docker compose up --build web"
docker compose up -d --build web

echo "==> wait for app"
for i in $(seq 1 30); do
  if curl -sf http://127.0.0.1:3000/api/health >/dev/null; then
    echo "health OK"
    curl -sf http://127.0.0.1:3000/api/health | head -c 500
    echo ""
    exit 0
  fi
  sleep 2
done

echo "ERROR: health check failed"
exit 1
