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

async function sendToTelegram(lead: Lead): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) return;

  const lines = [
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

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: lines,
      parse_mode: "Markdown",
    }),
  });
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

  await sendToTelegram(parsed.data);

  return NextResponse.json({ ok: true });
}
