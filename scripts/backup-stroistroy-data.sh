#!/bin/bash
# Daily backup of stroistroy Docker volume (.data) — run on VPS via cron.
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/stroistroy}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/stroistroy}"
KEEP_DAYS="${KEEP_DAYS:-14}"
STAMP="$(date +%Y%m%d-%H%M%S)"
ARCHIVE="${BACKUP_DIR}/stroistroy-data-${STAMP}.tar.gz"

mkdir -p "$BACKUP_DIR"

if docker volume inspect stroistroy_stroistroy-data >/dev/null 2>&1; then
  VOLUME="stroistroy_stroistroy-data"
elif docker volume inspect stroistroy-data >/dev/null 2>&1; then
  VOLUME="stroistroy-data"
else
  echo "ERROR: stroistroy data volume not found"
  exit 1
fi

docker run --rm \
  -v "${VOLUME}:/data:ro" \
  -v "${BACKUP_DIR}:/backup" \
  alpine:3.20 \
  tar -czf "/backup/stroistroy-data-${STAMP}.tar.gz" -C /data .

find "$BACKUP_DIR" -name 'stroistroy-data-*.tar.gz' -mtime +"$KEEP_DAYS" -delete

echo "Backup saved: $ARCHIVE"
