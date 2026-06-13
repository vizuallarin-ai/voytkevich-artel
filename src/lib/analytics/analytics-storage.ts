import { randomUUID } from "crypto";
import type {
  AnalyticsEvent,
  AnalyticsEventFilters,
  StoredAnalyticsEvent,
} from "@/types/analytics";
import { buildAnalyticsEvent } from "./analytics-event";
import { demoAnalyticsEvents, shouldIncludeDemoAnalytics } from "@/data/demo-analytics-events";
import {
  appendEventToFile,
  isAnalyticsFileStoreEnabled,
  readEventsFromFile,
} from "./adapters/file-store";
import {
  appendEventToSupabase,
  isSupabaseAnalyticsEnabled,
  readEventsFromSupabase,
} from "./adapters/supabase-store";
import { resolveAnalyticsStorage } from "@/lib/leads/storage-backend";
import { logger } from "@/lib/logger";

export async function saveAnalyticsEvent(event: AnalyticsEvent): Promise<StoredAnalyticsEvent | null> {
  const clean = buildAnalyticsEvent(event);
  const stored: StoredAnalyticsEvent = { ...clean, id: randomUUID() };

  if (!isAnalyticsFileStoreEnabled() && !isSupabaseAnalyticsEnabled()) {
    if (process.env.NODE_ENV === "development") {
      logger.info("analytics.event.noop", { name: stored.name, category: stored.category });
    }
    return stored;
  }

  try {
    const backend = resolveAnalyticsStorage();
    if (backend === "supabase") {
      await appendEventToSupabase(stored);
    } else if (backend === "file") {
      await appendEventToFile(stored);
    }
    return stored;
  } catch (err) {
    logger.warn("analytics.event.save_failed", {
      name: stored.name,
      error: err instanceof Error ? err.message : "unknown",
    });
    return null;
  }
}

export async function getAnalyticsEvents(filters: AnalyticsEventFilters = {}): Promise<StoredAnalyticsEvent[]> {
  let events: StoredAnalyticsEvent[] = [];

  if (isAnalyticsFileStoreEnabled() || isSupabaseAnalyticsEnabled()) {
    events = await (resolveAnalyticsStorage() === "supabase"
      ? readEventsFromSupabase()
      : readEventsFromFile());
  }

  const real = events.filter((e) => !e.meta?.debug);
  if (shouldIncludeDemoAnalytics(real.length)) {
    const ids = new Set(real.map((e) => e.id));
    const extras = demoAnalyticsEvents.filter((e) => !ids.has(e.id));
    events = [...real, ...extras];
  } else {
    events = real;
  }

  return filterEvents(events, filters);
}

function filterEvents(events: StoredAnalyticsEvent[], filters: AnalyticsEventFilters): StoredAnalyticsEvent[] {
  let result = [...events];

  if (filters.from) {
    const from = new Date(filters.from).getTime();
    result = result.filter((e) => new Date(e.timestamp).getTime() >= from);
  }
  if (filters.to) {
    const to = new Date(filters.to).getTime();
    result = result.filter((e) => new Date(e.timestamp).getTime() <= to);
  }
  if (filters.name) result = result.filter((e) => e.name === filters.name);
  if (filters.category) result = result.filter((e) => e.category === filters.category);
  if (filters.sessionId) result = result.filter((e) => e.sessionId === filters.sessionId);
  if (filters.leadId) result = result.filter((e) => e.leadId === filters.leadId);

  result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (filters.limit) result = result.slice(0, filters.limit);
  return result;
}

export function getAnalyticsStorageStatus() {
  const backend = resolveAnalyticsStorage();
  return {
    fileStore: backend === "file",
    supabase: backend === "supabase",
    backend,
    demoMode: shouldIncludeDemoAnalytics(0),
  };
}
