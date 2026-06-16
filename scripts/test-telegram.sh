#!/bin/bash
# Тест Telegram с VPS: читает .env и шлёт сообщение в группу.
# Запуск: bash scripts/test-telegram.sh
# Или: APP_DIR=/opt/stroistroy bash scripts/test-telegram.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="${APP_DIR:-$(cd "$SCRIPT_DIR/.." && pwd)}"

cd "$APP_DIR"

if [ ! -f .env ]; then
  echo "ERROR: .env not found in $APP_DIR"
  exit 1
fi

# shellcheck disable=SC1091
set -a
# shellcheck source=/dev/null
source .env
set +a

if [ -z "${TELEGRAM_BOT_TOKEN:-}" ] || [ -z "${TELEGRAM_CHAT_ID:-}" ]; then
  echo "ERROR: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is empty in .env"
  grep '^TELEGRAM_' .env || true
  exit 1
fi

echo "APP_DIR=$APP_DIR"
echo "Sending test to chat_id=${TELEGRAM_CHAT_ID} ..."

RESP=$(curl -sS -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
  -H "Content-Type: application/json" \
  -d "{\"chat_id\":${TELEGRAM_CHAT_ID},\"text\":\"✅ Тест stroistroy.ru — бот может писать в этот чат\",\"disable_web_page_preview\":true}")

echo "$RESP"

if echo "$RESP" | grep -q '"ok":true'; then
  echo ""
  echo "OK — проверьте группу в Telegram."
  exit 0
fi

echo ""
echo "FAIL — типичные причины:"
echo "  1) Бот не добавлен в группу или удалён"
echo "  2) Неверный TELEGRAM_BOT_TOKEN"
echo "  3) Неверный TELEGRAM_CHAT_ID (нужен id группы, например -1004302996579)"
echo "  4) Контейнер не перечитал .env — docker compose up -d --force-recreate"
echo ""
echo "Альтернатива — тест через приложение (если задеployена новая версия):"
echo "  curl -sS -X POST http://127.0.0.1:3000/api/dashboard/test-telegram"
exit 1
