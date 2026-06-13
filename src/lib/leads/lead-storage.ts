import type { Lead, StoredLead } from "@/types/lead";
import { saveLeadRecord } from "./lead-repository";
import { logger } from "@/lib/logger";

export type PersistLeadResult = {
  ok: boolean;
  lead?: StoredLead;
  leadId?: string;
  error?: string;
};

export async function persistLead(lead: Lead): Promise<PersistLeadResult> {
  if (lead.status === "spam") {
    logger.info("lead.persist.spam", { sourceType: lead.source.sourceType });
    return { ok: true, leadId: `spam_${Date.now()}` };
  }

  try {
    const stored = await saveLeadRecord(lead);
    return { ok: true, lead: stored, leadId: stored.id };
  } catch (err) {
    logger.error("lead.persist.failed", {
      error: err instanceof Error ? err.message : "save_failed",
      sourceType: lead.source.sourceType,
    });

    if (process.env.NODE_ENV === "development") {
      return { ok: true, leadId: `dev_${Date.now()}` };
    }

    return { ok: false, error: "storage_failed" };
  }
}
