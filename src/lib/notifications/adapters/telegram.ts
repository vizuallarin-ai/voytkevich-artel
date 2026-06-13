const WEBHOOK_TIMEOUT_MS = 8000;

export async function sendTelegramNotification(
  message: string,
  options?: { parseMode?: "Markdown" | "HTML" },
): Promise<{ success: boolean; error?: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    return { success: false, error: "telegram_not_configured" };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS);

    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: options?.parseMode ?? "Markdown",
        disable_web_page_preview: true,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { success: false, error: `telegram_http_${res.status}: ${body.slice(0, 100)}` };
    }
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "telegram_failed";
    return { success: false, error: msg };
  }
}
