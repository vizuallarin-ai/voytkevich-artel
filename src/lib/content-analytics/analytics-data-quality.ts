import type { NormalizedAnalyticsRecord } from "@/lib/content-analytics/analytics-normalizer";
import { calculateDataCompleteness } from "@/lib/content-analytics/analytics-normalizer";

export type AnalyticsAnomaly = {
  type:
    | "negative-metric"
    | "ctr-out-of-range"
    | "conversions-exceed-sessions"
    | "impossible-timestamp"
    | "spike"
    | "missing-content-id";
  severity: "low" | "medium" | "high";
  message: string;
  recordKey?: string;
};

export function detectAnalyticsAnomalies(records: NormalizedAnalyticsRecord[]): AnalyticsAnomaly[] {
  const anomalies: AnalyticsAnomaly[] = [];

  for (const record of records) {
    if (!record.contentItemId && !record.url) {
      anomalies.push({
        type: "missing-content-id",
        severity: "medium",
        message: "Record without contentItemId or url",
        recordKey: record.idempotencyKey,
      });
    }

    if (Number.isNaN(new Date(record.occurredAt).getTime())) {
      anomalies.push({
        type: "impossible-timestamp",
        severity: "high",
        message: "Invalid occurredAt timestamp",
        recordKey: record.idempotencyKey,
      });
    }

    for (const [key, value] of Object.entries(record.metrics)) {
      if (value != null && value < 0) {
        anomalies.push({
          type: "negative-metric",
          severity: "high",
          message: `Negative ${key}`,
          recordKey: record.idempotencyKey,
        });
      }
    }

    const ctr = record.metrics.ctr;
    if (ctr != null && (ctr < 0 || ctr > 1)) {
      anomalies.push({
        type: "ctr-out-of-range",
        severity: "high",
        message: "CTR outside 0–1 range",
        recordKey: record.idempotencyKey,
      });
    }

    const sessions = record.metrics.sessions;
    const leads = record.metrics.leads;
    if (sessions != null && leads != null && leads > sessions) {
      anomalies.push({
        type: "conversions-exceed-sessions",
        severity: "medium",
        message: "Leads exceed sessions",
        recordKey: record.idempotencyKey,
      });
    }
  }

  return anomalies;
}

export function assessRecordQuality(record: NormalizedAnalyticsRecord): {
  completeness: ReturnType<typeof calculateDataCompleteness>;
  anomalyCount: number;
  isUsable: boolean;
} {
  const anomalies = detectAnalyticsAnomalies([record]);
  const completeness = calculateDataCompleteness([record]);
  const highSeverity = anomalies.filter((a) => a.severity === "high").length;

  return {
    completeness,
    anomalyCount: anomalies.length,
    isUsable: highSeverity === 0 && completeness !== "none",
  };
}

export const analyticsDataQuality = {
  detectAnomalies: detectAnalyticsAnomalies,
  assessRecord: assessRecordQuality,
};
