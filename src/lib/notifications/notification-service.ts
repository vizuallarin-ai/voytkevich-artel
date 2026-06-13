import type {
  LeadAutomationNotification,
  LeadAutomationResult,
  LeadPriority,
  StoredLead,
} from "@/types/lead";
import { formatTelegramLeadMessage } from "@/lib/leads/lead-notification-formatters";
import { getNotificationConfig, shouldSendNotification } from "./notification-config";
import { sendTelegramNotification } from "./adapters/telegram";
import { sendLeadEmailNotification } from "./adapters/email";
import { sendLeadAutomationWebhook } from "./adapters/webhook";
import { sendMockNotification } from "./adapters/mock";
import { logger } from "@/lib/logger";

export async function sendLeadNotifications(
  lead: StoredLead,
  automation: LeadAutomationResult,
): Promise<LeadAutomationNotification[]> {
  const config = getNotificationConfig();
  const isSpam = lead.status === "spam";
  const results: LeadAutomationNotification[] = [];
  const now = new Date().toISOString();

  if (!shouldSendNotification(config, { isSpam, priority: automation.priority })) {
    logger.info("lead.notification.skipped", { leadId: lead.id, reason: "policy" });
    return results;
  }

  const automationPayload = {
    priority: automation.priority,
    recommendedAction: automation.recommendedAction,
    sla: automation.sla,
  };

  if (config.telegramEnabled) {
    const message = formatTelegramLeadMessage(lead, automationPayload);
    const res = await sendTelegramNotification(message);
    results.push({
      channel: "telegram",
      success: res.success,
      sentAt: res.success ? now : undefined,
      error: res.error,
    });
    if (!res.success) logger.warn("lead.notification.telegram_failed", { leadId: lead.id, error: res.error });
  }

  if (config.emailEnabled) {
    const res = await sendLeadEmailNotification(lead, automationPayload);
    results.push({
      channel: "email",
      success: res.success,
      sentAt: res.success ? now : undefined,
      error: res.error,
    });
    if (!res.success) logger.warn("lead.notification.email_failed", { leadId: lead.id, error: res.error });
  }

  if (config.webhookEnabled) {
    const res = await sendLeadAutomationWebhook(lead, automation);
    results.push({
      channel: "webhook",
      success: res.success,
      sentAt: res.success ? now : undefined,
      error: res.error,
    });
    if (!res.success) logger.warn("lead.notification.webhook_failed", { leadId: lead.id, error: res.error });
  }

  const anyChannelConfigured =
    config.telegramEnabled || config.emailEnabled || config.webhookEnabled;

  if (!anyChannelConfigured && process.env.NODE_ENV === "development") {
    const res = await sendMockNotification(lead, automation);
    results.push({
      channel: "mock",
      success: res.success,
      sentAt: res.success ? now : undefined,
      error: res.error,
    });
  }

  return results;
}

export function hasSuccessfulNotification(notifications: LeadAutomationNotification[]): boolean {
  return notifications.some((n) => n.success);
}