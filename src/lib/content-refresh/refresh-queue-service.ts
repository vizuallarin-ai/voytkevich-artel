import { randomUUID } from "crypto";
import type { CMSContentItem } from "@/types/content-cms";
import type {
  ContentRefreshCandidate,
  ContentRefreshReason,
  ContentRefreshStatus,
} from "@/types/content-refresh";
import type { ContentPerformanceSnapshot } from "@/types/content-analytics";
import { contentUpdateRecommender } from "@/lib/content-analytics/content-update-recommender";
import { contentDecayService } from "@/lib/content-analytics/content-decay-service";
import { cmsPriorityIntegration } from "@/lib/content-prioritization/cms-priority-integration";
import { refreshSignalValidator } from "@/lib/content-refresh/refresh-signal-validator";
import { refreshStore } from "@/lib/content-refresh/refresh-store";
import { refreshAnalytics } from "@/lib/content-refresh/refresh-analytics";

export type RefreshQueueAnalytics = {
  snapshots: ContentPerformanceSnapshot[];
  previousSnapshots?: ContentPerformanceSnapshot[];
  period?: ContentPerformanceSnapshot["period"];
};

export type RefreshPriorityContext = {
  contentItem?: CMSContentItem;
  snapshot?: ContentPerformanceSnapshot;
  previousSnapshot?: ContentPerformanceSnapshot;
};

const ACTION_TO_REASON: Partial<Record<string, ContentRefreshReason>> = {
  "update-outdated-data": "outdated-information",
  "add-expert-block": "missing-expertise",
  "add-faq": "thin-content",
  "add-cta": "conversion-decline",
  "improve-internal-links": "weak-internal-linking",
  "resolve-cannibalization": "cannibalization",
  "fix-canonical": "technical-seo-issue",
  "update-title": "metadata-opportunity",
  "update-description": "metadata-opportunity",
  "strengthen-intent": "weak-search-intent-match",
  "add-visuals": "visual-outdated",
  "restructure": "thin-content",
  "merge-pages": "cannibalization",
  "expert-review": "missing-expertise",
};

