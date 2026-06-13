import type { Lead } from "@/types/lead";

export async function sendLeadToWebhook(lead: Lead, url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "lead.created",
        lead,
        summary: lead.meta,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function sendLeadToTelegram(lead: Lead, text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return false;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function sendLeadEmail(lead: Lead, text: string): Promise<boolean> {
  const email = process.env.LEADS_NOTIFICATION_EMAIL;
  const apiKey = process.env.RESEND_API_KEY ?? process.env.EMAIL_API_KEY;
  const from = process.env.EMAIL_FROM ?? "leads@stroistroy.ru";
  if (!email || !apiKey) return false;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject: `Новая заявка: ${lead.contact.name}`,
        text,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function saveLeadToSupabase(lead: Lead): Promise<{ ok: boolean; id?: string }> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return { ok: false };

  try {
    const res = await fetch(`${url}/rest/v1/leads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: key,
        Authorization: `Bearer ${key}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        status: lead.status,
        source_type: lead.source.sourceType,
        source_name: lead.source.sourceName,
        page_slug: lead.source.pageSlug,
        current_url: lead.meta.currentUrl,
        referrer: lead.meta.referrer,
        cta_label: lead.request.selectedCTA ?? lead.source.ctaLabel,
        name: lead.contact.name,
        phone: lead.contact.phone,
        messenger: lead.contact.messenger,
        email: lead.contact.email,
        request_type: lead.request.type,
        request_title: lead.request.title,
        comment: lead.request.comment,
        context: lead.context,
        qualification: lead.qualification,
        analytics: lead.analytics,
        lead_score: lead.qualification.leadScore,
        readiness: lead.qualification.readiness,
        created_at: lead.meta.createdAt,
      }),
    });
    if (!res.ok) return { ok: false };
    const rows = (await res.json()) as { id?: string }[];
    return { ok: true, id: rows[0]?.id };
  } catch {
    return { ok: false };
  }
}

export function mockLeadSubmit(lead: Lead): { ok: true; leadId: string } {
  const leadId = `dev_${Date.now()}`;
  if (process.env.NODE_ENV === "development") {
    // Dev-only structured log for debugging lead payloads
    process.stdout.write(`[leads:dev] ${JSON.stringify({ leadId, sourceType: lead.source.sourceType, score: lead.qualification.leadScore })}\n`);
  }
  return { ok: true, leadId };
}
