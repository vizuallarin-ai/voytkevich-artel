import type { ContentAnalyticsPeriod, ContentPerformanceSnapshot } from "@/types/content-analytics";
import { getActiveConfidencePreset } from "@/data/content-analytics-confidence-rules";
import { calculateContentROI } from "@/lib/content-analytics/content-roi-service";
import { getSnapshotConfidence } from "@/lib/content-analytics/content-performance-snapshot-service";

export type ContentWinnerType =
  | "seo"
  | "lead"
  | "qualified-lead"
  | "conversion"
  | "assisted-conversion"
  | "roi"
  | "growth"
  | "local"
  | "distribution";

export type ContentWinner = {
  contentItemId: string;
  url: string;
  types: ContentWinnerType[];
  confidence: "low" | "medium" | "high";
  evidence: string[];
};

export function classifyContentWinner(snapshot: ContentPerformanceSnapshot): ContentWinnerType[] {
  const types: ContentWinnerType[] = [];
  const preset = getActiveConfidencePreset();

  if ((snapshot.search.clicks ?? 0) >= preset.minimumClicks) types.push("seo");
  if ((snapshot.conversions.leads ?? 0) >= preset.minimumLeads) types.push("lead");
  if ((snapshot.conversions.qualifiedLeads ?? 0) >= preset.minimumQualifiedLeads) {
    types.push("qualified-lead");
  }
  if ((snapshot.calculated.conversionRate ?? 0) >= 0.03) types.push("conversion");
  if (calculateContentROI(snapshot) != null && (calculateContentROI(snapshot) ?? 0) > 0) {
    types.push("roi");
  }

  return types;
}

export function calculateWinnerConfidence(snapshot: ContentPerformanceSnapshot): "low" | "medium" | "high" {
  const signal = getSnapshotConfidence(snapshot);
  if (signal === "high-confidence") return "high";
  if (signal === "medium-confidence") return "medium";
  return "low";
}

export function detectContentWinners(
  items: ContentPerformanceSnapshot[],
  _period: ContentAnalyticsPeriod,
): ContentWinner[] {
  const preset = getActiveConfidencePreset();
  const winners: ContentWinner[] = [];

  for (const snapshot of items) {
    const types = classifyContentWinner(snapshot);
    if (types.length === 0) continue;

    const confidence = calculateWinnerConfidence(snapshot);
    if (confidence === "low" && (snapshot.conversions.leads ?? 0) < preset.minimumLeads) {
      continue;
    }

    winners.push({
      contentItemId: snapshot.contentItemId,
      url: snapshot.url,
      types,
      confidence,
      evidence: types.map((t) => `winner-type:${t}`),
    });
  }

  return winners.sort((a, b) => b.types.length - a.types.length);
}

export function findReplicablePatterns(winners: ContentWinner[]): string[] {
  const typeCounts = new Map<ContentWinnerType, number>();
  for (const winner of winners) {
    for (const type of winner.types) {
      typeCounts.set(type, (typeCounts.get(type) ?? 0) + 1);
    }
  }
  return [...typeCounts.entries()]
    .filter(([, count]) => count >= 2)
    .map(([type, count]) => `Паттерн «${type}» встречается у ${count} winners`);
}

export function recommendWinningTopicExpansion(winner: ContentWinner): string[] {
  return [`Рассмотреть расширение темы на основе ${winner.url} (${winner.types.join(", ")})`];
}

export const contentWinnerService = {
  detectContentWinners,
  classifyContentWinner,
  calculateWinnerConfidence,
  findReplicablePatterns,
  recommendWinningTopicExpansion,
};