function pctChange(current?: number | null, previous?: number | null): number | null {
  if (current == null || previous == null || previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

function mapRecommendationToCandidate(
  item: CMSContentItem,
  snapshot: ContentPerformanceSnapshot,
  previous?: ContentPerformanceSnapshot,
): ContentRefreshCandidate {
  const recommendation = contentUpdateRecommender.recommendContentUpdate(snapshot, {
    previousSnapshot: previous,
    hasCannibalizationRisk: item.seo.cannibalizationRisk === "high",
  });

  const reasons: ContentRefreshReason[] = [];
  for (const action of recommendation.actions) {
    const reason = ACTION_TO_REASON[action];
    if (reason && !reasons.includes(reason)) reasons.push(reason);
  }

  const decay = previous
    ? contentDecayService.detectContentDecay(snapshot, previous)
    : null;
  if (decay?.detected && !reasons.includes("content-decay")) {
    reasons.push("content-decay");
  }

  if (
    (snapshot.search.impressions ?? 0) > 100 &&
    (snapshot.search.ctr ?? 0) < 0.02 &&
    !reasons.includes("high-impressions-low-ctr")
  ) {
    reasons.push("high-impressions-low-ctr");
  }

  if (
    (snapshot.traffic.pageViews ?? 0) > 50 &&
    (snapshot.conversions.leads ?? 0) === 0 &&
    !reasons.includes("high-traffic-low-conversion")
  ) {
    reasons.push("high-traffic-low-conversion");
  }

  if (reasons.length === 0) reasons.push("manual-request");

  const evidence: ContentRefreshCandidate["evidence"] = [];
  if (snapshot.search.impressions != null) {
    evidence.push({
      metric: "search.impressions",
      currentValue: snapshot.search.impressions,
      previousValue: previous?.search.impressions ?? null,
      changePercent: pctChange(snapshot.search.impressions, previous?.search.impressions),
      source: "analytics",
      period: snapshot.period,
    });
  }
  if (snapshot.search.ctr != null) {
    evidence.push({
      metric: "search.ctr",
      currentValue: snapshot.search.ctr,
      previousValue: previous?.search.ctr ?? null,
      changePercent: pctChange(snapshot.search.ctr, previous?.search.ctr),
      source: "analytics",
      period: snapshot.period,
    });
  }
  if (snapshot.conversions.leads != null) {
    evidence.push({
      metric: "conversions.leads",
      currentValue: snapshot.conversions.leads,
      previousValue: previous?.conversions.leads ?? null,
      changePercent: pctChange(snapshot.conversions.leads, previous?.conversions.leads),
      source: "analytics",
      period: snapshot.period,
    });
  }

  const candidate: ContentRefreshCandidate = {
    id: randomUUID(),
    contentItemId: item.id,
    url: item.url,
    reasons,
    status: "detected",
    priority: { score: 0, level: "medium", confidence: "low" },
    evidence,
    risks: [],
    blockers: [...item.quality.blockers],
    recommendedAction: recommendation.actions.join(", "),
    detectedAt: new Date().toISOString(),
  };

  candidate.priority = calculateRefreshPriority(candidate, {
    contentItem: item,
    snapshot,
    previousSnapshot: previous,
  });

  return candidate;
}

export function calculateRefreshPriority(
  candidate: ContentRefreshCandidate,
  context: RefreshPriorityContext = {},
): ContentRefreshCandidate["priority"] {
  let score = 0;
  const { contentItem, snapshot, previousSnapshot } = context;

  const signalConfidence = refreshSignalValidator.calculateRefreshSignalConfidence(candidate);
  if (signalConfidence === "high") score += 30;
  else if (signalConfidence === "medium") score += 15;

  const cachedPriority = contentItem
    ? cmsPriorityIntegration.getCachedScore(contentItem.id)
    : undefined;
  const level = cachedPriority?.level ?? contentItem?.seo.priority;
  if (level === "P1") score += 25;
  else if (level === "P2") score += 18;
  else if (level === "P3") score += 10;

  if (candidate.reasons.includes("content-decay")) score += 15;
  if (candidate.reasons.includes("cannibalization")) score += 20;
  if (candidate.reasons.includes("technical-seo-issue")) score += 22;
  if (candidate.reasons.includes("conversion-decline")) score += 12;

  if (snapshot?.conversions.qualifiedLeads != null && snapshot.conversions.qualifiedLeads > 0) {
    score += 10;
  }

  if (contentItem && !contentItem.indexing.indexable) score -= 15;
  if (candidate.blockers.length > 0) score -= 20;

  const decay = snapshot && previousSnapshot
    ? contentDecayService.detectContentDecay(snapshot, previousSnapshot)
    : null;
  if (decay?.severity === "high") score += 15;

  score = Math.max(0, Math.min(100, score));

  let priorityLevel: ContentRefreshCandidate["priority"]["level"] = "low";
  if (score >= 75) priorityLevel = "critical";
  else if (score >= 55) priorityLevel = "high";
  else if (score >= 30) priorityLevel = "medium";

  if (signalConfidence === "low" && priorityLevel === "critical") {
    priorityLevel = "high";
  }

  return {
    score,
    level: priorityLevel,
    confidence: signalConfidence,
  };
}

export function detectRefreshCandidates(
  contentItems: CMSContentItem[],
  analytics: RefreshQueueAnalytics,
): ContentRefreshCandidate[] {
  const snapshotMap = new Map(analytics.snapshots.map((s) => [s.contentItemId, s]));
  const previousMap = new Map(
    (analytics.previousSnapshots ?? []).map((s) => [s.contentItemId, s]),
  );

  const candidates: ContentRefreshCandidate[] = [];

  for (const item of contentItems) {
    if (item.status !== "published") continue;
    const snapshot = snapshotMap.get(item.id);
    if (!snapshot) continue;

    const recommendation = contentUpdateRecommender.recommendContentUpdate(snapshot, {
      previousSnapshot: previousMap.get(item.id),
      hasCannibalizationRisk: item.seo.cannibalizationRisk === "high",
    });

    if (
      recommendation.actions.includes("keep") ||
      recommendation.actions.includes("wait-for-data")
    ) {
      continue;
    }

    const candidate = mapRecommendationToCandidate(
      item,
      snapshot,
      previousMap.get(item.id),
    );

    const validation = refreshSignalValidator.validateRefreshSignal(candidate, {
      contentItem: item,
      snapshot,
      previousSnapshot: previousMap.get(item.id),
    });

    if (!validation.valid) {
      candidate.risks.push(...validation.issues);
      if (validation.confidence === "low") {
        candidate.priority.level = "low";
        candidate.priority.confidence = "low";
      }
    }

    candidates.push(candidate);
    refreshStore.saveCandidate(candidate);
    refreshAnalytics.trackRefreshCandidateDetected({
      contentItemId: candidate.contentItemId,
      candidateId: candidate.id,
      priority: candidate.priority.level,
      confidence: candidate.priority.confidence,
      reason: candidate.reasons.join(", "),
    });
  }

  return candidates;
}

export function buildContentRefreshQueue(
  contentItems: CMSContentItem[],
  analytics: RefreshQueueAnalytics,
): ContentRefreshCandidate[] {
  const detected = detectRefreshCandidates(contentItems, analytics);
  const safe = excludeUnsafeRefreshCandidates(detected, contentItems);
  return sortRefreshQueue(safe);
}

export function sortRefreshQueue(candidates: ContentRefreshCandidate[]): ContentRefreshCandidate[] {
  const order = { critical: 0, high: 1, medium: 2, low: 3 };
  return [...candidates].sort((a, b) => {
    const levelDiff = order[a.priority.level] - order[b.priority.level];
    if (levelDiff !== 0) return levelDiff;
    return b.priority.score - a.priority.score;
  });
}

export function groupRefreshQueueByStatus(
  candidates: ContentRefreshCandidate[],
): Record<ContentRefreshStatus, ContentRefreshCandidate[]> {
  const groups = {} as Record<ContentRefreshStatus, ContentRefreshCandidate[]>;
  for (const candidate of candidates) {
    if (!groups[candidate.status]) groups[candidate.status] = [];
    groups[candidate.status].push(candidate);
  }
  return groups;
}

export function excludeUnsafeRefreshCandidates(
  candidates: ContentRefreshCandidate[],
  contentItems: CMSContentItem[],
): ContentRefreshCandidate[] {
  const itemMap = new Map(contentItems.map((i) => [i.id, i]));
  const winners = new Set<string>();

  return candidates.filter((candidate) => {
    const item = itemMap.get(candidate.contentItemId);
    if (!item) return false;
    if (winners.has(candidate.contentItemId)) return false;
    if (item.quality.level === "strong" && candidate.priority.confidence === "low") return false;
    if (candidate.blockers.length > 2) return false;
    if (candidate.reasons.length === 1 && candidate.reasons[0] === "manual-request") return false;
    return true;
  });
}

export function getNextRefreshCandidates(limit = 10): ContentRefreshCandidate[] {
  const active = refreshStore
    .listCandidates()
    .filter((c) => !["cancelled", "completed", "rejected"].includes(c.status));
  return sortRefreshQueue(active).slice(0, limit);
}

export function assignRefreshCandidate(candidateId: string, actorId: string): ContentRefreshCandidate | null {
  const candidate = refreshStore.getCandidate(candidateId);
  if (!candidate) return null;
  refreshStore.setCandidateMeta(candidateId, {
    ...refreshStore.getCandidateMeta(candidateId),
    assignedTo: actorId,
  });
  const updated = {
    ...candidate,
    status: "needs-diagnosis" as ContentRefreshStatus,
    updatedAt: new Date().toISOString(),
  };
  refreshStore.saveCandidate(updated);
  refreshStore.logAudit({
    action: "refresh_candidate_assigned",
    entityType: "candidate",
    entityId: candidateId,
    contentItemId: candidate.contentItemId,
    actorId,
  });
  return updated;
}

export function deferRefreshCandidate(
  candidateId: string,
  reason: string,
): ContentRefreshCandidate | null {
  if (!reason.trim()) throw new Error("Defer reason is required");
  const candidate = refreshStore.getCandidate(candidateId);
  if (!candidate) return null;
  refreshStore.setCandidateMeta(candidateId, {
    ...refreshStore.getCandidateMeta(candidateId),
    deferReason: reason,
    deferredAt: new Date().toISOString(),
  });
  const updated = {
    ...candidate,
    status: "cancelled" as ContentRefreshStatus,
    updatedAt: new Date().toISOString(),
  };
  refreshStore.saveCandidate(updated);
  refreshAnalytics.trackRefreshCandidateDeferred({
    contentItemId: candidate.contentItemId,
    candidateId,
    reason,
  });
  return updated;
}

export function dismissRefreshCandidate(
  candidateId: string,
  reason: string,
): ContentRefreshCandidate | null {
  if (!reason.trim()) throw new Error("Dismiss reason is required");
  const candidate = refreshStore.getCandidate(candidateId);
  if (!candidate) return null;
  refreshStore.setCandidateMeta(candidateId, {
    ...refreshStore.getCandidateMeta(candidateId),
    dismissReason: reason,
    dismissedAt: new Date().toISOString(),
  });
  const updated = {
    ...candidate,
    status: "rejected" as ContentRefreshStatus,
    updatedAt: new Date().toISOString(),
  };
  refreshStore.saveCandidate(updated);
  refreshAnalytics.trackRefreshCandidateDismissed({
    contentItemId: candidate.contentItemId,
    candidateId,
    reason,
  });
  refreshStore.logAudit({
    action: "refresh_candidate_dismissed",
    entityType: "candidate",
    entityId: candidateId,
    contentItemId: candidate.contentItemId,
    reason,
  });
  return updated;
}

export function reopenRefreshCandidate(candidateId: string): ContentRefreshCandidate | null {
  const candidate = refreshStore.getCandidate(candidateId);
  if (!candidate) return null;
  const updated = {
    ...candidate,
    status: "detected" as ContentRefreshStatus,
    updatedAt: new Date().toISOString(),
  };
  refreshStore.saveCandidate(updated);
  refreshStore.logAudit({
    action: "refresh_candidate_reopened",
    entityType: "candidate",
    entityId: candidateId,
    contentItemId: candidate.contentItemId,
  });
  return updated;
}

export const refreshQueueService = {
  buildContentRefreshQueue,
  detectRefreshCandidates,
  calculateRefreshPriority,
  sortRefreshQueue,
  groupRefreshQueueByStatus,
  excludeUnsafeRefreshCandidates,
  getNextRefreshCandidates,
  assignRefreshCandidate,
  deferRefreshCandidate,
  dismissRefreshCandidate,
  reopenRefreshCandidate,
};
