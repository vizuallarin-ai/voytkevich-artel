#!/bin/bash
# Найти TELEGRAM_CHAT_ID для группы и проверить отправку.
# 1) Добавьте бота в группу
# 2) Напишите в группе: @имя_бота test
# 3) bash scripts/discover-telegram-chat-id.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="${APP_DIR:-$(cd "$SCRIPT_DIR/.." && pwd)}"
cd "$APP_DIR"

if [ ! -f .env ]; then
  echo "ERROR: .env not found in $APP_DIR"
  exit 1
fi

set -a
# shellcheck source=/dev/null
source .env
set +a

if [ -z "${TELEGRAM_BOT_TOKEN:-}" ]; then
  echo "ERROR: TELEGRAM_BOT_TOKEN пустой"
  exit 1
fi

echo "==> Bot info (getMe)"
curl -sS "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe"
echo ""

echo ""
echo "==> Webhook (если url не пустой — getUpdates не работает!)"
WEBHOOK=$(curl -sS "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo")
echo "$WEBHOOK"
if echo "$WEBHOOK" | grep -q '"url":"http'; then
  echo ""
  echo "WARN: webhook активен — удаляем для диагностики..."
  curl -sS "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteWebhook?drop_pending_updates=true"
  echo ""
fi

echo ""
echo "==> TELEGRAM_CHAT_ID из .env"
echo "TELEGRAM_CHAT_ID=${TELEGRAM_CHAT_ID:-<empty>}"

echo ""
echo "==> Последние чаты (getUpdates)"
echo "    Если result пустой: напишите в группе @BotUsername test и запустите снова"
UPDATES=$(curl -sS "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates?limit=20")
echo "$UPDATES" | python3 -m json.tool 2>/dev/null || echo "$UPDATES"

echo ""
echo "==> Найденные chat id (grep)"
echo "$UPDATES" | grep -o '"chat":{[^}]*"id":[^,]*' | head -10 || echo "(ничего)"

if [ -n "${TELEGRAM_CHAT_ID:-}" ]; then
  echo ""
  echo "==> Тест sendMessage с TELEGRAM_CHAT_ID из .env"
  curl -sS -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
    -H "Content-Type: application/json" \
    -d "{\"chat_id\":${TELEGRAM_CHAT_ID},\"text\":\"Тест discover-telegram-chat-id.sh\",\"disable_web_page_preview\":true}"
  echo ""
fi
