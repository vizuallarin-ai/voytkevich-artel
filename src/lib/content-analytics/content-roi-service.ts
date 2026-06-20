import type { ContentCostRecord } from "@/types/content-cost";
import type { ContentPerformanceSnapshot } from "@/types/content-analytics";
import { safeRate } from "@/lib/content-analytics/analytics-normalizer";

const costStore = new Map<string, ContentCostRecord>();

export function saveContentCost(record: ContentCostRecord): void {
  costStore.set(record.contentItemId, record);
}

export function getContentCostRecord(contentItemId: string): ContentCostRecord | undefined {
  return costStore.get(contentItemId);
}

export function calculateContentCost(item: ContentCostRecord | undefined): number | null {
  if (!item) return null;

  const parts = [
    ...Object.values(item.production),
    ...Object.values(item.distribution),
    ...Object.values(item.maintenance),
  ].filter((v): v is number => v != null && v >= 0);

  if (parts.length === 0) return null;
  return parts.reduce((a, b) => a + b, 0);
}

export function calculateAttributedRevenue(
  snapshot: ContentPerformanceSnapshot,
  _model: "last-touch" | "first-touch" = "last-touch",
): number | null {
  return snapshot.business.attributedRevenue ?? null;
}

export function calculateContentROI(snapshot: ContentPerformanceSnapshot): number | null {
  const cost = snapshot.business.contentCost ?? calculateContentCost(getContentCostRecord(snapshot.contentItemId));
  const profit = snapshot.business.attributedGrossProfit;
  const revenue = snapshot.business.attributedRevenue;

  if (cost == null || cost === 0) return null;

  if (profit != null) {
    return safeRate(profit - cost, cost)! * 100;
  }

  if (revenue != null) {
    return null;
  }

  return null;
}

export function calculateRevenueReturnRatio(snapshot: ContentPerformanceSnapshot): number | null {
  const cost = snapshot.business.contentCost ?? calculateContentCost(getContentCostRecord(snapshot.contentItemId));
  const revenue = snapshot.business.attributedRevenue;

  if (cost == null || cost === 0 || revenue == null) return null;
  return safeRate(revenue, cost);
}

export function calculateCostPerLead(snapshot: ContentPerformanceSnapshot): number | null {
  const cost = snapshot.business.contentCost ?? calculateContentCost(getContentCostRecord(snapshot.contentItemId));
  return safeRate(cost, snapshot.conversions.leads);
}

export function calculateCostPerQualifiedLead(snapshot: ContentPerformanceSnapshot): number | null {
  const cost = snapshot.business.contentCost ?? calculateContentCost(getContentCostRecord(snapshot.contentItemId));
  return safeRate(cost, snapshot.conversions.qualifiedLeads);
}

export function calculateCostPerDeal(snapshot: ContentPerformanceSnapshot): number | null {
  const cost = snapshot.business.contentCost ?? calculateContentCost(getContentCostRecord(snapshot.contentItemId));
  return safeRate(cost, snapshot.conversions.deals);
}

export function calculatePayback(snapshot: ContentPerformanceSnapshot): number | null {
  const roi = calculateContentROI(snapshot);
  if (roi == null || roi <= 0) return null;
  return Math.ceil(365 / (roi / 100));
}

export function compareROIByContentType(
  items: ContentPerformanceSnapshot[],
): Record<string, { roi: number | null; revenueReturnRatio: number | null; count: number }> {
  const grouped: Record<string, { roi: number | null; revenueReturnRatio: number | null; count: number }> = {};

  for (const item of items) {
    if (!grouped[item.contentType]) {
      grouped[item.contentType] = { roi: null, revenueReturnRatio: null, count: 0 };
    }
    grouped[item.contentType].count += 1;
    const roi = calculateContentROI(item);
    const ratio = calculateRevenueReturnRatio(item);
    if (roi != null) grouped[item.contentType].roi = roi;
    if (ratio != null) grouped[item.contentType].revenueReturnRatio = ratio;
  }

  return grouped;
}

export function compareROIByCluster(
  items: ContentPerformanceSnapshot[],
): Record<string, { roi: number | null; count: number }> {
  const grouped: Record<string, { roi: number | null; count: number }> = {};
  for (const item of items) {
    const key = item.contentItemId;
    if (!grouped[key]) grouped[key] = { roi: null, count: 0 };
    grouped[key].count += 1;
    const roi = calculateContentROI(item);
    if (roi != null) grouped[key].roi = roi;
  }
  return grouped;
}

export function compareROIByPriority(
  items: ContentPerformanceSnapshot[],
  priorityMap: Record<string, string>,
): Record<string, { roi: number | null; count: number }> {
  const grouped: Record<string, { roi: number | null; count: number }> = {};
  for (const item of items) {
    const key = priorityMap[item.contentItemId] ?? "unknown";
    if (!grouped[key]) grouped[key] = { roi: null, count: 0 };
    grouped[key].count += 1;
    const roi = calculateContentROI(item);
    if (roi != null) grouped[key].roi = roi;
  }
  return grouped;
}

export function explainROILimitations(snapshot: ContentPerformanceSnapshot): string[] {
  const limitations: string[] = [];
  const cost = calculateContentCost(getContentCostRecord(snapshot.contentItemId));

  if (cost == null) {
    limitations.push("ROI недоступен: стоимость контента неизвестна");
  }

  if (snapshot.business.attributedRevenue == null && snapshot.business.attributedGrossProfit == null) {
    limitations.push("Business outcome недоступен: revenue/profit null");
  }

  if (snapshot.business.attributedRevenue != null && snapshot.business.attributedGrossProfit == null) {
    limitations.push("Доступна только выручка — используйте revenue return ratio, не profit ROI");
  }

  return limitations;
}

export const contentRoiService = {
  saveContentCost,
  getContentCostRecord,
  calculateContentCost,
  calculateAttributedRevenue,
  calculateContentROI,
  calculateRevenueReturnRatio,
  calculateCostPerLead,
  calculateCostPerQualifiedLead,
  calculateCostPerDeal,
  calculatePayback,
  compareROIByContentType,
  compareROIByCluster,
  compareROIByPriority,
  explainROILimitations,
};
