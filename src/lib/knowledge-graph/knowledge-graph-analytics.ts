import { randomUUID } from "crypto";
import { trackEvent } from "@/lib/analytics/events";

export type KnowledgeGraphAnalyticsPayload = {
  nodeId?: string;
  edgeId?: string;
  contentItemId?: string;
  clusterId?: string;
  recommendationId?: string;
  batchId?: string;
  relation?: string;
  nodeType?: string;
  confidence?: string;
  score?: string;
  riskLevel?: string;
  actorRole?: string;
};

const ALLOWED_KEYS = new Set([
  "nodeId",
  "edgeId",
  "contentItemId",
  "clusterId",
  "recommendationId",
  "batchId",
  "relation",
  "nodeType",
  "confidence",
  "score",
  "riskLevel",
  "actorRole",
]);

function sanitizePayload(payload: KnowledgeGraphAnalyticsPayload): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (!ALLOWED_KEYS.has(key) || value == null) continue;
    result[key] = String(value).slice(0, 200);
  }
  return result;
}

function trackGraphEvent(eventName: string, payload: KnowledgeGraphAnalyticsPayload = {}): void {
  trackEvent(eventName, {
    eventId: randomUUID(),
    occurredAt: new Date().toISOString(),
    ...sanitizePayload(payload),
  });
}

export function trackKnowledgeGraphViewed(payload: KnowledgeGraphAnalyticsPayload = {}): void {
  trackGraphEvent("knowledge_graph_viewed", payload);
}

export function trackKnowledgeNodeCreated(payload: KnowledgeGraphAnalyticsPayload): void {
  trackGraphEvent("knowledge_node_created", payload);
}

export function trackKnowledgeEdgeSuggested(payload: KnowledgeGraphAnalyticsPayload): void {
  trackGraphEvent("knowledge_edge_suggested", payload);
}

export function trackKnowledgeEdgeApproved(payload: KnowledgeGraphAnalyticsPayload): void {
  trackGraphEvent("knowledge_edge_approved", payload);
}

export function trackKnowledgeEdgeRejected(payload: KnowledgeGraphAnalyticsPayload): void {
  trackGraphEvent("knowledge_edge_rejected", payload);
}

export function trackEntityResolutionRequested(payload: KnowledgeGraphAnalyticsPayload): void {
  trackGraphEvent("entity_resolution_requested", payload);
}

export function trackEntityMergeCompleted(payload: KnowledgeGraphAnalyticsPayload): void {
  trackGraphEvent("entity_merge_completed", payload);
}

export function trackLinkOpportunityDetected(payload: KnowledgeGraphAnalyticsPayload): void {
  trackGraphEvent("link_opportunity_detected", payload);
}

export function trackLinkRecommendationApproved(payload: KnowledgeGraphAnalyticsPayload): void {
  trackGraphEvent("link_recommendation_approved", payload);
}

export function trackLinkRecommendationRejected(payload: KnowledgeGraphAnalyticsPayload): void {
  trackGraphEvent("link_recommendation_rejected", payload);
}

export function trackLinkBatchPreviewed(payload: KnowledgeGraphAnalyticsPayload): void {
  trackGraphEvent("link_batch_previewed", payload);
}

export function trackLinkBatchApplied(payload: KnowledgeGraphAnalyticsPayload): void {
  trackGraphEvent("link_batch_applied", payload);
}

export function trackLinkBatchVerified(payload: KnowledgeGraphAnalyticsPayload): void {
  trackGraphEvent("link_batch_verified", payload);
}

export function trackLinkBatchRolledBack(payload: KnowledgeGraphAnalyticsPayload): void {
  trackGraphEvent("link_batch_rolled_back", payload);
}

export function trackOrphanPageDetected(payload: KnowledgeGraphAnalyticsPayload): void {
  trackGraphEvent("orphan_page_detected", payload);
}

export function trackOrphanRecoveryApplied(payload: KnowledgeGraphAnalyticsPayload): void {
  trackGraphEvent("orphan_recovery_applied", payload);
}

export function trackClusterHealthRecalculated(payload: KnowledgeGraphAnalyticsPayload): void {
  trackGraphEvent("cluster_health_recalculated", payload);
}

export function trackCannibalizationConflictDetected(payload: KnowledgeGraphAnalyticsPayload): void {
  trackGraphEvent("cannibalization_conflict_detected", payload);
}

export function trackUserJourneyDeadEndDetected(payload: KnowledgeGraphAnalyticsPayload): void {
  trackGraphEvent("user_journey_dead_end_detected", payload);
}

export function trackGraphValidationFailed(payload: KnowledgeGraphAnalyticsPayload): void {
  trackGraphEvent("graph_validation_failed", payload);
}

export const knowledgeGraphAnalytics = {
  trackKnowledgeGraphViewed,
  trackKnowledgeNodeCreated,
  trackKnowledgeEdgeSuggested,
  trackKnowledgeEdgeApproved,
  trackKnowledgeEdgeRejected,
  trackEntityResolutionRequested,
  trackEntityMergeCompleted,
  trackLinkOpportunityDetected,
  trackLinkRecommendationApproved,
  trackLinkRecommendationRejected,
  trackLinkBatchPreviewed,
  trackLinkBatchApplied,
  trackLinkBatchVerified,
  trackLinkBatchRolledBack,
  trackOrphanPageDetected,
  trackOrphanRecoveryApplied,
  trackClusterHealthRecalculated,
  trackCannibalizationConflictDetected,
  trackUserJourneyDeadEndDetected,
  trackGraphValidationFailed,
  sanitizePayload,
};
