import { randomUUID } from "crypto";
import type { CMSContentItem } from "@/types/content-cms";
import type { KnowledgeEdge, KnowledgeGraphSnapshot } from "@/types/knowledge-graph";
import type { LinkRecommendation } from "@/types/link-recommendation";
import { normalizeEntityName } from "@/lib/knowledge-graph/entity-normalization-service";
import { knowledgeGraphService } from "@/lib/knowledge-graph/knowledge-graph-service";
import { contentGraphService } from "@/lib/knowledge-graph/content-graph-service";
import { knowledgeGraphStore } from "@/lib/knowledge-graph/knowledge-graph-store";

export type CannibalizationConflict = {
  id: string;
  sourceContentItemId: string;
  targetContentItemId: string;
  sharedIntent: boolean;
  sharedEntities: string[];
  titleSimilarity: number;
  anchorOverlap: string[];
  severity: "low" | "medium" | "high";
  confidence: "low" | "medium" | "high";
};

function tokenOverlap(a: string, b: string): number {
  const tokensA = new Set(normalizeEntityName(a).split(/\s+/));
  const tokensB = new Set(normalizeEntityName(b).split(/\s+/));
  let shared = 0;
  for (const t of tokensA) {
    if (tokensB.has(t)) shared++;
  }
  return shared / Math.max(tokensA.size, tokensB.size, 1);
}

export function buildCannibalizationGraph(contentItems: CMSContentItem[]): KnowledgeGraphSnapshot {
  const snapshot = knowledgeGraphService.snapshot();
  for (let i = 0; i < contentItems.length; i++) {
    for (let j = i + 1; j < contentItems.length; j++) {
      const a = contentItems[i];
      const b = contentItems[j];
      const weight = calculateCannibalizationEdgeWeight(a, b);
      if (weight < 0.45) continue;

      knowledgeGraphService.createKnowledgeEdge({
        sourceNodeId: `content:${a.id}`,
        targetNodeId: `content:${b.id}`,
        relation: "competes-with",
        weight,
        confidence: weight >= 0.7 ? "high" : weight >= 0.55 ? "medium" : "low",
        source: "semantic-analysis",
        evidence: [`Cannibalization score: ${weight.toFixed(2)}`],
        status: "suggested",
      });
    }
  }
  return knowledgeGraphService.snapshot();
}

export function findCompetingContentNodes(graph: KnowledgeGraphSnapshot): CannibalizationConflict[] {
  const conflicts: CannibalizationConflict[] = [];
  const competeEdges = graph.edges.filter((e) => e.relation === "competes-with" && e.status !== "rejected");

  for (const edge of competeEdges) {
    const source = graph.nodes.find((n) => n.id === edge.sourceNodeId);
    const target = graph.nodes.find((n) => n.id === edge.targetNodeId);
    if (!source?.contentItemId || !target?.contentItemId) continue;

    conflicts.push({
      id: edge.id,
      sourceContentItemId: source.contentItemId,
      targetContentItemId: target.contentItemId,
      sharedIntent: edge.weight >= 0.6,
      sharedEntities: [],
      titleSimilarity: edge.weight,
      anchorOverlap: [],
      severity: edge.weight >= 0.75 ? "high" : edge.weight >= 0.55 ? "medium" : "low",
      confidence: edge.confidence,
    });
  }
  return conflicts;
}

export function calculateCannibalizationEdgeWeight(source: CMSContentItem, target: CMSContentItem): number {
  let score = 0;
  const factors: number[] = [];

  if (source.clusterId && source.clusterId === target.clusterId) {
    score += 0.15;
    factors.push(0.15);
  }

  const keywordA = source.seo.targetKeyword?.toLowerCase();
  const keywordB = target.seo.targetKeyword?.toLowerCase();
  if (keywordA && keywordB && keywordA === keywordB) {
    score += 0.35;
    factors.push(0.35);
  }

  const titleSim = tokenOverlap(source.title, target.title);
  if (titleSim > 0.5) {
    score += titleSim * 0.25;
    factors.push(titleSim * 0.25);
  }

  if (source.seo.cannibalizationRisk === "high" || target.seo.cannibalizationRisk === "high") {
    score += 0.1;
  }

  // Semantic similarity alone is insufficient — require at least two signals
  if (factors.length < 2 && score < 0.5) return Math.min(score, 0.4);

  return Math.min(1, score);
}

