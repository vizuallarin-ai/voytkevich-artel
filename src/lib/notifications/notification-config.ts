import type { LeadPriority } from "@/types/lead";

export type NotificationConfig = {
  telegramEnabled: boolean;
  emailEnabled: boolean;
  webhookEnabled: boolean;
  sendForSpam: boolean;
  sendForLowPriority: boolean;
  urgentOnlyMode: boolean;
};

function envBool(key: string, defaultValue: boolean): boolean {
  const v = process.env[key]?.trim().toLowerCase();
  if (v === "true" || v === "1") return true;
  if (v === "false" || v === "0") return false;
  return defaultValue;
}

export function getNotificationConfig(): NotificationConfig {
  return {
    telegramEnabled: Boolean(
      process.env.TELEGRAM_BOT_TOKEN?.trim() && process.env.TELEGRAM_CHAT_ID?.trim(),
    ),
    emailEnabled: Boolean(
      process.env.LEADS_NOTIFICATION_EMAIL &&
        (process.env.RESEND_API_KEY || process.env.EMAIL_API_KEY || process.env.SMTP_HOST),
    ),
    webhookEnabled: Boolean(
      process.env.N8N_LEAD_NOTIFICATION_WEBHOOK_URL ??
        process.env.N8N_LEAD_WEBHOOK_URL ??
        process.env.LEADS_WEBHOOK_URL,
    ),
    sendForSpam: envBool("LEAD_NOTIFICATIONS_SEND_SPAM", false),
    sendForLowPriority: envBool("LEAD_NOTIFICATIONS_SEND_LOW_PRIORITY", true),
    urgentOnlyMode: envBool("LEAD_NOTIFICATIONS_URGENT_ONLY", false),
  };
}

export function shouldSendNotification(
  config: NotificationConfig,
  opts: { isSpam: boolean; priority: LeadPriority },
): boolean {
  if (opts.isSpam && !config.sendForSpam) return false;
  if (config.urgentOnlyMode && opts.priority !== "urgent" && opts.priority !== "high") return false;
  if (!config.sendForLowPriority && opts.priority === "low") return false;
  return true;
}

/** Client auto-reply — disabled until channels and consent are configured */
export const CLIENT_AUTO_REPLY = {
  enabled: envBool("LEAD_CLIENT_AUTO_REPLY", false),
};
