import type { ContentRefreshCandidate } from "@/types/content-refresh";
import type { PostRefreshMonitoringWindow } from "@/types/post-refresh-monitoring";
import { cmsPriorityIntegration } from "@/lib/content-prioritization/cms-priority-integration";
import { contentRepository } from "@/lib/content-cms/content-repository";
import { refreshStore } from "@/lib/content-refresh/refresh-store";

export type PriorityRefreshFeedback = {
  contentItemId: string;
  originalPriority?: string;
  refreshOutcome?: string;
  recommendation: string;
  requiresManualApproval: true;
};

export async function sendRefreshEvidenceToPrioritySystem(
  candidate: ContentRefreshCandidate,
): Promise<PriorityRefreshFeedback> {
  const item = await contentRepository.getContentById(candidate.contentItemId);
  const cached = cmsPriorityIntegration.getCachedScore(candidate.contentItemId);

  refreshStore.logAudit({
    action: "refresh_evidence_sent_to_priority",
    entityType: "candidate",
    entityId: candidate.id,
    contentItemId: candidate.contentItemId,
  });

  return {
    contentItemId: candidate.contentItemId,
    originalPriority: cached?.level ?? item?.seo.priority,
    recommendation: `Refresh candidate: ${candidate.reasons.join(", ")} — review priority alignment`,
    requiresManualApproval: true,
  };
}

export function recommendPriorityAdjustmentAfterRefresh(
  result: PostRefreshMonitoringWindow,
): PriorityRefreshFeedback {
  return {
    contentItemId: result.contentItemId,
    refreshOutcome: result.status,
    recommendation: "Review priority scoring weights based on refresh outcome — manual approval required",
    requiresManualApproval: true,
  };
}

export async function compareOriginalPriorityWithRefreshOutcome(
  contentItemId: string,
): Promise<PriorityRefreshFeedback> {
  const item = await contentRepository.getContentById(contentItemId);
  const cached = cmsPriorityIntegration.getCachedScore(contentItemId);
  const monitoring = refreshStore.getMonitoringByContentItem(contentItemId).pop();

  return {
    contentItemId,
    originalPriority: cached?.level ?? item?.seo.priority,
    refreshOutcome: monitoring?.status,
    recommendation: "Compare predicted priority with post-refresh performance",
    requiresManualApproval: true,
  };
}

export function markPriorityModelOverestimate(contentItemId: string): PriorityRefreshFeedback {
  cmsPriorityIntegration.markItemPriorityReviewed(contentItemId);
  return {
    contentItemId,
    recommendation: "Priority model may have overestimated this item — manual weight review required",
    requiresManualApproval: true,
  };
}

export function markPriorityModelUnderestimate(contentItemId: string): PriorityRefreshFeedback {
  cmsPriorityIntegration.markItemPriorityReviewed(contentItemId);
  return {
    contentItemId,
    recommendation: "Priority model may have underestimated this item — manual weight review required",
    requiresManualApproval: true,
  };
}

export const priorityRefreshIntegration = {
  sendRefreshEvidenceToPrioritySystem,
  recommendPriorityAdjustmentAfterRefresh,
  compareOriginalPriorityWithRefreshOutcome,
  markPriorityModelOverestimate,
  markPriorityModelUnderestimate,
};
