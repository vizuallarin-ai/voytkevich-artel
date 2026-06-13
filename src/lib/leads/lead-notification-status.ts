import type { LeadAutomationNotification } from "@/types/lead";

export function getNotificationStatusSummary(
  notifications: LeadAutomationNotification[] | undefined,
): "sent" | "partial" | "failed" | "none" {
  if (!notifications?.length) return "none";
  const success = notifications.filter((n) => n.success).length;
  if (success === notifications.length) return "sent";
  if (success > 0) return "partial";
  return "failed";
}
