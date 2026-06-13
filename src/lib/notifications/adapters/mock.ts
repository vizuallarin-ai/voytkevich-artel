import type { StoredLead } from "@/types/lead";
import type { LeadAutomationResult } from "@/types/lead";
import { logger } from "@/lib/logger";

export async function sendMockNotification(
  lead: StoredLead,
  automation: LeadAutomationResult,
): Promise<{ success: boolean; error?: string }> {
  if (process.env.NODE_ENV !== "development") {
    return { success: false, error: "mock_dev_only" };
  }

  logger.info("lead.notification.mock", {
    leadId: lead.id,
    priority: automation.priority,
    sourceType: lead.source.sourceType,
    phone: lead.contact.phone,
  });

  return { success: true };
}
