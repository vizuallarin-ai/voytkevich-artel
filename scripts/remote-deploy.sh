#!/bin/bash
set -euo pipefail

APP_DIR="/opt/stroistroy"
DOMAIN="${DOMAIN:-stroistroy.ru}"
CERTBOT_EMAIL="${CERTBOT_EMAIL:-admin@stroistroy.ru}"
REPO="${REPO:-https://github.com/vizuallarin-ai/voytkevich-artel.git}"

echo "==> Prepare directory"
mkdir -p "$APP_DIR"

if [ -d "$APP_DIR/.git" ]; then
  echo "==> git pull"
  cd "$APP_DIR"
  git pull origin master
elif [ -f /opt/stroistroy.tgz ]; then
  echo "==> Extract archive (legacy)"
  tar -xzf /opt/stroistroy.tgz -C "$APP_DIR"
  rm -f /opt/stroistroy.tgz
else
  echo "==> git clone"
  git clone "$REPO" "$APP_DIR"
  cd "$APP_DIR"
fi

cd "$APP_DIR"

if [ ! -f docker-compose.yml ]; then
  echo "ERROR: docker-compose.yml missing"
  exit 1
fi

echo "==> Configure .env"
if [ ! -f .env ]; then
  cp .env.example .env
  TOKEN=$(openssl rand -hex 32)
  sed -i "s/change-me-long-random-token/${TOKEN}/" .env
  echo ""
  echo "=== DASHBOARD_ACCESS_TOKEN (save this) ==="
  echo "$TOKEN"
  echo "========================================"
else
  echo ".env exists — keeping current token"
fi

echo "==> Docker build & start"
docker compose up -d --build

echo "==> Health check"
for i in $(seq 1 30); do
  if curl -sf http://127.0.0.1:3000/api/health >/dev/null; then
    curl -s http://127.0.0.1:3000/api/health
    break
  fi
  sleep 2
done

echo "==> nginx"
if certbot certificates 2>/dev/null | grep -q "$DOMAIN"; then
  echo "SSL cert exists — keeping nginx config"
  nginx -t && systemctl reload nginx
else
  cp deploy/nginx.stroistroy.ru.conf /etc/nginx/sites-available/stroistroy.ru
  ln -sf /etc/nginx/sites-available/stroistroy.ru /etc/nginx/sites-enabled/
  rm -f /etc/nginx/sites-enabled/default
  nginx -t
  systemctl reload nginx
fi

echo "==> SSL"
if ! certbot certificates 2>/dev/null | grep -q "$DOMAIN"; then
  certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" \
    --agree-tos -m "$CERTBOT_EMAIL" --non-interactive --redirect || \
    echo "WARN: certbot skipped — configure DNS first"
fi

echo "==> backup cron"
chmod +x scripts/backup-stroistroy-data.sh scripts/vps-update.sh scripts/rotate-crm-token.sh 2>/dev/null || true
CRON_LINE="0 3 * * * APP_DIR=$APP_DIR $APP_DIR/scripts/backup-stroistroy-data.sh >> /var/log/stroistroy-backup.log 2>&1"
(crontab -l 2>/dev/null | grep -v backup-stroistroy-data; echo "$CRON_LINE") | crontab -

echo ""
echo "DONE. Site: https://$DOMAIN"
echo "CRM:   https://$DOMAIN/dashboard/login"
