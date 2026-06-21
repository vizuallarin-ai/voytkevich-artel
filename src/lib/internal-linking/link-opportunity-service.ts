import { randomUUID } from "crypto";
import type { CMSContentItem } from "@/types/content-cms";
import type { KnowledgeGraphSnapshot } from "@/types/knowledge-graph";
import type { LinkRecommendation } from "@/types/link-recommendation";
import { contentRepository } from "@/lib/content-cms/content-repository";
import { linkRelevanceService } from "@/lib/internal-linking/link-relevance-service";
import { anchorRecommendationService } from "@/lib/internal-linking/anchor-recommendation-service";
import { linkPlacementService } from "@/lib/internal-linking/link-placement-service";
import { contentGraphService } from "@/lib/knowledge-graph/content-graph-service";
import { knowledgeGraphStore } from "@/lib/knowledge-graph/knowledge-graph-store";
import { indexationGraphIntegration } from "@/lib/knowledge-graph/indexation-graph-integration";
import { getLinkDensityLimits } from "@/data/internal-linking-rules";
import { knowledgeGraphAnalytics } from "@/lib/knowledge-graph/knowledge-graph-analytics";

const COMMERCIAL_PATTERN = /\/calculator|pod-klyuch|smeta|proektirovanie/;

export function buildLinkRecommendation(
  source: CMSContentItem,
  target: CMSContentItem,
  context: { allItems: CMSContentItem[] },
): LinkRecommendation {
  const relevance = linkRelevanceService.calculateLinkRelevance(source, target, {
    allItems: context.allItems,
    existingLinkCount: contentGraphService.getOutgoingContentLinks(source.id).length,
  });

  const inventory = knowledgeGraphStore.listLinkRecords();
  const anchors = anchorRecommendationService.generateAnchorCandidates(source, target);
  const safest = anchorRecommendationService.selectSafestAnchor(anchors, { target, inventory });
  const placement = linkPlacementService.findRelevantLinkPlacements(source, target)[0];

  return {
    id: randomUUID(),
    sourceContentItemId: source.id,
    targetContentItemId: target.id,
    relation: COMMERCIAL_PATTERN.test(target.url) ? "leads-to" : "links-to",
    score: relevance.score,
    confidence: relevance.confidence,
    factors: {
      semanticRelevance: relevance.semanticRelevance,
      entityOverlap: relevance.entityOverlap,
      clusterRelationship: relevance.clusterRelationship,
      userJourneyValue: relevance.userJourneyValue,
      businessValue: relevance.businessValue,
      targetPriority: relevance.targetPriority,
      targetDepth: relevance.targetDepth,
      targetAuthorityNeed: relevance.targetAuthorityNeed,
      duplicationPenalty: relevance.duplicationPenalty,
      anchorRiskPenalty: relevance.anchorRiskPenalty,
      linkDensityPenalty: relevance.linkDensityPenalty,
    },
    suggestedAnchors: safest ? [safest, ...anchors.filter((a) => a !== safest).slice(0, 3)] : anchors.slice(0, 4),
    suggestedPlacement: placement?.placement,
    explanation: linkRelevanceService.explainLinkRelevance(relevance),
    evidence: ["link relevance scoring"],
    status: "suggested",
    createdAt: new Date().toISOString(),
  };
}

export async function findLinkOpportunities(
  contentItem: CMSContentItem,
  _graph: KnowledgeGraphSnapshot,
): Promise<LinkRecommendation[]> {
  const allItems = await contentRepository.listContent();
  const candidates = allItems.filter((t) => t.id !== contentItem.id);
  const raw = candidates
    .map((target) => buildLinkRecommendation(contentItem, target, { allItems }))
    .filter((r) => r.score >= 40);

  return rankLinkOpportunities(excludeUnsafeLinkOpportunities(raw, allItems));
}

export function findCommercialLinkOpportunities(
  contentItem: CMSContentItem,
  allItems: CMSContentItem[],
): LinkRecommendation[] {
  const commercial = allItems.filter(
    (t) => t.indexing.indexable && COMMERCIAL_PATTERN.test(t.url),
  );
  return rankLinkOpportunities(
    commercial.map((t) => buildLinkRecommendation(contentItem, t, { allItems })),
  );
}

