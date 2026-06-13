import { randomUUID } from "crypto";
import type {
  Lead,
  LeadComment,
  LeadListParams,
  LeadListResult,
  LeadNextAction,
  LeadStatus,
  LeadTimelineEvent,
  StoredLead,
} from "@/types/lead";
import { demoLeads, shouldIncludeDemoLeads } from "@/data/demo-leads";
import {
  appendLeadToFile,
  isFileStoreEnabled,
  readLeadsFromFile,
  updateLeadInFile,
} from "./adapters/file-store";
import {
  isSupabaseLeadStoreEnabled,
  readLeadsFromSupabase,
  upsertLeadInSupabase,
} from "./adapters/supabase-store";
import { resolveLeadStorage } from "./storage-backend";
import { getLeadStatusLabel } from "./lead-status";
import { filterLeads, paginateLeads } from "./lead-filters";
import { enrichLeadSLA } from "./lead-sla";
import { recordCrmStatusChanged } from "@/lib/analytics/server-events";

async function readStoredLeads(): Promise<StoredLead[]> {
  const backend = resolveLeadStorage();
  if (backend === "supabase") return readLeadsFromSupabase();
  if (backend === "file") return readLeadsFromFile();
  return [];
}

async function persistStoredLead(lead: StoredLead): Promise<void> {
  const backend = resolveLeadStorage();
  if (backend === "supabase") {
    await upsertLeadInSupabase(lead);
    return;
  }
  if (backend === "file") {
    await appendLeadToFile(lead);
  }
}

async function saveStoredLeadUpdate(lead: StoredLead): Promise<boolean> {
  const backend = resolveLeadStorage();
  if (backend === "supabase") return upsertLeadInSupabase(lead);
  if (backend === "file") return updateLeadInFile(lead);
  return false;
}

export async function saveLeadRecord(lead: Lead): Promise<StoredLead> {
  const stored: StoredLead = {
    ...lead,
    id: lead.id ?? randomUUID(),
    comments: lead.comments ?? [],
    timeline: lead.timeline ?? [
      {
        id: randomUUID(),
        leadId: "",
        type: "created",
        title: "Заявка создана",
        createdAt: lead.meta.createdAt,
      },
    ],
  };
  const timeline = stored.timeline ?? [];
  if (timeline[0]) timeline[0].leadId = stored.id;
  stored.timeline = timeline;

  if (resolveLeadStorage() !== "none") {
    await persistStoredLead(stored);
  }

  return stored;
}

export async function getAllLeads(includeDemo?: boolean): Promise<StoredLead[]> {
  let leads: StoredLead[] = [];

  if (isFileStoreEnabled() || isSupabaseLeadStoreEnabled()) {
    leads = await readStoredLeads();
  }

  const real = leads.filter((l) => !l.isDemo);
  if (includeDemo ?? shouldIncludeDemoLeads(real.length)) {
    const demoIds = new Set(real.map((l) => l.id));
    const extras = demoLeads.filter((d) => !demoIds.has(d.id));
    return [...real, ...extras].map(enrichLeadSLA);
  }

  return real.map(enrichLeadSLA);
}

export async function getLeads(params: LeadListParams = {}): Promise<LeadListResult> {
  const all = await getAllLeads();
  const filtered = filterLeads(all, params);
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const { items, total, totalPages } = paginateLeads(filtered, page, limit);

  return { leads: items, total, page, limit, totalPages };
}

export async function getLeadById(id: string): Promise<StoredLead | null> {
  const all = await getAllLeads(true);
  return all.find((l) => l.id === id) ?? null;
}

export async function updateStoredLead(
  id: string,
  patch: Partial<StoredLead>,
  event?: Omit<LeadTimelineEvent, "id" | "leadId" | "createdAt">,
): Promise<StoredLead | null> {
  const lead = await getLeadById(id);
  if (!lead) return null;

  const updated: StoredLead = {
    ...lead,
    ...patch,
    meta: { ...lead.meta, updatedAt: new Date().toISOString() },
    timeline: [...(lead.timeline ?? [])],
    comments: patch.comments ?? lead.comments ?? [],
  };

  if (event) {
    updated.timeline!.push({
      id: randomUUID(),
      leadId: id,
      createdAt: new Date().toISOString(),
      ...event,
    });
  }

  if (patch.status && patch.status !== lead.status) {
    void recordCrmStatusChanged(updated, patch.status);
  }

  if (!lead.isDemo && resolveLeadStorage() !== "none") {
    await saveStoredLeadUpdate(updated);
  }

  return updated;
}

export async function updateLeadStatus(id: string, status: LeadStatus, lostReason?: StoredLead["lostReason"]) {
  const lead = await getLeadById(id);
  if (!lead) return null;

  return updateStoredLead(
    id,
    { status, lostReason: status === "lost" ? lostReason : undefined },
    {
      type: "status_changed",
      title: `Статус: ${getLeadStatusLabel(status)}`,
      description: lostReason ? `Причина: ${lostReason}` : undefined,
    },
  );
}

export async function addLeadComment(id: string, text: string, authorName = "Менеджер") {
  const lead = await getLeadById(id);
  if (!lead) return null;

  const comment: LeadComment = {
    id: randomUUID(),
    leadId: id,
    text: text.trim(),
    authorName,
    createdAt: new Date().toISOString(),
  };

  const comments = [...(lead.comments ?? []), comment];
  return updateStoredLead(
    id,
    { comments },
    { type: "comment_added", title: "Добавлен комментарий", description: text.trim() },
  );
}

export async function setLeadNextAction(id: string, action: LeadNextAction) {
  return updateStoredLead(
    id,
    { nextAction: action },
    {
      type: "next_action_set",
      title: "Назначен следующий шаг",
      description: action.comment ?? action.title ?? action.type,
    },
  );
}

export async function applyLeadAutomation(
  id: string,
  data: {
    automation: StoredLead["automation"];
    nextAction?: StoredLead["nextAction"];
    timelineEvents: Omit<LeadTimelineEvent, "id" | "leadId" | "createdAt">[];
  },
): Promise<StoredLead | null> {
  const lead = await getLeadById(id);
  if (!lead) return null;

  const timeline = [...(lead.timeline ?? [])];
  for (const event of data.timelineEvents) {
    timeline.push({
      id: randomUUID(),
      leadId: id,
      createdAt: new Date().toISOString(),
      ...event,
    });
  }

  const updated: StoredLead = {
    ...lead,
    automation: data.automation,
    nextAction: data.nextAction ?? lead.nextAction,
    timeline,
    meta: { ...lead.meta, updatedAt: new Date().toISOString() },
  };

  if (!lead.isDemo && resolveLeadStorage() !== "none") {
    await saveStoredLeadUpdate(updated);
  }

  return updated;
}

export function getStorageStatus(): {
  fileStore: boolean;
  supabase: boolean;
  backend: ReturnType<typeof resolveLeadStorage>;
  telegram: boolean;
  webhook: boolean;
  demoMode: boolean;
} {
  const backend = resolveLeadStorage();
  return {
    fileStore: backend === "file",
    supabase: backend === "supabase",
    backend,
    telegram: Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID),
    webhook: Boolean(process.env.N8N_LEAD_WEBHOOK_URL ?? process.env.LEADS_WEBHOOK_URL),
    demoMode: shouldIncludeDemoLeads(0),
  };
}
