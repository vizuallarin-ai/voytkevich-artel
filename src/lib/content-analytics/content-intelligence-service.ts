import { randomUUID } from "crypto";
import type { ContentAnalyticsPeriod } from "@/types/content-analytics";
import { buildContentPerformanceSnapshots } from "@/lib/content-analytics/content-performance-snapshot-service";
import { contentWinnerService } from "@/lib/content-analytics/content-winner-service";
import { contentUnderperformanceService } from "@/lib/content-analytics/content-underperformance-service";
import { contentUpdateRecommender } from "@/lib/content-analytics/content-update-recommender";
import { priorityFeedbackService } from "@/lib/content-analytics/priority-feedback-service";
import { calendarFeedbackService } from "@/lib/content-analytics/calendar-feedback-service";
import { distributionPerformanceService } from "@/lib/content-analytics/distribution-performance-service";
import { clusterPerformanceService } from "@/lib/content-analytics/cluster-performance-service";

export type ContentRecommendation = {
  id: string;

  type:
    | "create"
    | "update"
    | "expand"
    | "consolidate"
    | "promote"
    | "investigate"
    | "wait"
    | "technical-fix";

  contentItemId?: string;
  clusterId?: string;

  title: string;
  explanation: string;
  evidence: string[];

  expectedImpact: "low" | "medium" | "high";
  effort: "low" | "medium" | "high";
  confidence: "low" | "medium" | "high";

  requiresHumanReview: boolean;
  createdAt: string;
};

function rec(
  partial: Omit<ContentRecommendation, "id" | "requiresHumanReview" | "createdAt">,
): ContentRecommendation {
  return {
    ...partial,
    id: randomUUID(),
    requiresHumanReview: true,
    createdAt: new Date().toISOString(),
  };
}

export async function generateContentInsights(period: ContentAnalyticsPeriod): Promise<ContentRecommendation[]> {
  const snapshots = await buildContentPerformanceSnapshots(period);
  const recommendations: ContentRecommendation[] = [];

  const winners = contentWinnerService.detectContentWinners(snapshots, period);
  for (const winner of winners.slice(0, 5)) {
    recommendations.push(
      rec({
        type: "promote",
        contentItemId: winner.contentItemId,
        title: `Promote winning content: ${winner.url}`,
        explanation: `Winner types: ${winner.types.join(", ")}`,
        evidence: winner.evidence,
        expectedImpact: "high",
        effort: "low",
        confidence: winner.confidence,
      }),
    );
  }

  for (const snapshot of snapshots.slice(0, 20)) {
    const under = contentUnderperformanceService.classifyUnderperformance(snapshot);
    if (under.category === "too-early" || under.category === "unknown") continue;
    recommendations.push(
      rec({
        type: under.category === "not-indexed" ? "technical-fix" : "investigate",
        contentItemId: snapshot.contentItemId,
        title: `Investigate: ${under.category}`,
        explanation: under.reasons.join("; "),
        evidence: under.reasons,
        expectedImpact: "medium",
        effort: "medium",
        confidence: under.confidence,
      }),
    );
  }

  return recommendations;
}

export async function recommendTopicsToCreate(period: ContentAnalyticsPeriod): Promise<ContentRecommendation[]> {
  const clusters = await clusterPerformanceService.compareClusters(period);
  const weak = clusterPerformanceService.findWeakClusters(clusters);
  return weak.map((c) =>
    rec({
      type: "create",
      clusterId: c.clusterId,
      title: `Expand cluster ${c.clusterId}`,
      explanation: "Cluster has pages but weak lead performance",
      evidence: [`pages:${c.pageCount}`, `leads:${c.totalLeads ?? 0}`],
      expectedImpact: "medium",
      effort: "high",
      confidence: "low",
    }),
  );
}

export async function recommendContentToUpdate(period: ContentAnalyticsPeriod): Promise<ContentRecommendation[]> {
  const snapshots = await buildContentPerformanceSnapshots(period);
  const updates = contentUpdateRecommender.prioritizeContentUpdates(snapshots);
  return updates.map((u) =>
    rec({
      type: "update",
      contentItemId: u.contentItemId,
      title: `Update ${u.url}`,
      explanation: u.explanation,
      evidence: u.actions,
      expectedImpact: u.potential,
      effort: u.effort,
      confidence: "medium",
    }),
  );
}

