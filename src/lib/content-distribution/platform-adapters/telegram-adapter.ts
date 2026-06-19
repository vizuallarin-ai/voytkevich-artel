import type { ExternalPublication, PublishResult } from "@/types/content-distribution";
import { createBaseAdapter } from "./base-adapter";

function isTelegramChannelConfigured(): boolean {
  return Boolean(
    process.env.TELEGRAM_BOT_TOKEN?.trim() &&
      (process.env.TELEGRAM_CHANNEL_ID?.trim() || process.env.TELEGRAM_CHAT_ID?.trim()),
  );
}

export const telegramAdapter = {
  ...createBaseAdapter("telegram", {
    canPublish: isTelegramChannelConfigured(),
    canSchedule: false,
    requiresManualExport: !isTelegramChannelConfigured(),
  }),
  async publish(publication: ExternalPublication): Promise<PublishResult> {
    if (!isTelegramChannelConfigured()) {
      return {
        success: false,
        error: {
          code: "needs-api",
          message: "TELEGRAM_BOT_TOKEN и TELEGRAM_CHANNEL_ID не настроены",
        },
      };
    }

    const token = process.env.TELEGRAM_BOT_TOKEN!.trim();
    const chatId = (
      process.env.TELEGRAM_CHANNEL_ID ?? process.env.TELEGRAM_CHAT_ID
    )!.trim();

    const text = [
      publication.payload.title,
      "",
      publication.payload.text,
      "",
      publication.payload.utmUrl,
    ].join("\n");

    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: text.slice(0, 4096),
          disable_web_page_preview: false,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; description?: string; result?: { message_id?: number } };
      if (!res.ok || !data.ok) {
        return {
          success: false,
          error: { code: "telegram_error", message: data.description ?? "Telegram API error" },
        };
      }
      return {
        success: true,
        externalId: String(data.result?.message_id ?? ""),
        publishedUrl: `https://t.me/`,
      };
    } catch (err) {
      return {
        success: false,
        error: {
          code: "telegram_fetch_failed",
          message: err instanceof Error ? err.message : "Network error",
        },
      };
    }
  },
};
