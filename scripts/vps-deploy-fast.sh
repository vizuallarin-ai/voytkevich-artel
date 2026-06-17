#!/bin/bash
# Smart deploy: pull only, rebuild only when runtime files changed.
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/stroistroy}"
cd "$APP_DIR"

PREV_SHA="$(git rev-parse HEAD)"
echo "==> git pull"
git pull origin master
CUR_SHA="$(git rev-parse HEAD)"

if [ "$PREV_SHA" = "$CUR_SHA" ]; then
  echo "Already up to date — skip"
  exit 0
fi

CHANGED="$(git diff --name-only "$PREV_SHA" "$CUR_SHA")"
echo "Changed files:"
echo "$CHANGED" | head -20
[ "$(echo "$CHANGED" | wc -l)" -le 20 ] || echo "..."

needs_build=false
needs_recreate=false

while IFS= read -r file; do
  [ -z "$file" ] && continue
  case "$file" in
    src/*|public/*|package.json|package-lock.json|Dockerfile|next.config.*|.github/workflows/*)
      needs_build=true
      ;;
    .env|.env.*)
      needs_recreate=true
      ;;
  esac
done <<< "$CHANGED"

if [ "$needs_build" = true ]; then
  echo "==> docker compose up --build web (source/deps changed)"
  docker compose up -d --build web
elif [ "$needs_recreate" = true ]; then
  echo "==> docker compose recreate (env only)"
  docker compose up -d --force-recreate web
else
  echo "No runtime changes (docs/scripts only) — skip container"
  exit 0
fi

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