export function classifyCannibalizationConflict(
  conflict: CannibalizationConflict,
): "intent-overlap" | "keyword-collision" | "structural-duplication" | "low-risk" {
  if (conflict.titleSimilarity >= 0.7 && conflict.sharedIntent) return "intent-overlap";
  if (conflict.titleSimilarity >= 0.6) return "structural-duplication";
  if (conflict.sharedIntent) return "keyword-collision";
  return "low-risk";
}

export function recommendKeepMergeCanonicalOrRewrite(
  conflict: CannibalizationConflict,
  items: CMSContentItem[],
): { action: "keep-separate" | "merge-review" | "canonical-review" | "rewrite-intent"; reason: string } {
  const source = items.find((i) => i.id === conflict.sourceContentItemId);
  const target = items.find((i) => i.id === conflict.targetContentItemId);
  if (!source || !target) {
    return { action: "keep-separate", reason: "Missing content items" };
  }

  if (conflict.severity === "high" && conflict.sharedIntent) {
    if (source.indexing.canonicalUrl || target.indexing.canonicalUrl) {
      return { action: "canonical-review", reason: "High overlap with existing canonical signals" };
    }
    return { action: "rewrite-intent", reason: "High intent overlap — differentiate or merge after review" };
  }

  if (conflict.severity === "medium") {
    return { action: "merge-review", reason: "Moderate overlap requires editorial review" };
  }

  return { action: "keep-separate", reason: "Insufficient cannibalization evidence" };
}

export function findInternalLinksReinforcingWrongPage(
  conflict: CannibalizationConflict,
): string[] {
  const links = knowledgeGraphStore.listLinkRecords().filter(
    (l) =>
      l.status === "active" &&
      l.targetContentItemId === conflict.targetContentItemId &&
      l.sourceContentItemId !== conflict.sourceContentItemId,
  );
  return links.map((l) => l.id);
}

export function recommendCannibalizationLinkCorrection(
  conflict: CannibalizationConflict,
): LinkRecommendation[] {
  return findInternalLinksReinforcingWrongPage(conflict).map((linkId) => {
    const link = knowledgeGraphStore.getLinkRecord(linkId)!;
    return {
      id: randomUUID(),
      sourceContentItemId: link.sourceContentItemId,
      targetContentItemId: conflict.sourceContentItemId,
      relation: "links-to",
      score: 55,
      confidence: "low",
      factors: {
        semanticRelevance: 0.5,
        entityOverlap: 0.5,
        clusterRelationship: 0.5,
        userJourneyValue: 0.4,
        businessValue: 0.4,
        targetPriority: 0.5,
        targetDepth: 0.5,
        targetAuthorityNeed: 0.5,
        duplicationPenalty: 0.3,
        anchorRiskPenalty: 0.2,
        linkDensityPenalty: 0,
      },
      suggestedAnchors: [],
      explanation: "Review internal links reinforcing competing page",
      evidence: [`cannibalization conflict ${conflict.id}`, `link ${linkId}`],
      status: "suggested",
      createdAt: new Date().toISOString(),
    };
  });
}

export const cannibalizationGraphService = {
  buildCannibalizationGraph,
  findCompetingContentNodes,
  calculateCannibalizationEdgeWeight,
  classifyCannibalizationConflict,
  recommendKeepMergeCanonicalOrRewrite,
  findInternalLinksReinforcingWrongPage,
  recommendCannibalizationLinkCorrection,
};
