import { NextResponse } from "next/server";
import { z } from "zod";

const LeadSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(7),
  area: z.string().optional(),
  comment: z.string().optional(),
  source: z.string().optional(),
});

type Lead = z.infer<typeof LeadSchema>;

async function sendToTelegram(lead: Lead): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return false;

  const lines = formatLeadMessage(lead);

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: lines,
      parse_mode: "Markdown",
    }),
  });

  return res.ok;
}

async function sendToWebhook(lead: Lead): Promise<boolean> {
  const url = process.env.LEADS_WEBHOOK_URL;
  if (!url) return false;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...lead, receivedAt: new Date().toISOString() }),
  });

  return res.ok;
}

function formatLeadMessage(lead: Lead): string {
  return [
    "🏠 *Новая заявка с сайта*",
    "",
    `👤 Имя: ${lead.name}`,
    `📞 Телефон: ${lead.phone}`,
    lead.area ? `📐 Площадь: ${lead.area} м²` : null,
    lead.comment ? `💬 Комментарий:\n${lead.comment}` : null,
    lead.source ? `📌 Источник: ${lead.source}` : null,
    "",
    `🕐 ${new Date().toLocaleString("ru-RU", { timeZone: "Asia/Irkutsk" })} (ИСТ)`,
  ]
    .filter(Boolean)
    .join("\n");
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = LeadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 422 },
    );
  }

  const lead = parsed.data;
  const delivered =
    (await sendToTelegram(lead)) || (await sendToWebhook(lead));

  if (!delivered && process.env.NODE_ENV === "development") {
    console.info("[leads] Dev mode — logged locally:", formatLeadMessage(lead));
    return NextResponse.json({ ok: true, dev: true });
  }

  if (!delivered) {
    console.error("[leads] No delivery channel configured or delivery failed", {
      source: lead.source,
      hasTelegram: !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID),
      hasWebhook: !!process.env.LEADS_WEBHOOK_URL,
    });
    return NextResponse.json(
      {
        ok: false,
        error: "delivery_failed",
        message:
          "Заявка не доставлена. Позвоните нам напрямую — мы на связи в рабочее время.",
      },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true });
}
