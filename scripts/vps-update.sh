#!/bin/bash
# Update stroistroy on VPS: pull, rebuild, nginx, SSL, backup cron.
# Run on server: bash scripts/vps-update.sh
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/stroistroy}"
DOMAIN="${DOMAIN:-stroistroy.ru}"
CERTBOT_EMAIL="${CERTBOT_EMAIL:-admin@stroistroy.ru}"

cd "$APP_DIR"

echo "==> git pull"
git pull origin master

echo "==> docker compose up"
docker compose up -d --build

echo "==> wait for app"
for i in $(seq 1 30); do
  if curl -sf http://127.0.0.1:3000/api/health >/dev/null; then
    echo "health OK"
    break
  fi
  sleep 2
done

curl -sf http://127.0.0.1:3000/api/health | head -c 500 || echo "WARN: health check failed"

if curl -sf http://127.0.0.1:3000/api/health | grep -q '"telegram":true'; then
  echo "==> telegram test (optional)"
  if [ -f scripts/test-telegram.sh ]; then
    bash scripts/test-telegram.sh || echo "WARN: telegram test failed — проверьте TELEGRAM_* в .env"
  else
    echo "WARN: scripts/test-telegram.sh not found — git pull или создайте скрипт"
    curl -sS -X POST http://127.0.0.1:3000/api/dashboard/test-telegram 2>/dev/null | head -c 300 || true
    echo ""
  fi
fi

echo "==> nginx"
if certbot certificates 2>/dev/null | grep -q "$DOMAIN"; then
  echo "SSL cert exists — keeping nginx config (certbot-managed)"
  nginx -t
  systemctl reload nginx
else
  cp deploy/nginx.stroistroy.ru.conf /etc/nginx/sites-available/stroistroy.ru
  ln -sf /etc/nginx/sites-available/stroistroy.ru /etc/nginx/sites-enabled/
  rm -f /etc/nginx/sites-enabled/default
  nginx -t
  systemctl reload nginx
fi

echo "==> SSL (certbot)"
if certbot certificates 2>/dev/null | grep -q "$DOMAIN"; then
  certbot renew --quiet || true
else
  certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" \
    --agree-tos -m "$CERTBOT_EMAIL" --non-interactive --redirect || \
    echo "WARN: certbot failed — check DNS A-record points to this server"
fi

echo "==> backup cron"
chmod +x scripts/backup-stroistroy-data.sh scripts/verify-production.sh scripts/setup-github-deploy-key.sh scripts/test-telegram.sh scripts/set-telegram-chat-id.sh 2>/dev/null || true
CRON_LINE="0 3 * * * APP_DIR=$APP_DIR $APP_DIR/scripts/backup-stroistroy-data.sh >> /var/log/stroistroy-backup.log 2>&1"
(crontab -l 2>/dev/null | grep -v backup-stroistroy-data; echo "$CRON_LINE") | crontab -

echo "==> smoke test"
bash scripts/verify-production.sh "https://$DOMAIN" || echo "WARN: some checks failed"

echo ""
echo "DONE"
echo "Site: https://$DOMAIN"
echo "CRM:  https://$DOMAIN/dashboard/login"
echo "Health: curl -s https://$DOMAIN/api/health"
