import type { CMSContentItem } from "@/types/content-cms";
import type { LinkRecommendation } from "@/types/link-recommendation";
import type { PillarClusterRole } from "@/types/content-cluster-graph";
import { contentRepository } from "@/lib/content-cms/content-repository";
import { knowledgeGraphService } from "@/lib/knowledge-graph/knowledge-graph-service";
import { entityResolutionService } from "@/lib/knowledge-graph/entity-resolution-service";
import { contentGraphService } from "@/lib/knowledge-graph/content-graph-service";
import { pillarClusterService } from "@/lib/knowledge-graph/pillar-cluster-service";
import { semanticClusterService } from "@/lib/content-prioritization/semantic-cluster-service";
import { knowledgeGraphStore } from "@/lib/knowledge-graph/knowledge-graph-store";

const cmsGraphState = new Map<
  string,
  {
    lastSyncedAt?: string;
    clusterRole?: PillarClusterRole;
    entityIds: string[];
    recommendationIds: string[];
  }
>();

export async function syncCMSContentToGraph(contentItemId: string): Promise<void> {
  const item = await contentRepository.getContentById(contentItemId);
  if (!item) return;

  await knowledgeGraphService.rebuildGraphForContentItem(contentItemId);
  const extracted = entityResolutionService.extractEntitiesFromContent(item);
  const resolved = entityResolutionService.mapContentToEntities(item, extracted);
  const entityIds = resolved.filter((r) => r.entity).map((r) => r.entity!.id);

  cmsGraphState.set(contentItemId, {
    lastSyncedAt: new Date().toISOString(),
    entityIds,
    recommendationIds: cmsGraphState.get(contentItemId)?.recommendationIds ?? [],
  });

  knowledgeGraphStore.logAudit({
    action: "cms_graph_sync",
    entityType: "node",
    entityId: `content:${contentItemId}`,
    contentItemId,
  });
}

export function attachEntitiesToCMSItem(contentItemId: string, entities: string[]): void {
  const state = cmsGraphState.get(contentItemId) ?? { entityIds: [], recommendationIds: [] };
  cmsGraphState.set(contentItemId, { ...state, entityIds: entities });
}

export function attachClusterRoleToCMSItem(contentItemId: string, role: PillarClusterRole): void {
  const state = cmsGraphState.get(contentItemId) ?? { entityIds: [], recommendationIds: [] };
  cmsGraphState.set(contentItemId, { ...state, clusterRole: role });
}

export function attachLinkRecommendations(
  contentItemId: string,
  recommendations: LinkRecommendation[],
): void {
  for (const rec of recommendations) {
    knowledgeGraphStore.saveRecommendation(rec);
  }
  const state = cmsGraphState.get(contentItemId) ?? { entityIds: [], recommendationIds: [] };
  cmsGraphState.set(contentItemId, {
    ...state,
    recommendationIds: [...state.recommendationIds, ...recommendations.map((r) => r.id)],
  });
}

export async function getCMSGraphContext(contentItemId: string): Promise<{
  contentItem: CMSContentItem | null;
  entities: string[];
  clusterRole?: PillarClusterRole;
  incomingLinks: string[];
  outgoingLinks: string[];
  brokenLinks: number;
  orphanStatus: boolean;
  clickDepth: number;
  recommendations: LinkRecommendation[];
  syncStatus: string;
}> {
  const item = await contentRepository.getContentById(contentItemId);
  const state = cmsGraphState.get(contentItemId);
  const all = item ? await contentRepository.listContent() : [];
  const graph = item ? contentGraphService.buildContentGraph(all) : null;

  const incoming = contentGraphService.getIncomingContentLinks(contentItemId);
  const outgoing = contentGraphService.getOutgoingContentLinks(contentItemId);
  const brokenLinks = knowledgeGraphStore
    .listLinkRecords()
    .filter((l) => l.sourceContentItemId === contentItemId && l.status === "broken").length;

  let clusterRole = state?.clusterRole;
  if (!clusterRole && item?.clusterId) {
    const cluster = await semanticClusterService.getById(item.clusterId);
    if (cluster) {
      const roles = pillarClusterService.assignClusterRoles(cluster, all);
      clusterRole = roles.get(contentItemId);
    }
  }

  return {
    contentItem: item,
    entities: state?.entityIds ?? [],
    clusterRole,
    incomingLinks: incoming,
    outgoingLinks: outgoing,
    brokenLinks,
    orphanStatus: incoming.length === 0 && Boolean(item?.indexing.indexable),
    clickDepth: graph ? contentGraphService.calculateContentGraphDepth(contentItemId, graph) : -1,
    recommendations: (state?.recommendationIds ?? [])
      .map((id) => knowledgeGraphStore.getRecommendation(id))
      .filter(Boolean) as LinkRecommendation[],
    syncStatus: state?.lastSyncedAt ? "synced" : "pending",
  };
}

export async function getCMSIncomingLinks(contentItemId: string): Promise<string[]> {
  return contentGraphService.getIncomingContentLinks(contentItemId);
}

export async function getCMSOutgoingLinks(contentItemId: string): Promise<string[]> {
  return contentGraphService.getOutgoingContentLinks(contentItemId);
}

export function requestCMSLinkReview(contentItemId: string): { reviewRequested: true; contentItemId: string } {
  knowledgeGraphStore.logAudit({
    action: "cms_link_review_requested",
    entityType: "recommendation",
    entityId: contentItemId,
    contentItemId,
  });
  return { reviewRequested: true, contentItemId };
}

export async function applyApprovedCMSLinks(contentItemId: string): Promise<{ applied: false; reason: string }> {
  return {
    applied: false,
    reason: "CMS link application requires link-review-service batch approval",
  };
}

export const cmsKnowledgeGraphIntegration = {
  syncCMSContentToGraph,
  attachEntitiesToCMSItem,
  attachClusterRoleToCMSItem,
  attachLinkRecommendations,
  getCMSGraphContext,
  getCMSIncomingLinks,
  getCMSOutgoingLinks,
  requestCMSLinkReview,
  applyApprovedCMSLinks,
};