export async function recommendContentToConsolidate(
  period: ContentAnalyticsPeriod,
): Promise<ContentRecommendation[]> {
  const clusters = await clusterPerformanceService.compareClusters(period);
  const recommendations: ContentRecommendation[] = [];

  for (const cluster of clusters) {
    const actions = await clusterPerformanceService.recommendClusterConsolidation(cluster.clusterId);
    for (const action of actions) {
      recommendations.push(
        rec({
          type: "consolidate",
          clusterId: cluster.clusterId,
          title: action,
          explanation: action,
          evidence: [`cluster:${cluster.clusterId}`],
          expectedImpact: "medium",
          effort: "high",
          confidence: "low",
        }),
      );
    }
  }

  return recommendations;
}

export async function recommendContentToPromote(period: ContentAnalyticsPeriod): Promise<ContentRecommendation[]> {
  const snapshots = await buildContentPerformanceSnapshots(period);
  const winners = contentWinnerService.detectContentWinners(snapshots, period);
  return winners.map((w) =>
    rec({
      type: "promote",
      contentItemId: w.contentItemId,
      title: `Promote ${w.url}`,
      explanation: `Winner: ${w.types.join(", ")}`,
      evidence: w.evidence,
      expectedImpact: "high",
      effort: "low",
      confidence: w.confidence,
    }),
  );
}

export async function recommendContentToInvestigate(
  period: ContentAnalyticsPeriod,
): Promise<ContentRecommendation[]> {
  return generateContentInsights(period);
}

export async function recommendPriorityAdjustments(
  period: ContentAnalyticsPeriod,
): Promise<ContentRecommendation[]> {
  const snapshots = await buildContentPerformanceSnapshots(period);
  const comparisons = await priorityFeedbackService.comparePriorityWithPerformance(snapshots);
  const report = priorityFeedbackService.buildPriorityFeedbackReport(comparisons);

  return report.recommendations.map((r) =>
    rec({
      type: "investigate",
      title: `Review scoring weight: ${r.factor}`,
      explanation: r.rationale,
      evidence: [
        `current:${r.currentWeight}`,
        `suggested:${r.suggestedWeight}`,
        `sample:${r.sampleSize}`,
      ],
      expectedImpact: r.expectedImpact,
      effort: "medium",
      confidence: r.confidence,
    }),
  );
}

export async function recommendCalendarAdjustments(
  period: ContentAnalyticsPeriod,
): Promise<ContentRecommendation[]> {
  const adjustments = await calendarFeedbackService.recommendCalendarAdjustments(period);
  const recommendations: ContentRecommendation[] = [];

  for (const window of adjustments.publicationWindows) {
    recommendations.push(
      rec({
        type: "investigate",
        title: "Calendar window suggestion",
        explanation: window.rationale,
        evidence: [`day:${window.dayOfWeek ?? "n/a"}`, `hour:${window.hour ?? "n/a"}`],
        expectedImpact: "low",
        effort: "low",
        confidence: window.confidence,
      }),
    );
  }

  for (const bottleneck of adjustments.bottlenecks) {
    recommendations.push(
      rec({
        type: "technical-fix",
        title: `Calendar bottleneck: ${bottleneck}`,
        explanation: bottleneck,
        evidence: [bottleneck],
        expectedImpact: "medium",
        effort: "medium",
        confidence: "medium",
      }),
    );
  }

  return recommendations;
}

export async function recommendDistributionAdjustments(
  period: ContentAnalyticsPeriod,
): Promise<ContentRecommendation[]> {
  const channels = await distributionPerformanceService.compareDistributionChannels(period);
  const lowQuality = distributionPerformanceService.findLowCTRHighQualityChannels(channels);

  return lowQuality.map((ch) =>
    rec({
      type: "promote",
      title: `Invest in channel ${ch.channel}`,
      explanation: "Low CTR but high qualified lead quality",
      evidence: [`qualified:${ch.qualifiedLeads ?? 0}`],
      expectedImpact: "medium",
      effort: "low",
      confidence: "low",
    }),
  );
}

export const contentIntelligenceService = {
  generateContentInsights,
  recommendTopicsToCreate,
  recommendContentToUpdate,
  recommendContentToConsolidate,
  recommendContentToPromote,
  recommendContentToInvestigate,
  recommendPriorityAdjustments,
  recommendCalendarAdjustments,
  recommendDistributionAdjustments,
};
