import type { LeadAutomationResult, LeadProcessingType, LeadTimelineEvent, StoredLead } from "@/types/lead";
import { logger } from "@/lib/logger";
import { getLeadPriority, getLeadProcessingType } from "./lead-routing";
import { calculateLeadSLA } from "./lead-sla";
import { getRecommendedNextAction } from "./lead-tasks";
import { formatLeadNotificationSummary } from "./lead-notification-formatters";
import { sendLeadNotifications, hasSuccessfulNotification } from "@/lib/notifications/notification-service";
import { updateStoredLead, applyLeadAutomation } from "./lead-repository";

export async function handleNewLeadAutomation(lead: StoredLead): Promise<LeadAutomationResult> {
  if (lead.status === "spam") {
    logger.info("lead.automation.spam_skipped", { leadId: lead.id });
    return {
      success: true,
      leadId: lead.id,
      priority: "low",
      notifications: [],
      message: "Spam lead — notifications skipped",
    };
  }

  const priority = getLeadPriority(lead);
  const processingType = getLeadProcessingType(lead);
  const sla = calculateLeadSLA(lead, priority);
  const recommendedAction = getRecommendedNextAction(lead);

  recommendedAction.dueAt = sla.responseDeadlineAt;
  recommendedAction.at = sla.responseDeadlineAt;

  const partialResult: LeadAutomationResult = {
    success: false,
    leadId: lead.id,
    priority,
    recommendedAction,
    sla,
    notifications: [],
    message: "Automation in progress",
  };

  const notifications = await sendLeadNotifications(lead, partialResult);
  partialResult.notifications = notifications;

  const anySuccess = hasSuccessfulNotification(notifications);
  const anyConfigured = notifications.length > 0;
  partialResult.success = anySuccess || !anyConfigured;
  partialResult.message = anySuccess
    ? "Automation completed"
    : anyConfigured
      ? "Lead saved; some notifications failed"
      : "Lead saved; no notification channels configured";

  if (!anySuccess && anyConfigured) {
    logger.warn("lead.automation.notifications_failed", {
      leadId: lead.id,
      channels: notifications.map((n) => n.channel),
    });
  }

  await persistAutomationResult(lead, partialResult, processingType);

  return partialResult;
}

async function persistAutomationResult(
  lead: StoredLead,
  result: LeadAutomationResult,
  processingType: LeadProcessingType,
): Promise<void> {
  const now = new Date().toISOString();

  const timelineEvents: Omit<LeadTimelineEvent, "id" | "leadId" | "createdAt">[] = [
    {
      type: "automation_started",
      title: "Запущена автоматизация",
      description: formatLeadNotificationSummary(lead).slice(0, 200),
      createdBy: "system",
    },
    {
      type: "sla_assigned",
      title: `SLA: ${result.sla?.targetResponseMinutes ?? 0} мин.`,
      description: result.sla?.responseDeadlineAt
        ? `Дедлайн: ${new Date(result.sla.responseDeadlineAt).toLocaleString("ru-RU")}`
        : undefined,
      createdBy: "system",
    },
    {
      type: "next_action_set",
      title: result.recommendedAction?.title ?? "Назначен следующий шаг",
      description: result.recommendedAction?.description,
      createdBy: "system",
    },
  ];

  for (const n of result.notifications) {
    timelineEvents.push({
      type: n.success ? "notification_sent" : "notification_failed",
      title: n.success ? `Уведомление: ${n.channel}` : `Ошибка: ${n.channel}`,
      description: n.error,
      createdBy: "system",
    });
  }

  await applyLeadAutomation(lead.id, {
    automation: {
      priority: result.priority,
      sla: result.sla,
      recommendedAction: result.recommendedAction,
      notifications: result.notifications,
      lastAutomationAt: now,
      processingType,
    },
    nextAction: result.recommendedAction,
    timelineEvents,
  });
}

export { formatLeadNotificationSummary };
