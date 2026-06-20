import type { StoredAnalyticsEvent } from "@/types/analytics";
import type { StoredLead } from "@/types/lead";
import { getAnalyticsEvents } from "@/lib/analytics/analytics-storage";
import { getAllLeads } from "@/lib/leads/lead-repository";
import { contentRepository } from "@/lib/content-cms/content-repository";
import { getIngestedRecords, getAnalyticsIngestionSummary } from "@/lib/content-analytics/analytics-ingestion-service";
import { detectAnalyticsAnomalies } from "@/lib/content-analytics/analytics-data-quality";
import { analyticsSourceRegistry } from "@/lib/content-analytics/analytics-source-registry";
import { findDuplicateKeys } from "@/lib/content-analytics/analytics-deduplicator";
import { PII_BLOCKED_PAYLOAD_KEYS } from "@/lib/content-analytics/event-taxonomy";

export type DataQualityIssue = {
  id: string;
  type: string;
  severity: "low" | "medium" | "high";
  message: string;
  source?: string;
  detectedAt: string;
};

export type DataQualityReport = {
  issues: DataQualityIssue[];
  sourceStatus: ReturnType<typeof analyticsSourceRegistry.list>;
  ingestionSummary: ReturnType<typeof getAnalyticsIngestionSummary>;
  completenessBySource: Record<string, "none" | "low" | "partial" | "good" | "strong">;
};

const STAGING_PATTERNS = [/localhost/i, /127\.0\.0\.1/, /staging\./i, /vercel\.app\/preview/i];

function isStagingUrl(url?: string): boolean {
  if (!url) return false;
  return STAGING_PATTERNS.some((p) => p.test(url));
}

function detectBrokenUtm(lead: StoredLead): boolean {
  const utm = lead.analytics.utm;
  if (!utm) return false;
  return Object.values(utm).some((v) => v != null && (v.includes("undefined") || v.includes("{{")));
}

export async function detectMissingContentIds(events: StoredAnalyticsEvent[]): Promise<DataQualityIssue[]> {
  const items = await contentRepository.listContent();
  const knownUrls = new Set(items.map((i) => i.url));
  const issues: DataQualityIssue[] = [];

  for (const event of events) {
    const path = event.page?.path ?? event.page?.currentUrl;
    if (!path) continue;
    if (!knownUrls.has(path) && !items.some((i) => path.includes(i.slug))) {
      issues.push({
        id: `unknown-url:${event.id}`,
        type: "unknown-url",
        severity: "medium",
        message: `Unknown URL in event: ${path}`,
        source: "internal",
        detectedAt: new Date().toISOString(),
      });
    }
  }

  return issues;
}

export async function detectUnattributedLeads(leads: StoredLead[]): Promise<DataQualityIssue[]> {
  return leads
    .filter((l) => !l.isDemo && !l.analytics.traffic?.landingPage && !l.source.currentUrl)
    .map((l) => ({
      id: `unattributed-lead:${l.id}`,
      type: "unattributed-lead",
      severity: "medium",
      message: `Lead ${l.id} without attribution context`,
      source: "crm",
      detectedAt: new Date().toISOString(),
    }));
}

export function detectStagingTraffic(events: StoredAnalyticsEvent[]): DataQualityIssue[] {
  return events
    .filter((e) => isStagingUrl(e.page?.currentUrl ?? e.page?.path))
    .map((e) => ({
      id: `staging-traffic:${e.id}`,
      type: "staging-traffic",
      severity: "high",
      message: "Staging traffic detected in analytics events",
      source: "internal",
      detectedAt: new Date().toISOString(),
    }));
}

export function detectPiiInPayload(payload: Record<string, unknown>): DataQualityIssue[] {
  const issues: DataQualityIssue[] = [];
  for (const key of Object.keys(payload)) {
    if (PII_BLOCKED_PAYLOAD_KEYS.has(key)) {
      issues.push({
        id: `pii:${key}`,
        type: "pii-in-payload",
        severity: "high",
        message: `PII key detected in payload: ${key}`,
        detectedAt: new Date().toISOString(),
      });
    }
  }
  return issues;
}

export async function runDataQualityAudit(): Promise<DataQualityReport> {
  const [events, leads] = await Promise.all([getAnalyticsEvents(), getAllLeads(true)]);
  const ingested = getIngestedRecords();
  const anomalies = detectAnalyticsAnomalies(ingested);
  const duplicateKeys = findDuplicateKeys(ingested);

  const issues: DataQualityIssue[] = [];

  issues.push(
    ...anomalies.map((a) => ({
      id: `anomaly:${a.recordKey ?? a.type}`,
      type: a.type,
      severity: a.severity,
      message: a.message,
      detectedAt: new Date().toISOString(),
    })),
  );

  if (duplicateKeys.length > 0) {
    issues.push({
      id: "duplicate-imports",
      type: "duplicate-imports",
      severity: "medium",
      message: `${duplicateKeys.length} duplicate idempotency keys in ingestion store`,
      detectedAt: new Date().toISOString(),
    });
  }

  issues.push(...(await detectMissingContentIds(events)));
  issues.push(...(await detectUnattributedLeads(leads)));
  issues.push(...detectStagingTraffic(events));

  for (const lead of leads) {
    if (detectBrokenUtm(lead)) {
      issues.push({
        id: `broken-utm:${lead.id}`,
        type: "broken-utm",
        severity: "low",
        message: `Broken UTM on lead ${lead.id}`,
        source: "crm",
        detectedAt: new Date().toISOString(),
      });
    }
  }

  const ingestionSummary = getAnalyticsIngestionSummary();
  const completenessBySource: DataQualityReport["completenessBySource"] = {};
  for (const [source, count] of Object.entries(ingestionSummary.bySource)) {
    completenessBySource[source] = count > 0 ? "partial" : "none";
  }

  return {
    issues,
    sourceStatus: analyticsSourceRegistry.list(),
    ingestionSummary,
    completenessBySource,
  };
}

export const dataQualityService = {
  runDataQualityAudit,
  detectMissingContentIds,
  detectUnattributedLeads,
  detectStagingTraffic,
  detectPiiInPayload,
  detectBrokenUtm,
};
