import type { ContentUpdateBrief } from "@/types/content-update-brief";
import type { CMSContentItem } from "@/types/content-cms";
import type { LinkRecommendation } from "@/types/link-recommendation";
import { refreshStore } from "@/lib/content-refresh/refresh-store";
import { cmsKnowledgeGraphIntegration } from "@/lib/knowledge-graph/cms-knowledge-graph-integration";
import { knowledgeGraphService } from "@/lib/knowledge-graph/knowledge-graph-service";
import { contentGraphService } from "@/lib/knowledge-graph/content-graph-service";
import { linkOpportunityService } from "@/lib/internal-linking/link-opportunity-service";
import { contentRepository } from "@/lib/content-cms/content-repository";

export async function attachGraphContextToUpdateBrief(
  brief: ContentUpdateBrief,
): Promise<ContentUpdateBrief & { graphContext?: Awaited<ReturnType<typeof cmsKnowledgeGraphIntegration.getCMSGraphContext>> }> {
  await cmsKnowledgeGraphIntegration.syncCMSContentToGraph(brief.contentItemId);
  const graphContext = await cmsKnowledgeGraphIntegration.getCMSGraphContext(brief.contentItemId);
  return { ...brief, graphContext };
}

export async function recommendLinksDuringRefresh(
  contentItemId: string,
): Promise<LinkRecommendation[]> {
  const item = await contentRepository.getContentById(contentItemId);
  if (!item) return [];
  const graph = knowledgeGraphService.snapshot();
  return linkOpportunityService.findLinkOpportunities(item, graph);
}

export function detectGraphRegressionAfterRefresh(
  before: { incoming: string[]; outgoing: string[] },
  after: { incoming: string[]; outgoing: string[] },
): { regressed: boolean; warnings: string[] } {
  const warnings: string[] = [];
  const lostIncoming = before.incoming.filter((id) => !after.incoming.includes(id));
  const lostOutgoing = before.outgoing.filter((id) => !after.outgoing.includes(id));

  if (lostIncoming.length > 0) {
    warnings.push(`Lost ${lostIncoming.length} incoming cluster/journey links`);
  }
  if (lostOutgoing.length > 0) {
    warnings.push(`Lost ${lostOutgoing.length} outgoing links after refresh`);
  }

  return { regressed: warnings.length > 0, warnings };
}

export async function validateIncomingLinksAfterRefresh(contentItemId: string): Promise<string[]> {
  const incoming = contentGraphService.getIncomingContentLinks(contentItemId);
  const issues: string[] = [];
  for (const sourceId of incoming) {
    const source = await contentRepository.getContentById(sourceId);
    if (!source?.indexing.indexable) {
      issues.push(`Incoming link from non-indexable source: ${sourceId}`);
    }
  }
  return issues;
}

export async function validateOutgoingLinksAfterRefresh(contentItemId: string): Promise<string[]> {
  const outgoing = contentGraphService.getOutgoingContentLinks(contentItemId);
  const issues: string[] = [];
  for (const targetId of outgoing) {
    const target = await contentRepository.getContentById(targetId);
    if (!target) {
      issues.push(`Outgoing link to missing target: ${targetId}`);
    } else if (!target.indexing.indexable) {
      issues.push(`Outgoing link to noindex target: ${targetId}`);
    }
  }
  return issues;
}

export async function updateGraphAfterApprovedRefresh(contentItemId: string): Promise<void> {
  await cmsKnowledgeGraphIntegration.syncCMSContentToGraph(contentItemId);
  refreshStore.logAudit({
    action: "graph_updated_after_refresh",
    entityType: "node",
    entityId: contentItemId,
    contentItemId,
  });
}

export async function restoreGraphAfterRollback(
  contentItemId: string,
  versionId: string,
): Promise<void> {
  await cmsKnowledgeGraphIntegration.syncCMSContentToGraph(contentItemId);
  refreshStore.logAudit({
    action: "graph_restored_after_rollback",
    entityType: "node",
    entityId: contentItemId,
    contentItemId,
    reason: versionId,
  });
}

export const refreshGraphIntegration = {
  attachGraphContextToUpdateBrief,
  recommendLinksDuringRefresh,
  detectGraphRegressionAfterRefresh,
  validateIncomingLinksAfterRefresh,
  validateOutgoingLinksAfterRefresh,
  updateGraphAfterApprovedRefresh,
  restoreGraphAfterRollback,
};
