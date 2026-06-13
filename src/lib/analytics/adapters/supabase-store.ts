import type { AnalyticsEventCategory, StoredAnalyticsEvent } from "@/types/analytics";
import { isSupabaseConfigured } from "@/lib/leads/storage-backend";

function supabaseHeaders(): HeadersInit | null {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!process.env.SUPABASE_URL?.trim() || !key) return null;
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

export function isSupabaseAnalyticsEnabled(): boolean {
  return isSupabaseConfigured();
}

export async function readEventsFromSupabase(): Promise<StoredAnalyticsEvent[]> {
  const headers = supabaseHeaders();
  const url = restUrl("analytics_events?select=*&order=timestamp.desc&limit=50000");
  if (!headers || !url) return [];

  try {
    const res = await fetch(url, { headers, cache: "no-store" });
    if (!res.ok) return [];
    const rows = (await res.json()) as Record<string, unknown>[];
    return rows.map(rowToEvent);
  } catch {
    return [];
  }
}

function rowToEvent(row: Record<string, unknown>): StoredAnalyticsEvent {
  const payload = row.payload as StoredAnalyticsEvent | undefined;
  if (payload?.id && payload.name) return payload;

  return {
    id: String(row.id),
    name: String(row.name),
    category: String(row.category) as AnalyticsEventCategory,
    timestamp: String(row.timestamp ?? row.created_at),
    sessionId: row.session_id as string | undefined,
    visitorId: row.visitor_id as string | undefined,
    leadId: row.lead_id as string | undefined,
    page: (row.page as StoredAnalyticsEvent["page"]) ?? undefined,
    source: (row.source as StoredAnalyticsEvent["source"]) ?? undefined,
    context: (row.context as StoredAnalyticsEvent["context"]) ?? undefined,
    action: (row.action as StoredAnalyticsEvent["action"]) ?? undefined,
    metrics: (row.metrics as StoredAnalyticsEvent["metrics"]) ?? undefined,
    meta: (row.meta as StoredAnalyticsEvent["meta"]) ?? undefined,
  };
}

function eventToRow(event: StoredAnalyticsEvent): Record<string, unknown> {
  return {
    id: event.id,
    name: event.name,
    category: event.category,
    timestamp: event.timestamp,
    session_id: event.sessionId ?? null,
    visitor_id: event.visitorId ?? null,
    lead_id: event.leadId ?? null,
    page: event.page ?? {},
    source: event.source ?? {},
    context: event.context ?? {},
    action: event.action ?? {},
    metrics: event.metrics ?? {},
    meta: event.meta ?? {},
    payload: event,
  };
}

export async function appendEventToSupabase(event: StoredAnalyticsEvent): Promise<boolean> {
  const headers = supabaseHeaders();
  const url = restUrl("analytics_events");
  if (!headers || !url) return false;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(eventToRow(event)),
    });
    return res.ok;
  } catch {
    return false;
  }
}
