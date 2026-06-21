import type { CMSContentItem } from "@/types/content-cms";
import type { LinkRecommendation } from "@/types/link-recommendation";
import { getLinkDensityLimits } from "@/data/internal-linking-rules";
import { entityResolutionService } from "@/lib/knowledge-graph/entity-resolution-service";
import { contentGraphService } from "@/lib/knowledge-graph/content-graph-service";
import { cmsPriorityIntegration } from "@/lib/content-prioritization/cms-priority-integration";

export type LinkRelevanceContext = {
  allItems?: CMSContentItem[];
  wordCount?: number;
  existingLinkCount?: number;
};

export type LinkRelevanceResult = LinkRecommendation["factors"] & {
  score: number;
  confidence: LinkRecommendation["confidence"];
};

function estimateWordCount(item: CMSContentItem): number {
  const base = item.title.length + (item.seoDescription?.length ?? 0);
  return Math.max(300, Math.round(base * 2.5));
}

export function calculateSemanticRelevance(source: CMSContentItem, target: CMSContentItem): number {
  let score = 0;
  if (source.clusterId && source.clusterId === target.clusterId) score += 0.4;
  const kwA = source.seo.targetKeyword?.toLowerCase();
  const kwB = target.seo.targetKeyword?.toLowerCase();
  if (kwA && kwB && (kwA.includes(kwB) || kwB.includes(kwA))) score += 0.35;
  if (source.kind === target.kind) score += 0.1;
  return Math.min(1, score);
}

export function calculateEntityOverlap(source: CMSContentItem, target: CMSContentItem): number {
  const sourceEntities = entityResolutionService.extractEntitiesFromContent(source);
  const targetEntities = entityResolutionService.extractEntitiesFromContent(target);
  const sourceSet = new Set(sourceEntities.map((e) => e.normalized));
  let overlap = 0;
  for (const e of targetEntities) {
    if (sourceSet.has(e.normalized)) overlap++;
  }
  const denom = Math.max(sourceEntities.length, targetEntities.length, 1);
  return overlap / denom;
}

export function calculateClusterRelationship(source: CMSContentItem, target: CMSContentItem): number {
  if (!source.clusterId || !target.clusterId) return 0.2;
  if (source.clusterId === target.clusterId) return 1;
  if (source.clusterId.startsWith("local") && target.clusterId.startsWith("local")) return 0.5;
  return 0.15;
}

export function calculateUserJourneyValue(source: CMSContentItem, target: CMSContentItem): number {
  const infoKinds = new Set(["technical-article", "editorial-content", "news", "digest"]);
  const isSourceInfo = infoKinds.has(source.kind);
  const isTargetCommercial =
    target.url.includes("/calculator") ||
    target.contentType?.includes("service") ||
    target.url.includes("pod-klyuch");
  if (isSourceInfo && isTargetCommercial) return 0.85;
  if (source.kind === target.kind) return 0.5;
  return 0.35;
}

export function calculateBusinessLinkValue(source: CMSContentItem, target: CMSContentItem): number {
  if (target.url.includes("/calculator")) return 0.9;
  if (target.contentType?.includes("service")) return 0.85;
  if (target.seo.priority === "P1" || target.seo.priority === "P2") return 0.7;
  return 0.4;
}

export function calculateLinkRiskPenalties(
  source: CMSContentItem,
  target: CMSContentItem,
  context: LinkRelevanceContext = {},
): Pick<
  LinkRecommendation["factors"],
  "duplicationPenalty" | "anchorRiskPenalty" | "linkDensityPenalty"
