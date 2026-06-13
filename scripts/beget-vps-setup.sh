#!/bin/bash
# Beget VPS first-time setup for stroistroy.ru
# Run on server: bash scripts/beget-vps-setup.sh

set -euo pipefail

apt update && apt upgrade -y
apt install -y docker.io docker-compose-v2 nginx certbot python3-certbot-nginx git ufw

ufw allow OpenSSH
ufw allow 'Nginx Full'
echo "y" | ufw enable || true

if [ ! -f /swapfile ]; then
  fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

if [ ! -d /opt/stroistroy/.git ]; then
  git clone https://github.com/vizuallarin-ai/voytkevich-artel.git /opt/stroistroy
else
  cd /opt/stroistroy && git pull origin master
fi

cd /opt/stroistroy

if [ ! -f .env ]; then
  cp .env.example .env
  TOKEN=$(openssl rand -hex 32)
  sed -i "s/change-me-long-random-token/${TOKEN}/" .env
  echo ""
  echo "=== DASHBOARD_ACCESS_TOKEN (save this) ==="
  echo "${TOKEN}"
  echo "=========================================="
fi

docker compose up -d --build

cp deploy/nginx.stroistroy.ru.conf /etc/nginx/sites-available/stroistroy.ru
ln -sf /etc/nginx/sites-available/stroistroy.ru /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

echo ""
echo "Next: certbot --nginx -d stroistroy.ru -d www.stroistroy.ru"
echo "Then: https://stroistroy.ru/dashboard/login"
