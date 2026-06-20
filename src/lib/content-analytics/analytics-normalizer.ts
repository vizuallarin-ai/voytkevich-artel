import type { ContentAnalyticsSource, ContentDataCompleteness } from "@/types/content-analytics";
import type { ContentAnalyticsEventPayload } from "@/lib/content-analytics/event-taxonomy";

export type RawAnalyticsRecord = {
  idempotencyKey?: string;
  source: ContentAnalyticsSource;
  occurredAt: string;
  contentItemId?: string;
  url?: string;
  metrics?: Record<string, number | null | undefined>;
  dimensions?: Record<string, string | null | undefined>;
  payload?: Partial<ContentAnalyticsEventPayload>;
};

export type NormalizedAnalyticsRecord = {
  idempotencyKey: string;
  source: ContentAnalyticsSource;
  occurredAt: string;
  contentItemId?: string;
  url?: string;
  metrics: {
    pageViews?: number | null;
    sessions?: number | null;
    users?: number | null;
    engagedSessions?: number | null;
    averageEngagementTime?: number | null;
    bounceRate?: number | null;
    impressions?: number | null;
    clicks?: number | null;
    ctr?: number | null;
    averagePosition?: number | null;
    ctaClicks?: number | null;
    formStarts?: number | null;
    formSubmissions?: number | null;
    leads?: number | null;
    qualifiedLeads?: number | null;
    deals?: number | null;
    revenue?: number | null;
    contentCost?: number | null;
  };
  dimensions: Record<string, string>;
  ingestedAt: string;
};

/** Safe division: returns null when denominator is zero or inputs are null/undefined. */
export function safeRate(
  numerator: number | null | undefined,
  denominator: number | null | undefined,
): number | null {
  if (numerator == null || denominator == null || denominator === 0) return null;
  return numerator / denominator;
}

export function safePercent(
  numerator: number | null | undefined,
  denominator: number | null | undefined,
): number | null {
  const rate = safeRate(numerator, denominator);
  return rate == null ? null : rate * 100;
}

export function normalizeAnalyticsRecord(
  record: RawAnalyticsRecord,
  source: ContentAnalyticsSource = record.source,
): NormalizedAnalyticsRecord {
  const key =
    record.idempotencyKey ??
    `${source}:${record.occurredAt}:${record.contentItemId ?? record.url ?? "unknown"}`;

  const rawMetrics = record.metrics ?? {};
  const normalizedMetrics: NormalizedAnalyticsRecord["metrics"] = {};

  for (const [key, value] of Object.entries(rawMetrics)) {
    if (value == null) {
      normalizedMetrics[key as keyof NormalizedAnalyticsRecord["metrics"]] = null;
    } else if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
      normalizedMetrics[key as keyof NormalizedAnalyticsRecord["metrics"]] = value;
    }
  }

  if (
    normalizedMetrics.clicks != null &&
    normalizedMetrics.impressions != null &&
    normalizedMetrics.ctr == null
  ) {
    normalizedMetrics.ctr = safeRate(normalizedMetrics.clicks, normalizedMetrics.impressions);
  }

  const dimensions: Record<string, string> = {};
  for (const [k, v] of Object.entries(record.dimensions ?? {})) {
    if (v != null && v !== "") dimensions[k] = String(v);
  }

  if (record.payload?.clusterId) dimensions.clusterId = record.payload.clusterId;
  if (record.payload?.contentType) dimensions.contentType = record.payload.contentType;
  if (record.payload?.priorityLevel) dimensions.priorityLevel = record.payload.priorityLevel;

  return {
    idempotencyKey: key,
    source,
    occurredAt: record.occurredAt,
    contentItemId: record.contentItemId,
    url: record.url,
    metrics: normalizedMetrics,
    dimensions,
    ingestedAt: new Date().toISOString(),
  };
}

export function mergeAnalyticsSources(
  records: NormalizedAnalyticsRecord[],
): NormalizedAnalyticsRecord[] {
  const grouped = new Map<string, NormalizedAnalyticsRecord>();

  for (const record of records) {
    const mergeKey = record.contentItemId ?? record.url ?? record.idempotencyKey;
    const existing = grouped.get(mergeKey);

    if (!existing) {
      grouped.set(mergeKey, { ...record, metrics: { ...record.metrics } });
      continue;
    }

    const mergedMetrics = { ...existing.metrics };
    for (const [key, value] of Object.entries(record.metrics) as [
      keyof NormalizedAnalyticsRecord["metrics"],
      number | null | undefined,
    ][]) {
      if (value == null) continue;
      const prev = mergedMetrics[key];
      mergedMetrics[key] = prev == null ? value : prev + value;
    }

    grouped.set(mergeKey, {
      ...existing,
      metrics: mergedMetrics,
    });
  }

  return [...grouped.values()];
}

export function calculateDataCompleteness(
  records: NormalizedAnalyticsRecord[],
): ContentDataCompleteness {
  if (records.length === 0) return "none";

  const sources = new Set(records.map((r) => r.source));
  const hasInternal = sources.has("internal") || sources.has("crm");
  const hasSearch =
    sources.has("google-search-console") || sources.has("yandex-webmaster") || sources.has("manual-import");
  const hasExternalTraffic = sources.has("yandex-metrica") || sources.has("google-analytics");

  const metricCount = records.reduce((acc, r) => {
    return acc + Object.values(r.metrics).filter((v) => v != null).length;
  }, 0);

  if (metricCount === 0) return "none";
  if (hasInternal && hasSearch && hasExternalTraffic) return "strong";
  if (hasInternal && (hasSearch || hasExternalTraffic)) return "good";
  if (hasInternal) return "partial";
  return "low";
}

export function validateAnalyticsRecord(record: RawAnalyticsRecord): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!record.source) errors.push("missing source");
  if (!record.occurredAt) errors.push("missing occurredAt");
  else if (Number.isNaN(new Date(record.occurredAt).getTime())) {
    errors.push("invalid occurredAt timestamp");
  }

  for (const [key, value] of Object.entries(record.metrics ?? {})) {
    if (value != null && (value < 0 || !Number.isFinite(value))) {
      errors.push(`invalid metric ${key}: negative or non-finite`);
    }
  }

  const ctr = record.metrics?.ctr;
  if (ctr != null && (ctr < 0 || ctr > 1)) {
    errors.push("ctr out of range (0–1)");
  }

  const sessions = record.metrics?.sessions;
  const leads = record.metrics?.leads;
  if (sessions != null && leads != null && leads > sessions) {
    errors.push("leads exceed sessions");
  }

  return { valid: errors.length === 0, errors };
}
