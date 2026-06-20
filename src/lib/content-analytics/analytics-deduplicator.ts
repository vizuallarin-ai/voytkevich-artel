import type { NormalizedAnalyticsRecord } from "@/lib/content-analytics/analytics-normalizer";

export function deduplicateAnalyticsRecords(
  records: NormalizedAnalyticsRecord[],
): NormalizedAnalyticsRecord[] {
  const seen = new Map<string, NormalizedAnalyticsRecord>();

  for (const record of records) {
    const existing = seen.get(record.idempotencyKey);
    if (!existing) {
      seen.set(record.idempotencyKey, record);
      continue;
    }

    if (new Date(record.ingestedAt).getTime() >= new Date(existing.ingestedAt).getTime()) {
      seen.set(record.idempotencyKey, record);
    }
  }

  return [...seen.values()];
}

export function buildIdempotencyKey(parts: {
  source: string;
  occurredAt: string;
  contentItemId?: string;
  url?: string;
  eventName?: string;
  importBatchId?: string;
}): string {
  return [
    parts.source,
    parts.occurredAt,
    parts.contentItemId ?? parts.url ?? "unknown",
    parts.eventName ?? "metric",
    parts.importBatchId ?? "",
  ].join(":");
}

export function findDuplicateKeys(records: NormalizedAnalyticsRecord[]): string[] {
  const counts = new Map<string, number>();
  for (const record of records) {
    counts.set(record.idempotencyKey, (counts.get(record.idempotencyKey) ?? 0) + 1);
  }
  return [...counts.entries()].filter(([, count]) => count > 1).map(([key]) => key);
}
