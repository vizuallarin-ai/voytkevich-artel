import type {
  IndexationMonitoringRecord,
  IndexationVerificationStatus,
  SearchEngine,
} from "@/types/indexation-monitoring";
import type { CMSContentItem } from "@/types/content-cms";
import type { IndexablePageInput } from "@/lib/seo-indexation/indexable-page";
import { cmsItemToIndexablePage } from "@/lib/seo-indexation/indexable-page-adapters";
import { evaluateIndexability } from "@/lib/seo-indexation/indexability-service";

const monitoringStore = new Map<string, IndexationMonitoringRecord>();

function recordKey(url: string, engine: SearchEngine): string {
  return `${engine}:${url}`;
}

export function createMonitoringRecord(
  page: IndexablePageInput,
  searchEngine: SearchEngine,
): IndexationMonitoringRecord {
  const decision = evaluateIndexability(page);
  const record: IndexationMonitoringRecord = {
    id: recordKey(page.url, searchEngine),
    url: page.url,
    canonicalUrl: decision.canonicalUrl,
    searchEngine,
    status: "not-checked" as IndexationVerificationStatus,
    contentItemId: page.id,
    priority: page.seo.priority,
    sitemapIncluded: decision.sitemap,
    robotsIndex: decision.robots.index,
    notes: "Status unknown without GSC/Yandex Webmaster credentials",
    updatedAt: new Date().toISOString(),
  };

  monitoringStore.set(record.id, record);
  return record;
}

export function getMonitoringRecord(url: string, searchEngine: SearchEngine): IndexationMonitoringRecord | undefined {
  return monitoringStore.get(recordKey(url, searchEngine));
}

export function listMonitoringRecords(searchEngine?: SearchEngine): IndexationMonitoringRecord[] {
  const all = [...monitoringStore.values()];
  return searchEngine ? all.filter((r) => r.searchEngine === searchEngine) : all;
}

export async function checkIndexationStatus(
  url: string,
  searchEngine: SearchEngine,
): Promise<IndexationMonitoringRecord> {
  const existing = getMonitoringRecord(url, searchEngine);
  if (existing) return existing;

  return {
    id: recordKey(url, searchEngine),
    url,
    searchEngine,
    status: "not-checked" as IndexationVerificationStatus,
    sitemapIncluded: false,
    robotsIndex: false,
    notes: "API credentials not configured — cannot verify indexation",
    updatedAt: new Date().toISOString(),
  };
}

export function updateMonitoringStatus(
  url: string,
  searchEngine: SearchEngine,
  status: IndexationVerificationStatus,
  notes?: string,
): IndexationMonitoringRecord | undefined {
  const key = recordKey(url, searchEngine);
  const existing = monitoringStore.get(key);
  if (!existing) return undefined;

  const updated: IndexationMonitoringRecord = {
    ...existing,
    status,
    notes: notes ?? existing.notes,
    lastCheckedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  monitoringStore.set(key, updated);
  return updated;
}

export const indexationMonitoringService = {
  createMonitoringRecord,
  getMonitoringRecord,
  listMonitoringRecords,
  checkIndexationStatus,
  updateMonitoringStatus,

  hasExternalCredentials(): boolean {
    return Boolean(
      process.env.GOOGLE_SEARCH_CONSOLE_CREDENTIALS ||
        process.env.YANDEX_WEBMASTER_TOKEN,
    );
  },

  buildMonitoringRecords(items: CMSContentItem[]) {
    const engines: SearchEngine[] = ["google", "yandex"];
    return items.flatMap((item) =>
      engines.map((searchEngine) =>
        createMonitoringRecord(cmsItemToIndexablePage(item), searchEngine),
      ),
    );
  },
};
