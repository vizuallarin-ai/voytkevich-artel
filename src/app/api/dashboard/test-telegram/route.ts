import { NextResponse } from "next/server";
import {
  isTelegramConfigured,
  normalizeTelegramChatId,
  sendTelegramTestMessage,
} from "@/lib/notifications/adapters/telegram";

export async function POST() {
  if (!isTelegramConfigured()) {
    return NextResponse.json(
      { ok: false, error: "telegram_not_configured", message: "TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID не заданы" },
      { status: 503 },
    );
  }

  const result = await sendTelegramTestMessage();
  if (!result.success) {
    return NextResponse.json(
      {
        ok: false,
        error: result.error,
        chatId: process.env.TELEGRAM_CHAT_ID?.trim()
          ? normalizeTelegramChatId(process.env.TELEGRAM_CHAT_ID.trim())
          : null,
      },
      { status: 502 },
    );
  }
  return NextResponse.json({ ok: true, message: "Test message sent to Telegram" });
}
