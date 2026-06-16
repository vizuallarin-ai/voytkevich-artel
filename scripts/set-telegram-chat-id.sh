#!/bin/bash
# Прописать TELEGRAM_CHAT_ID в .env на VPS и перезапустить контейнер.
# Запуск на сервере: bash scripts/set-telegram-chat-id.sh
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/stroistroy}"
CHAT_ID="${1:--1004302996579}"

cd "$APP_DIR"

if [ ! -f .env ]; then
  cp .env.example .env
fi

if grep -q '^TELEGRAM_CHAT_ID=' .env; then
  sed -i "s/^TELEGRAM_CHAT_ID=.*/TELEGRAM_CHAT_ID=${CHAT_ID}/" .env
else
  echo "TELEGRAM_CHAT_ID=${CHAT_ID}" >> .env
fi

docker compose up -d --force-recreate

echo "OK TELEGRAM_CHAT_ID=${CHAT_ID}"
grep '^TELEGRAM_' .env || true

if [ -f scripts/test-telegram.sh ]; then
  bash scripts/test-telegram.sh || true
fi
