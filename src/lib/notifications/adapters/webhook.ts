import type { LeadAutomationResult, StoredLead } from "@/types/lead";
import { formatLeadNotificationSummary } from "@/lib/leads/lead-notification-formatters";

const WEBHOOK_TIMEOUT_MS = 8000;

export async function sendLeadAutomationWebhook(
  lead: StoredLead,
  automation: LeadAutomationResult,
): Promise<{ success: boolean; error?: string }> {
  const url =
    process.env.N8N_LEAD_NOTIFICATION_WEBHOOK_URL ??
    process.env.N8N_LEAD_WEBHOOK_URL ??
    process.env.LEADS_WEBHOOK_URL;

  if (!url) return { success: false, error: "webhook_not_configured" };

  const payload = {
    event: "lead.created",
    lead,
    automation: {
      priority: automation.priority,
      recommendedAction: automation.recommendedAction,
      sla: automation.sla,
      summary: formatLeadNotificationSummary(lead),
      processingType: lead.automation?.processingType,
    },
    createdAt: lead.meta.createdAt,
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS);

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeout);
    if (!res.ok) {
      return { success: false, error: `webhook_http_${res.status}` };
    }
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "webhook_failed";
    return { success: false, error: msg };
  }
}
