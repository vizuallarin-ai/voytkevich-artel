const WEBHOOK_TIMEOUT_MS = 8000;

type SendResult = { success: boolean; error?: string };

type TelegramApiResponse = {
  ok?: boolean;
  error_code?: number;
  description?: string;
  parameters?: { migrate_to_chat_id?: number };
};

function getTelegramCredentials(): { token: string; chatId: string | number } | null {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const rawChatId = process.env.TELEGRAM_CHAT_ID?.trim();
  if (!token || !rawChatId) return null;
  return { token, chatId: normalizeTelegramChatId(rawChatId) };
}

/** Нормализует chat_id: убирает кавычки, для числовых id — number (важно для групп -100…). */
export function normalizeTelegramChatId(raw: string): string | number {
  const trimmed = raw.trim().replace(/^['"]|['"]$/g, "");
  if (/^-?\d+$/.test(trimmed)) {
    const parsed = Number(trimmed);
    if (Number.isSafeInteger(parsed)) return parsed;
  }
  return trimmed;
}

async function postTelegramMessage(
  token: string,
  chatId: string | number,
  text: string,
  parseMode?: "Markdown" | "HTML",
): Promise<SendResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS);

  try {
    const body: Record<string, unknown> = {
      chat_id: chatId,
      text: text.slice(0, 4096),
      disable_web_page_preview: true,
    };
    if (parseMode) body.parse_mode = parseMode;

    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const payload = (await res.json().catch(() => ({}))) as TelegramApiResponse;

    if (!res.ok || !payload.ok) {
      const description = payload.description ?? (await res.text().catch(() => ""));
      const migrateId = payload.parameters?.migrate_to_chat_id;
      const hint = migrateId
        ? ` (group migrated — use TELEGRAM_CHAT_ID=${migrateId})`
        : "";
      return {
        success: false,
        error: `telegram_${payload.error_code ?? res.status}: ${description}${hint}`.slice(0, 500),
      };
    }

    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "telegram_failed";
    return { success: false, error: msg };
  } finally {
    clearTimeout(timeout);
  }
}

/** Plain-text lead alert (no Markdown) — reliable fallback for groups. */
export function formatTelegramPlainLeadMessage(
  name: string,
  phone: string,
  summary: string,
  pageUrl?: string,
): string {
  const lines = [
    "Новая заявка stroistroy.ru",
    "",
    `Имя: ${name}`,
    `Телефон: ${phone}`,
    "",
    summary,
  ];
  if (pageUrl) lines.push("", `Страница: ${pageUrl}`);
  return lines.join("\n");
}

export async function sendTelegramTestMessage(): Promise<SendResult> {
  const creds = getTelegramCredentials();
  if (!creds) return { success: false, error: "telegram_not_configured" };
  return postTelegramMessage(
    creds.token,
    creds.chatId,
    "Тест stroistroy.ru — уведомления о заявках настроены.",
  );
}

export async function sendTelegramNotification(
  message: string,
  options?: { parseMode?: "Markdown" | "HTML" | "plain" },
): Promise<SendResult> {
  const creds = getTelegramCredentials();
  if (!creds) {
    return { success: false, error: "telegram_not_configured" };
  }

  const mode = options?.parseMode ?? "Markdown";

  if (mode === "plain") {
    return postTelegramMessage(creds.token, creds.chatId, message);
  }

  const first = await postTelegramMessage(creds.token, creds.chatId, message, mode);
  if (first.success) return first;

  const plain = message
    .replace(/\\([_*[\]()~`>#+\-=|{}.!\\])/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1: $2");

  const second = await postTelegramMessage(creds.token, creds.chatId, plain);
  if (second.success) return second;

  return {
    success: false,
    error: `${first.error ?? "markdown_failed"} | fallback: ${second.error ?? "plain_failed"}`,
  };
}

export function isTelegramConfigured(): boolean {
  return getTelegramCredentials() !== null;
}
