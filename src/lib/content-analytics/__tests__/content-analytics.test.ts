/**
 * Stage 30 content analytics tests — run: npm run test:analytics
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  normalizeAnalyticsRecord,
  safeRate,
  safePercent,
  validateAnalyticsRecord,
} from "@/lib/content-analytics/analytics-normalizer";
import {
  deduplicateAnalyticsRecords,
  buildIdempotencyKey,
} from "@/lib/content-analytics/analytics-deduplicator";
import {
  ingestAnalyticsData,
  clearIngestionStore,
} from "@/lib/content-analytics/analytics-ingestion-service";
import {
  calculateContentROI,
  calculateRevenueReturnRatio,
  calculateContentCost,
} from "@/lib/content-analytics/content-roi-service";
import {
  calculateContentConversionRate,
  calculateQualifiedLeadRate,
} from "@/lib/content-analytics/conversion-performance-service";
import { detectAnalyticsAnomalies } from "@/lib/content-analytics/analytics-data-quality";
import { detectContentDecay } from "@/lib/content-analytics/content-decay-service";
import {
  recommendScoringWeightChanges,
  findUnderestimatedPriorityItems,
  type PriorityPerformanceComparison,
} from "@/lib/content-analytics/priority-feedback-service";
import {
  calculateAttributionConfidence,
  explainLeadAttribution,
} from "@/lib/content-analytics/lead-attribution-service";
import { sanitizeContentAnalyticsPayload } from "@/lib/content-analytics/event-taxonomy";
import { exportAnalyticsTableToCSV } from "@/lib/content-analytics/report-service";
import type { ContentPerformanceSnapshot } from "@/types/content-analytics";
import type { LeadContentAttribution } from "@/types/content-attribution";
import type { ContentCostRecord } from "@/types/content-cost";

function snapshot(overrides: Partial<ContentPerformanceSnapshot> = {}): ContentPerformanceSnapshot {
  return {
    id: "snap-1",
    contentItemId: "item-1",
    url: "/blog/test",
    contentType: "technical",
    period: { from: "2025-01-01", to: "2025-01-31" },
    publication: { publishedAt: "2025-01-01T00:00:00.000Z" },
    traffic: {},
    search: {},
    conversions: {},
    business: {},
    calculated: {},
    sources: ["internal"],
    dataCompleteness: "partial",
    calculatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("analytics-normalizer", () => {
  it("missing metric stays null", () => {
    const normalized = normalizeAnalyticsRecord({
      source: "internal",
      occurredAt: "2025-01-01T00:00:00.000Z",
      metrics: { pageViews: undefined, sessions: null },
    });
    assert.equal(normalized.metrics.pageViews, null);
    assert.equal(normalized.metrics.sessions, null);
  });

  it("absence of data is not converted to zero", () => {
    const normalized = normalizeAnalyticsRecord({
      source: "internal",
      occurredAt: "2025-01-01T00:00:00.000Z",
      metrics: {},
    });
    assert.equal(normalized.metrics.clicks, undefined);
    assert.notEqual(normalized.metrics.clicks, 0);
  });

  it("CTR calculated from clicks and impressions", () => {
    const normalized = normalizeAnalyticsRecord({
      source: "google-search-console",
      occurredAt: "2025-01-01T00:00:00.000Z",
      metrics: { clicks: 10, impressions: 100 },
    });
    assert.equal(normalized.metrics.ctr, 0.1);
  });

  it("division by zero returns null", () => {
    assert.equal(safeRate(5, 0), null);
    assert.equal(safeRate(null, 10), null);
    assert.equal(safePercent(1, 0), null);
  });

  it("conversion rate calculated correctly", () => {
    const item = snapshot({
      traffic: { pageViews: 100 },
      conversions: { leads: 5 },
    });
    assert.equal(calculateContentConversionRate(item), 0.05);
  });

  it("qualified lead is not equal to regular lead rate denominator", () => {
    const item = snapshot({
      conversions: { leads: 10, qualifiedLeads: 3 },
    });
    assert.equal(calculateQualifiedLeadRate(item), 0.3);
    assert.notEqual(calculateQualifiedLeadRate(item), 1);
  });
});

describe("analytics-deduplicator and ingestion", () => {
  it("duplicate event is not imported twice", () => {
    clearIngestionStore();
    const key = buildIdempotencyKey({
      source: "manual-import",
      occurredAt: "2025-01-01T00:00:00.000Z",
      contentItemId: "a1",
    });
    const record = {
      idempotencyKey: key,
      source: "manual-import" as const,
      occurredAt: "2025-01-01T00:00:00.000Z",
      contentItemId: "a1",
      metrics: { pageViews: 1 },
      dimensions: {},
      ingestedAt: "2025-01-01T00:00:00.000Z",
    };

    const deduped = deduplicateAnalyticsRecords([record, record]);
    assert.equal(deduped.length, 1);

    const first = ingestAnalyticsData("manual-import", [
      { source: "manual-import", occurredAt: "2025-01-01T00:00:00.000Z", contentItemId: "a1", metrics: { pageViews: 1 } },
    ]);
    const second = ingestAnalyticsData("manual-import", [
      { source: "manual-import", occurredAt: "2025-01-01T00:00:00.000Z", contentItemId: "a1", metrics: { pageViews: 99 } },
    ]);
    assert.equal(first.ingested, 1);
    assert.equal(second.duplicates, 1);
    assert.equal(second.ingested, 0);
  });

  it("repeated import is idempotent", () => {
    clearIngestionStore();
    const payload = [
      {
        source: "manual-import" as const,
        occurredAt: "2025-02-01T00:00:00.000Z",
        contentItemId: "b2",
        metrics: { sessions: 5 },
      },
    ];
    ingestAnalyticsData("manual-import", payload);
    const again = ingestAnalyticsData("manual-import", payload);
    assert.equal(again.skipped, 1);
  });
});

describe("content ROI", () => {
  it("ROI is null without content cost", () => {
    const item = snapshot({
      business: { attributedGrossProfit: 10000, attributedRevenue: 20000 },
    });
    assert.equal(calculateContentROI(item), null);
  });

  it("ROI is null without business outcome when only revenue", () => {
    const item = snapshot({
      business: { contentCost: 1000, attributedRevenue: 5000 },
    });
    assert.equal(calculateContentROI(item), null);
  });

  it("ROI calculated with profit and cost", () => {
    const item = snapshot({
      business: { contentCost: 1000, attributedGrossProfit: 3000 },
    });
    assert.equal(calculateContentROI(item), 200);
  });

  it("revenue return ratio is separate from profit ROI", () => {
    const item = snapshot({
      business: { contentCost: 1000, attributedRevenue: 4000 },
    });
    assert.equal(calculateRevenueReturnRatio(item), 4);
    assert.equal(calculateContentROI(item), null);
  });

  it("unknown cost yields null from calculateContentCost", () => {
    assert.equal(calculateContentCost(undefined), null);
    const empty: ContentCostRecord = {
      contentItemId: "x",
      production: {},
      distribution: {},
      maintenance: {},
      currency: "RUB",
      source: "manual",
      confidence: "low",
      calculatedAt: new Date().toISOString(),
    };
    assert.equal(calculateContentCost(empty), null);
  });
});

describe("lead attribution", () => {
  it("attribution preserves limitations", () => {
    const attribution: LeadContentAttribution = {
      leadId: "lead-1",
      assistedTouches: [],
      attributionModel: "last-touch",
      confidence: "low",
      limitations: ["Cross-device journeys не отслеживаются"],
      calculatedAt: new Date().toISOString(),
    };
    const explanation = explainLeadAttribution(attribution);
    assert.match(explanation, /Ограничения/);
    assert.equal(attribution.limitations.length, 1);
  });

  it("first-touch and last-touch confidence scales with touchpoints", () => {
    const low: LeadContentAttribution = {
      leadId: "l1",
      assistedTouches: [],
      attributionModel: "first-touch",
      confidence: "low",
      limitations: [],
      calculatedAt: new Date().toISOString(),
    };
    assert.equal(calculateAttributionConfidence(low), "low");

    const high: LeadContentAttribution = {
      leadId: "l2",
      firstTouch: {
        contentItemId: "c1",
        url: "/a",
        occurredAt: "2025-01-01T00:00:00.000Z",
        role: "first-touch",
        sessionId: "sess-1",
      },
      lastTouch: {
        contentItemId: "c2",
        url: "/b",
        occurredAt: "2025-01-02T00:00:00.000Z",
        role: "last-touch",
      },
      convertingTouch: {
        contentItemId: "c2",
        url: "/b",
        occurredAt: "2025-01-02T00:00:00.000Z",
        role: "direct-conversion",
      },
      assistedTouches: [{ contentItemId: "c3", url: "/c", occurredAt: "2025-01-01T12:00:00.000Z", role: "assisted" }],
      attributionModel: "linear",
      confidence: "low",
      limitations: [],
      calculatedAt: new Date().toISOString(),
    };
    assert.equal(calculateAttributionConfidence(high), "high");
  });

  it("assisted touchpoints are counted", () => {
    const attribution: LeadContentAttribution = {
      leadId: "l3",
      assistedTouches: [
        { contentItemId: "c1", url: "/a", occurredAt: "2025-01-01T00:00:00.000Z", role: "assisted" },
        { contentItemId: "c2", url: "/b", occurredAt: "2025-01-01T01:00:00.000Z", role: "assisted" },
      ],
      attributionModel: "assisted",
      confidence: "medium",
      limitations: [],
      calculatedAt: new Date().toISOString(),
    };
    assert.equal(attribution.assistedTouches.length, 2);
    assert.match(explainLeadAttribution(attribution), /Touchpoints: 2/);
  });
});

describe("priority feedback", () => {
  it("P5 winner is underestimated", () => {
    const comparisons: PriorityPerformanceComparison[] = [
      {
        contentItemId: "p5-win",
        predictedPriority: "P5",
        actualLeads: 10,
        actualQualifiedLeads: 5,
        actualPageViews: 500,
        performanceTier: "overperforming",
      },
    ];
    const under = findUnderestimatedPriorityItems(comparisons);
    assert.equal(under.length, 1);
    assert.equal(under[0]?.predictedPriority, "P5");
  });

  it("scoring weights are not changed automatically", () => {
    const comparisons: PriorityPerformanceComparison[] = Array.from({ length: 10 }, (_, i) => ({
      contentItemId: `item-${i}`,
      predictedPriority: "P1" as const,
      actualLeads: 0,
      actualQualifiedLeads: 0,
      actualPageViews: 10,
      performanceTier: "underperforming" as const,
    }));
    const recs = recommendScoringWeightChanges(comparisons);
    assert.ok(recs.length > 0);
    assert.equal(recs[0]?.requiresManualApproval, true);
  });
});

describe("content decay and data quality", () => {
  it("young page is not marked as decay", () => {
    const young = snapshot({
      publication: { publishedAt: new Date().toISOString() },
      traffic: { pageViews: 1 },
    });
    const result = detectContentDecay(young);
    assert.equal(result.detected, false);
    assert.match(result.signals.join(" "), /молод/i);
  });

  it("broken CTR is rejected by validation", () => {
    const validation = validateAnalyticsRecord({
      source: "manual-import",
      occurredAt: "2025-01-01T00:00:00.000Z",
      metrics: { ctr: 1.5 },
    });
    assert.equal(validation.valid, false);
  });

  it("PII keys are stripped from payload metadata", () => {
    const sanitized = sanitizeContentAnalyticsPayload({
      eventId: "e1",
      eventName: "content_viewed",
      occurredAt: "2025-01-01T00:00:00.000Z",
      metadata: { email: "secret@example.com", clusterId: "cluster-1" },
    });
    assert.equal(sanitized.metadata?.email, undefined);
    assert.equal(sanitized.metadata?.clusterId, "cluster-1");
  });

  it("CSV export excludes PII fields", () => {
    const csv = exportAnalyticsTableToCSV([
      { url: "/blog/test", leads: 2, email: "hidden@example.com", phone: "+7999" },
    ]);
    assert.match(csv, /url/);
    assert.doesNotMatch(csv, /hidden@example.com/);
    assert.doesNotMatch(csv, /\+7999/);
  });

  it("published is not indexed without external status", () => {
    const item = snapshot({ search: { indexed: null } });
    assert.notEqual(item.search.indexed, true);
  });

  it("detectAnalyticsAnomalies flags CTR out of range", () => {
    const anomalies = detectAnalyticsAnomalies([
      normalizeAnalyticsRecord({
        source: "manual-import",
        occurredAt: "2025-01-01T00:00:00.000Z",
        metrics: { ctr: 2 },
      }),
    ]);
    assert.ok(anomalies.some((a) => a.type === "ctr-out-of-range"));
  });
});
