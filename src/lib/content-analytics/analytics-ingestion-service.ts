import type { ContentAnalyticsSource } from "@/types/content-analytics";
import type {
  NormalizedAnalyticsRecord,
  RawAnalyticsRecord,
} from "@/lib/content-analytics/analytics-normalizer";
import {
  calculateDataCompleteness,
  normalizeAnalyticsRecord,
  validateAnalyticsRecord,
} from "@/lib/content-analytics/analytics-normalizer";
import { deduplicateAnalyticsRecords } from "@/lib/content-analytics/analytics-deduplicator";
import { analyticsSourceRegistry } from "@/lib/content-analytics/analytics-source-registry";

export type AnalyticsIngestionResult = {
  ingested: number;
  skipped: number;
  duplicates: number;
  invalid: number;
  errors: string[];
};

export type AnalyticsIngestionSummary = {
  totalRecords: number;
  bySource: Record<ContentAnalyticsSource, number>;
  dataCompleteness: ReturnType<typeof calculateDataCompleteness>;
  lastIngestedAt: string | null;
  duplicateKeys: number;
};

const ingestionStore = new Map<string, NormalizedAnalyticsRecord>();
const ingestionLog: AnalyticsIngestionResult[] = [];

export function ingestAnalyticsData(
  source: ContentAnalyticsSource,
  records: RawAnalyticsRecord[],
): AnalyticsIngestionResult {
  const result: AnalyticsIngestionResult = {
    ingested: 0,
    skipped: 0,
    duplicates: 0,
    invalid: 0,
    errors: [],
  };

  if (!analyticsSourceRegistry.isAvailable(source) && source !== "manual-import") {
    result.errors.push(`Source ${source} is not available`);
    return result;
  }

  for (const raw of records) {
    const withSource = { ...raw, source: raw.source ?? source };
    const validation = validateAnalyticsRecord(withSource);

    if (!validation.valid) {
      result.invalid += 1;
      result.errors.push(...validation.errors);
      continue;
    }

    const normalized = normalizeAnalyticsRecord(withSource, source);
    const existing = ingestionStore.get(normalized.idempotencyKey);

    if (existing) {
      result.duplicates += 1;
      result.skipped += 1;
      continue;
    }

    ingestionStore.set(normalized.idempotencyKey, normalized);
    result.ingested += 1;
  }

  if (result.ingested > 0) {
    analyticsSourceRegistry.recordSyncSuccess(source);
  }

  ingestionLog.push(result);
  return result;
}

export function getIngestedRecords(filters?: {
  source?: ContentAnalyticsSource;
  contentItemId?: string;
}): NormalizedAnalyticsRecord[] {
  let records = [...ingestionStore.values()];

  if (filters?.source) {
    records = records.filter((r) => r.source === filters.source);
  }
  if (filters?.contentItemId) {
    records = records.filter((r) => r.contentItemId === filters.contentItemId);
  }

  return deduplicateAnalyticsRecords(records);
}

export function getAnalyticsIngestionSummary(): AnalyticsIngestionSummary {
  const records = [...ingestionStore.values()];
  const bySource = {} as Record<ContentAnalyticsSource, number>;

  for (const def of analyticsSourceRegistry.list()) {
    bySource[def.id] = 0;
  }

  for (const record of records) {
    bySource[record.source] = (bySource[record.source] ?? 0) + 1;
  }

  const keys = new Set(records.map((r) => r.idempotencyKey));

  return {
    totalRecords: records.length,
    bySource,
    dataCompleteness: calculateDataCompleteness(records),
    lastIngestedAt:
      records.length > 0
        ? records.reduce((latest, r) =>
            new Date(r.ingestedAt).getTime() > new Date(latest).getTime() ? r.ingestedAt : latest,
          records[0].ingestedAt)
        : null,
    duplicateKeys: records.length - keys.size,
  };
}

export function clearIngestionStore(): void {
  ingestionStore.clear();
  ingestionLog.length = 0;
}

export function getIngestionHistory(): AnalyticsIngestionResult[] {
  return [...ingestionLog];
}

export const analyticsIngestionService = {
  ingest: ingestAnalyticsData,
  getRecords: getIngestedRecords,
  getSummary: getAnalyticsIngestionSummary,
  clear: clearIngestionStore,
  getHistory: getIngestionHistory,
};