export function findSupportingContentOpportunities(
  contentItem: CMSContentItem,
  allItems: CMSContentItem[],
): LinkRecommendation[] {
  const supporting = allItems.filter(
    (t) =>
      t.id !== contentItem.id &&
      t.indexing.indexable &&
      (t.kind === "technical-article" || t.kind === "editorial-content") &&
      t.clusterId === contentItem.clusterId,
  );
  return supporting.map((t) => buildLinkRecommendation(contentItem, t, { allItems }));
}

export function findClusterLinkOpportunities(
  contentItem: CMSContentItem,
  allItems: CMSContentItem[],
): LinkRecommendation[] {
  if (!contentItem.clusterId) return [];
  const clusterMembers = allItems.filter(
    (t) => t.clusterId === contentItem.clusterId && t.id !== contentItem.id,
  );
  return clusterMembers.map((t) => buildLinkRecommendation(contentItem, t, { allItems }));
}

export function findOrphanRecoveryOpportunities(
  orphanItem: CMSContentItem,
  allItems: CMSContentItem[],
): LinkRecommendation[] {
  const sources = allItems.filter(
    (s) =>
      s.id !== orphanItem.id &&
      s.indexing.indexable &&
      (s.clusterId === orphanItem.clusterId || s.seo.priority === "P1" || s.seo.priority === "P2"),
  );
  return sources
    .map((source) => buildLinkRecommendation(source, orphanItem, { allItems }))
    .filter((r) => r.score >= 45);
}

export function findPriorityPageLinkOpportunities(allItems: CMSContentItem[]): LinkRecommendation[] {
  const priorityPages = allItems.filter((i) => i.seo.priority === "P1" || i.seo.priority === "P2");
  const opportunities: LinkRecommendation[] = [];

  for (const priority of priorityPages) {
    const incoming = contentGraphService.getIncomingContentLinks(priority.id).length;
    if (incoming >= 3) continue;

    for (const source of allItems) {
      if (source.id === priority.id) continue;
      const rec = buildLinkRecommendation(source, priority, { allItems });
      if (rec.score >= 50) opportunities.push(rec);
    }
  }

  return rankLinkOpportunities(opportunities).slice(0, 20);
}

export function excludeUnsafeLinkOpportunities(
  opportunities: LinkRecommendation[],
  allItems: CMSContentItem[],
): LinkRecommendation[] {
  const safe = indexationGraphIntegration.excludeNonIndexableTargets(opportunities, allItems);
  const existing = new Set(
    knowledgeGraphStore.listLinkRecords().map(
      (l) => `${l.sourceContentItemId}|${l.targetUrl}`,
    ),
  );

  return safe.filter((opp) => {
    const source = allItems.find((i) => i.id === opp.sourceContentItemId);
    const target = allItems.find((i) => i.id === opp.targetContentItemId);
    if (!source || !target) return false;

    if (opp.sourceContentItemId === opp.targetContentItemId) return false;
    if (existing.has(`${source.id}|${target.url}`)) return false;
    if (opp.factors.semanticRelevance < 0.15 && opp.factors.entityOverlap < 0.1) return false;
    if (opp.factors.linkDensityPenalty >= 0.5) return false;

    const limits = getLinkDensityLimits(source.contentType, 800);
    const outgoing = contentGraphService.getOutgoingContentLinks(source.id).length;
    if (outgoing >= limits.maxLinks) return false;

    return true;
  });
}

export function rankLinkOpportunities(opportunities: LinkRecommendation[]): LinkRecommendation[] {
  const ranked = [...opportunities].sort((a, b) => b.score - a.score);
  for (const opp of ranked) {
    knowledgeGraphAnalytics.trackLinkOpportunityDetected({
      recommendationId: opp.id,
      contentItemId: opp.sourceContentItemId,
      score: String(opp.score),
      confidence: opp.confidence,
    });
  }
  return ranked;
}

export const linkOpportunityService = {
  findLinkOpportunities,
  findCommercialLinkOpportunities,
  findSupportingContentOpportunities,
  findClusterLinkOpportunities,
  findOrphanRecoveryOpportunities,
  findPriorityPageLinkOpportunities,
  excludeUnsafeLinkOpportunities,
  rankLinkOpportunities,
  buildLinkRecommendation,
};
