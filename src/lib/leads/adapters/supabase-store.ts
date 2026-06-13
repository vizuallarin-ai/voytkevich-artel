import type { StoredLead } from "@/types/lead";
import { isSupabaseConfigured } from "../storage-backend";

function supabaseHeaders(): HeadersInit | null {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return null;
  return {
    "Content-Type": "application/json",
    apikey: key,
    Authorization: `Bearer ${key}`,
    Prefer: "return=representation",
  };
}

function restUrl(path: string): string | null {
  const base = process.env.SUPABASE_URL?.trim();
  if (!base) return null;
  return `${base.replace(/\/$/, "")}/rest/v1/${path}`;
}

function rowToLead(row: Record<string, unknown>): StoredLead {
  const payload = row.payload as StoredLead | undefined;
  if (payload && typeof payload === "object" && payload.id) {
    return payload;
  }

  return {
    id: String(row.id),
    status: row.status as StoredLead["status"],
    source: {
      sourceType: (row.source_type as StoredLead["source"]["sourceType"]) ?? "unknown",
      sourceName: row.source_name as string | undefined,
      pageSlug: row.page_slug as string | undefined,
      currentUrl: row.current_url as string | undefined,
      referrer: row.referrer as string | undefined,
      ctaLabel: row.cta_label as string | undefined,
    },
    contact: {
      name: String(row.name ?? ""),
      phone: String(row.phone ?? ""),
      messenger: row.messenger as string | undefined,
      email: row.email as string | undefined,
    },
    request: {
      type: (row.request_type as StoredLead["request"]["type"]) ?? "unknown",
      title: String(row.request_title ?? "Заявка"),
      comment: row.comment as string | undefined,
    },
    context: (row.context as StoredLead["context"]) ?? {},
    qualification: (row.qualification as StoredLead["qualification"]) ?? { readiness: "unknown" },
    analytics: (row.analytics as StoredLead["analytics"]) ?? {},
    meta: {
      createdAt: String(row.created_at ?? new Date().toISOString()),
      updatedAt: String(row.updated_at ?? row.created_at ?? new Date().toISOString()),
    },
    comments: [],
    timeline: [],
  };
}

function leadToRow(lead: StoredLead): Record<string, unknown> {
  return {
    id: lead.id,
    status: lead.status,
    source_type: lead.source.sourceType,
    source_name: lead.source.sourceName ?? null,
    page_slug: lead.source.pageSlug ?? null,
    current_url: lead.source.currentUrl ?? null,
    referrer: lead.source.referrer ?? null,
    cta_label: lead.request.selectedCTA ?? lead.source.ctaLabel ?? null,
    name: lead.contact.name,
    phone: lead.contact.phone,
    messenger: lead.contact.messenger ?? null,
    email: lead.contact.email ?? null,
    request_type: lead.request.type,
    request_title: lead.request.title,
    comment: lead.request.comment ?? null,
    context: lead.context ?? {},
    qualification: lead.qualification ?? {},
    analytics: lead.analytics ?? {},
    lead_score: lead.qualification.leadScore ?? null,
    readiness: lead.qualification.readiness ?? null,
    created_at: lead.meta.createdAt,
    updated_at: lead.meta.updatedAt ?? lead.meta.createdAt,
    payload: lead,
  };
}

export function isSupabaseLeadStoreEnabled(): boolean {
  return isSupabaseConfigured();
}

export async function readLeadsFromSupabase(): Promise<StoredLead[]> {
  const headers = supabaseHeaders();
  const url = restUrl("leads?select=*&order=created_at.desc");
  if (!headers || !url) return [];

  try {
    const res = await fetch(url, { headers, cache: "no-store" });
    if (!res.ok) return [];
    const rows = (await res.json()) as Record<string, unknown>[];
    return rows.map(rowToLead);
  } catch {
    return [];
  }
}

export async function upsertLeadInSupabase(lead: StoredLead): Promise<boolean> {
  const headers = supabaseHeaders();
  const url = restUrl("leads");
  if (!headers || !url) return false;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        ...headers,
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify(leadToRow(lead)),
    });
    return res.ok;
  } catch {
    return false;
  }
}
