import nodemailer from "nodemailer";
import type { StoredLead } from "@/types/lead";
import { formatEmailBody, formatEmailSubject } from "@/lib/leads/lead-notification-formatters";
import type { LeadAutomationResult } from "@/types/lead";
import { getPriorityLabel } from "@/lib/leads/lead-routing";

const WEBHOOK_TIMEOUT_MS = 8000;

function smtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASS?.trim(),
  );
}

async function sendViaSmtp(
  to: string,
  from: string,
  subject: string,
  text: string,
): Promise<{ success: boolean; error?: string }> {
  const port = Number(process.env.SMTP_PORT ?? 465);
  const secure = process.env.SMTP_SECURE !== "false";

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({ from, to, subject, text });
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "smtp_failed";
    return { success: false, error: msg };
  }
}

async function sendViaResend(
  to: string,
  from: string,
  subject: string,
  text: string,
): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY ?? process.env.EMAIL_API_KEY;
  if (!apiKey) return { success: false, error: "email_api_not_configured" };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [to], subject, text }),
      signal: controller.signal,
    });

    clearTimeout(timeout);
    if (!res.ok) return { success: false, error: `email_http_${res.status}` };
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "email_failed";
    return { success: false, error: msg };
  }
}

export async function sendLeadEmailNotification(
  lead: StoredLead,
  automation: Pick<LeadAutomationResult, "priority" | "recommendedAction" | "sla">,
): Promise<{ success: boolean; error?: string }> {
  const to = process.env.LEADS_NOTIFICATION_EMAIL;
  const from = process.env.EMAIL_FROM ?? process.env.SMTP_USER ?? "leads@stroistroy.ru";

  if (!to) return { success: false, error: "email_not_configured" };

  const subject = formatEmailSubject(lead, getPriorityLabel(automation.priority));
  const body = formatEmailBody(lead, automation);

  if (smtpConfigured()) {
    return sendViaSmtp(to, from, subject, body);
  }

  return sendViaResend(to, from, subject, body);
}