> {
  const wordCount = context.wordCount ?? estimateWordCount(source);
  const limits = getLinkDensityLimits(source.contentType, wordCount);
  const existingCount = context.existingLinkCount ?? contentGraphService.getOutgoingContentLinks(source.id).length;

  const linkDensityPenalty =
    existingCount >= limits.maxLinks ? 0.5 : existingCount >= limits.maxLinks * 0.8 ? 0.2 : 0;

  const duplicationPenalty =
    source.seo.targetKeyword &&
    target.seo.targetKeyword &&
    source.seo.targetKeyword.toLowerCase() === target.seo.targetKeyword.toLowerCase()
      ? 0.35
      : 0;

  const anchorRiskPenalty =
    source.seo.targetKeyword?.toLowerCase() === target.title.toLowerCase() ? 0.25 : 0;

  return { duplicationPenalty, anchorRiskPenalty, linkDensityPenalty };
}

export function calculateLinkRelevance(
  source: CMSContentItem,
  target: CMSContentItem,
  context: LinkRelevanceContext = {},
): LinkRelevanceResult {
  const semanticRelevance = calculateSemanticRelevance(source, target);
  const entityOverlap = calculateEntityOverlap(source, target);
  const clusterRelationship = calculateClusterRelationship(source, target);
  const userJourneyValue = calculateUserJourneyValue(source, target);
  const businessValue = calculateBusinessLinkValue(source, target);

  const targetPriorityScore = cmsPriorityIntegration.getCachedScore(target.id);
  const targetPriority =
    targetPriorityScore?.level === "P1"
      ? 1
      : targetPriorityScore?.level === "P2"
        ? 0.8
        : target.seo.priority === "P1"
          ? 0.9
          : 0.5;

  const allItems = context.allItems ?? [];
  const graph = contentGraphService.buildContentGraph(allItems);
  const depth = contentGraphService.calculateContentGraphDepth(target.id, graph);
  const targetDepth = depth >= 0 ? Math.min(1, depth / 5) : 0.5;
  const incoming = contentGraphService.getIncomingContentLinks(target.id).length;
  const targetAuthorityNeed = incoming < 2 ? 0.8 : 0.3;

  const penalties = calculateLinkRiskPenalties(source, target, context);

  const rawScore =
    semanticRelevance * 0.2 +
    entityOverlap * 0.15 +
    clusterRelationship * 0.15 +
    userJourneyValue * 0.15 +
    businessValue * 0.15 +
    targetPriority * 0.1 +
    (1 - targetDepth) * 0.05 +
    targetAuthorityNeed * 0.05 -
    penalties.duplicationPenalty -
    penalties.anchorRiskPenalty -
    penalties.linkDensityPenalty;

  const score = Math.max(0, Math.min(100, Math.round(rawScore * 100)));
  let confidence: LinkRecommendation["confidence"] = "low";
  if (score >= 70 && semanticRelevance >= 0.4) confidence = "high";
  else if (score >= 50) confidence = "medium";

  if (semanticRelevance < 0.2 && entityOverlap < 0.1) confidence = "low";

  return {
    semanticRelevance,
    entityOverlap,
    clusterRelationship,
    userJourneyValue,
    businessValue,
    targetPriority,
    targetDepth,
    targetAuthorityNeed,
    ...penalties,
    score,
    confidence,
  };
}

export function explainLinkRelevance(result: LinkRelevanceResult): string {
  const parts: string[] = [];
  if (result.semanticRelevance >= 0.5) parts.push("strong semantic match");
  if (result.clusterRelationship >= 0.8) parts.push("same cluster");
  if (result.userJourneyValue >= 0.7) parts.push("supports user journey");
  if (result.businessValue >= 0.8) parts.push("commercial destination");
  if (result.linkDensityPenalty > 0) parts.push("link density penalty applied");
  return parts.length ? parts.join("; ") : "weak relevance signals";
}

export const linkRelevanceService = {
  calculateLinkRelevance,
  calculateSemanticRelevance,
  calculateEntityOverlap,
  calculateClusterRelationship,
  calculateUserJourneyValue,
  calculateBusinessLinkValue,
  calculateLinkRiskPenalties,
  explainLinkRelevance,
};
