import { randomUUID } from "crypto";
import type { LinkRecommendation } from "@/types/link-recommendation";
import type { InternalLinkRecord } from "@/types/internal-link";
import { knowledgeGraphStore } from "@/lib/knowledge-graph/knowledge-graph-store";
import { knowledgeGraphAnalytics } from "@/lib/knowledge-graph/knowledge-graph-analytics";

const BATCH_APPROVAL_LIMIT = 25;

export function requestLinkReview(recommendationId: string): LinkRecommendation | null {
  const rec = knowledgeGraphStore.getRecommendation(recommendationId);
  if (!rec) return null;
  knowledgeGraphStore.logAudit({
    action: "link_review_requested",
    entityType: "recommendation",
    entityId: recommendationId,
  });
  return rec;
}

export function approveLinkRecommendation(id: string, actor?: string): LinkRecommendation | null {
  const rec = knowledgeGraphStore.getRecommendation(id);
  if (!rec) return null;
  const updated: LinkRecommendation = { ...rec, status: "approved" };
  knowledgeGraphStore.saveRecommendation(updated);
  knowledgeGraphStore.logAudit({
    action: "link_recommendation_approved",
    entityType: "recommendation",
    entityId: id,
    actorId: actor,
  });
  knowledgeGraphAnalytics.trackLinkRecommendationApproved({ recommendationId: id, actorRole: actor });
  return updated;
}

export function rejectLinkRecommendation(id: string, actor: string | undefined, reason: string): LinkRecommendation | null {
  const rec = knowledgeGraphStore.getRecommendation(id);
  if (!rec) return null;
  const updated: LinkRecommendation = { ...rec, status: "rejected" };
  knowledgeGraphStore.saveRecommendation(updated);
  knowledgeGraphStore.logAudit({
    action: "link_recommendation_rejected",
    entityType: "recommendation",
    entityId: id,
    actorId: actor,
    reason,
  });
  knowledgeGraphAnalytics.trackLinkRecommendationRejected({ recommendationId: id, actorRole: actor });
  return updated;
}

export function editLinkRecommendation(
  id: string,
  changes: Partial<Pick<LinkRecommendation, "suggestedAnchors" | "suggestedPlacement" | "explanation">>,
): LinkRecommendation | null {
  const rec = knowledgeGraphStore.getRecommendation(id);
  if (!rec) return null;
  const updated = { ...rec, ...changes };
  knowledgeGraphStore.saveRecommendation(updated);
  knowledgeGraphStore.logAudit({
    action: "link_recommendation_edited",
    entityType: "recommendation",
    entityId: id,
  });
  return updated;
}

export function approveLinkRecommendationBatch(ids: string[], actor?: string): {
  approved: LinkRecommendation[];
  rejected: string[];
  requiresPreview: true;
} {
  if (ids.length > BATCH_APPROVAL_LIMIT) {
    return { approved: [], rejected: ids, requiresPreview: true };
  }
  const approved: LinkRecommendation[] = [];
  const rejected: string[] = [];
  for (const id of ids) {
    const result = approveLinkRecommendation(id, actor);
    if (result) approved.push(result);
    else rejected.push(id);
  }
  return { approved, rejected, requiresPreview: true };
}

export function previewLinkBatch(ids: string[]): {
  batchId: string;
  recommendations: LinkRecommendation[];
  affectedPages: string[];
  riskSummary: string;
  requiresHumanReview: true;
} {
  const batchId = randomUUID();
  const recommendations = ids
    .map((id) => knowledgeGraphStore.getRecommendation(id))
    .filter(Boolean) as LinkRecommendation[];

  const affectedPages = [
    ...new Set(recommendations.flatMap((r) => [r.sourceContentItemId, r.targetContentItemId])),
  ];

  const highRisk = recommendations.filter((r) => r.confidence === "low" || r.score < 50).length;
  const riskSummary = `${recommendations.length} links, ${highRisk} low-confidence`;

  knowledgeGraphStore.saveBatch({
    id: batchId,
    recommendationIds: ids,
    status: "preview",
    previewSummary: riskSummary,
    createdAt: new Date().toISOString(),
  });

  knowledgeGraphAnalytics.trackLinkBatchPreviewed({ batchId });

  return {
    batchId,
    recommendations,
    affectedPages,
    riskSummary,
    requiresHumanReview: true,
  };
}

