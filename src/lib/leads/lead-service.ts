import type {
  LeadListParams,
  LeadListResult,
  LeadNextAction,
  LeadStatus,
  StoredLead,
} from "@/types/lead";
import {
  addLeadComment,
  getLeadById,
  getLeads,
  getStorageStatus,
  setLeadNextAction,
  updateLeadStatus,
  updateStoredLead,
  getAllLeads,
} from "./lead-repository";
import { getLeadMetrics } from "./lead-metrics";

export { getLeadMetrics } from "./lead-metrics";
export { getStorageStatus } from "./lead-repository";

export async function fetchLeads(params: LeadListParams = {}): Promise<LeadListResult> {
  return getLeads(params);
}

export async function fetchLead(id: string): Promise<StoredLead | null> {
  return getLeadById(id);
}

export async function fetchDashboardMetrics() {
  const leads = await getAllLeads(true);
  return getLeadMetrics(leads);
}

export async function changeLeadStatus(id: string, status: LeadStatus, lostReason?: StoredLead["lostReason"]) {
  return updateLeadStatus(id, status, lostReason);
}

export async function postLeadComment(id: string, text: string, authorName?: string) {
  return addLeadComment(id, text, authorName);
}

export async function saveLeadNextAction(id: string, action: LeadNextAction) {
  return setLeadNextAction(id, action);
}

export async function patchLead(id: string, patch: Partial<StoredLead>) {
  return updateStoredLead(id, patch, { type: "lead_updated", title: "Лид обновлён" });
}