export function applyApprovedLinkBatch(batchId: string, actor?: string): {
  applied: boolean;
  links: InternalLinkRecord[];
  reason?: string;
} {
  const batch = knowledgeGraphStore.getBatch(batchId);
  if (!batch) return { applied: false, links: [], reason: "Batch not found" };
  if (batch.status !== "preview" && batch.status !== "approved") {
    return { applied: false, links: [], reason: "Batch not approved for application" };
  }

  const recommendations = batch.recommendationIds
    .map((id) => knowledgeGraphStore.getRecommendation(id))
    .filter((r): r is LinkRecommendation => Boolean(r && r.status === "approved"));

  if (recommendations.length === 0) {
    return { applied: false, links: [], reason: "No approved recommendations in batch" };
  }

  const rollbackSnapshot = knowledgeGraphStore.listLinkRecords();
  const appliedLinks: InternalLinkRecord[] = [];

  for (const rec of recommendations) {
    const link: InternalLinkRecord = {
      id: randomUUID(),
      sourceContentItemId: rec.sourceContentItemId,
      targetContentItemId: rec.targetContentItemId,
      sourceUrl: "",
      targetUrl: "",
      anchorText: rec.suggestedAnchors[0] ?? null,
      placement: (rec.suggestedPlacement as InternalLinkRecord["placement"]) ?? "body",
      relation: rec.relation,
      relevanceScore: rec.score,
      status: "suggested",
      firstDetectedAt: new Date().toISOString(),
    };
    knowledgeGraphStore.saveLinkRecord(link);
    appliedLinks.push(link);
    knowledgeGraphStore.saveRecommendation({ ...rec, status: "applied" });
  }

  knowledgeGraphStore.saveBatch({
    ...batch,
    status: "applied",
    actorId: actor,
    appliedAt: new Date().toISOString(),
    rollbackSnapshot,
    updatedAt: new Date().toISOString(),
  });

  knowledgeGraphAnalytics.trackLinkBatchApplied({ batchId, actorRole: actor });

  return { applied: true, links: appliedLinks };
}

export function verifyAppliedLinkBatch(batchId: string): { verified: boolean; issues: string[] } {
  const batch = knowledgeGraphStore.getBatch(batchId);
  if (!batch || batch.status !== "applied") {
    return { verified: false, issues: ["Batch not in applied state"] };
  }

  const issues: string[] = [];
  for (const recId of batch.recommendationIds) {
    const rec = knowledgeGraphStore.getRecommendation(recId);
    if (rec?.status !== "applied") issues.push(`Recommendation ${recId} not applied`);
  }

  if (issues.length === 0) {
    knowledgeGraphStore.saveBatch({
      ...batch,
      status: "verified",
      verifiedAt: new Date().toISOString(),
    });
    knowledgeGraphAnalytics.trackLinkBatchVerified({ batchId });
  }

  return { verified: issues.length === 0, issues };
}

export function rollbackLinkBatch(batchId: string, actor?: string): boolean {
  const batch = knowledgeGraphStore.getBatch(batchId);
  if (!batch?.rollbackSnapshot) return false;

  for (const link of batch.rollbackSnapshot) {
    knowledgeGraphStore.saveLinkRecord(link);
  }

  for (const recId of batch.recommendationIds) {
    const rec = knowledgeGraphStore.getRecommendation(recId);
    if (rec) knowledgeGraphStore.saveRecommendation({ ...rec, status: "suggested" });
  }

  knowledgeGraphStore.saveBatch({
    ...batch,
    status: "rolled-back",
    actorId: actor,
    updatedAt: new Date().toISOString(),
  });

  knowledgeGraphStore.logAudit({
    action: "link_batch_rolled_back",
    entityType: "batch",
    entityId: batchId,
    actorId: actor,
    batchId,
  });

  knowledgeGraphAnalytics.trackLinkBatchRolledBack({ batchId, actorRole: actor });
  return true;
}

export const linkReviewService = {
  requestLinkReview,
  approveLinkRecommendation,
  rejectLinkRecommendation,
  editLinkRecommendation,
  approveLinkRecommendationBatch,
  previewLinkBatch,
  applyApprovedLinkBatch,
  verifyAppliedLinkBatch,
  rollbackLinkBatch,
};
