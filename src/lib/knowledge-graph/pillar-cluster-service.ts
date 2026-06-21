import type { ContentClusterGraph, PillarClusterRole } from "@/types/content-cluster-graph";
import type { CMSContentItem } from "@/types/content-cms";
import type { SemanticCluster } from "@/types/semantic-clusters";
import type { LinkRecommendation } from "@/types/link-recommendation";
import { randomUUID } from "crypto";
import { seoClusters } from "@/data/seo-clusters";
import { contentGraphService } from "@/lib/knowledge-graph/content-graph-service";
import { knowledgeGraphStore } from "@/lib/knowledge-graph/knowledge-graph-store";

export type ClusterMemberScore = {
  contentItemId: string;
  role: PillarClusterRole;
  score: number;
  reasons: string[];
};

function clusterItems(clusterId: string, items: CMSContentItem[]): CMSContentItem[] {
  return items.filter((i) => i.clusterId === clusterId);
}

export function identifyPillarCandidates(
  cluster: SemanticCluster,
  items: CMSContentItem[],
): ClusterMemberScore[] {
  const members = clusterItems(cluster.id, items);
  return members.map((item) => {
    const reasons: string[] = [];
    let score = 0;

    if (item.contentType?.includes("service") || item.url.includes("pod-klyuch")) {
      score += 30;
      reasons.push("commercial breadth");
    }
    if (item.indexing.indexable) {
      score += 15;
      reasons.push("indexable");
    }
    if (item.seo.priority === "P1" || item.seo.priority === "P2") {
      score += 20;
      reasons.push("priority signal");
    }
    const incoming = contentGraphService.getIncomingContentLinks(item.id).length;
    score += Math.min(incoming * 3, 25);
    if (incoming >= 3) reasons.push("incoming link authority");

    const wordProxy = (item.seo.secondaryKeywords?.length ?? 0) * 50 + (item.title.length > 40 ? 100 : 200);
    if (wordProxy > 800) {
      score += 5;
      reasons.push("topic breadth heuristic");
    }

    return {
      contentItemId: item.id,
      role: (score >= 50 ? "pillar" : "cluster") as PillarClusterRole,
      score,
      reasons,
    };
  }).sort((a, b) => b.score - a.score);
}

export function identifyHubCandidates(
  cluster: SemanticCluster,
  items: CMSContentItem[],
): ClusterMemberScore[] {
  return identifyPillarCandidates(cluster, items)
    .filter((c) => c.score >= 35 && c.score < 55)
    .map((c) => ({ ...c, role: "hub" as PillarClusterRole }));
}

export function assignClusterRoles(
  cluster: SemanticCluster,
  items: CMSContentItem[],
): Map<string, PillarClusterRole> {
  const roles = new Map<string, PillarClusterRole>();
  const candidates = identifyPillarCandidates(cluster, items);
  const pillar = candidates[0];
  if (pillar && pillar.score >= 45) {
    roles.set(pillar.contentItemId, "pillar");
  }

  for (const item of clusterItems(cluster.id, items)) {
    if (roles.has(item.id)) continue;
    if (item.url.includes("/calculator") || item.contentType?.includes("service")) {
      roles.set(item.id, "commercial-destination");
    } else if (contentGraphService.getIncomingContentLinks(item.id).length >= 2) {
      roles.set(item.id, "supporting");
    } else {
      roles.set(item.id, "cluster");
    }
  }

  for (const hub of identifyHubCandidates(cluster, items)) {
    if (!roles.has(hub.contentItemId)) {
      roles.set(hub.contentItemId, "hub");
    }
  }

  return roles;
}

function computeClusterCoverage(
  cluster: SemanticCluster,
  items: CMSContentItem[],
): ContentClusterGraph["coverage"] {
  const members = clusterItems(cluster.id, items);
  const expectedTopics = cluster.keywords.slice(0, 10);
  const coveredTopics = members
    .map((m) => m.seo.targetKeyword)
    .filter(Boolean) as string[];
  const coveredSet = new Set(coveredTopics.map((t) => t.toLowerCase()));
  const missingTopics = expectedTopics.filter((t) => !coveredSet.has(t.toLowerCase()));
  const duplicateTopics = coveredTopics.filter(
    (t, i) => coveredTopics.indexOf(t) !== i,
  );
  return { expectedTopics, coveredTopics, missingTopics, duplicateTopics };
}

export function buildPillarClusterGraph(
  cluster: SemanticCluster,
  items: CMSContentItem[],
): ContentClusterGraph {
  const members = clusterItems(cluster.id, items);
  const roles = assignClusterRoles(cluster, items);
  const pillar = [...roles.entries()].find(([, r]) => r === "pillar");
  const hubs = [...roles.entries()].filter(([, r]) => r === "hub").map(([id]) => `content:${id}`);
  const commercial = [...roles.entries()]
    .filter(([, r]) => r === "commercial-destination")
    .map(([id]) => `content:${id}`);

  const coverage = computeClusterCoverage(cluster, items);
  const health = calculateClusterHealth(cluster, items, coverage);

  return {
    id: randomUUID(),
    clusterId: cluster.id,
    title: cluster.title,
    pillarNodeId: pillar ? `content:${pillar[0]}` : undefined,
    hubNodeIds: hubs,
    memberNodeIds: members.map((m) => `content:${m.id}`),
    commercialDestinationNodeIds: commercial,
    coverage,
    health,
    updatedAt: new Date().toISOString(),
  };
}

export function calculateClusterCoverage(
  cluster: SemanticCluster,
  items: CMSContentItem[],
): ContentClusterGraph["coverage"] {
  return computeClusterCoverage(cluster, items);
}

export function findMissingClusterTopics(cluster: SemanticCluster, items: CMSContentItem[]): string[] {
  return calculateClusterCoverage(cluster, items).missingTopics;
}

export function findDuplicateClusterIntent(cluster: SemanticCluster, items: CMSContentItem[]): string[] {
  return calculateClusterCoverage(cluster, items).duplicateTopics;
}

export function findWeakClusterConnections(
  cluster: SemanticCluster,
  items: CMSContentItem[],
): string[] {
  const weak: string[] = [];
  for (const item of clusterItems(cluster.id, items)) {
    const inLinks = contentGraphService.getIncomingContentLinks(item.id).length;
    const outLinks = contentGraphService.getOutgoingContentLinks(item.id).length;
    if (inLinks + outLinks < 2) weak.push(item.id);
  }
  return weak;
}

export function recommendPillarClusterLinks(
  cluster: SemanticCluster,
  items: CMSContentItem[],
): LinkRecommendation[] {
  const graph = buildPillarClusterGraph(cluster, items);
  const recommendations: LinkRecommendation[] = [];
  if (!graph.pillarNodeId) return recommendations;

  const pillarItemId = graph.pillarNodeId.replace("content:", "");
  for (const memberId of graph.memberNodeIds) {
    const targetId = memberId.replace("content:", "");
    if (targetId === pillarItemId) continue;
    const hasLink = contentGraphService.getOutgoingContentLinks(targetId).includes(pillarItemId);
    if (hasLink) continue;

    recommendations.push({
      id: randomUUID(),
      sourceContentItemId: targetId,
      targetContentItemId: pillarItemId,
      relation: "cluster-member",
      score: 72,
      confidence: "medium",
      factors: {
        semanticRelevance: 0.7,
        entityOverlap: 0.8,
        clusterRelationship: 1,
        userJourneyValue: 0.6,
        businessValue: 0.5,
        targetPriority: 0.7,
        targetDepth: 0.5,
        targetAuthorityNeed: 0.8,
        duplicationPenalty: 0,
        anchorRiskPenalty: 0,
        linkDensityPenalty: 0,
      },
      suggestedAnchors: [cluster.title],
      suggestedPlacement: "related-content",
      explanation: `Strengthen cluster link to pillar for ${cluster.title}`,
      evidence: ["pillar-cluster architecture"],
      status: "suggested",
      createdAt: new Date().toISOString(),
    });
  }
  return recommendations;
}

export function calculateClusterHealth(
  cluster: SemanticCluster,
  items: CMSContentItem[],
  coverageOverride?: ContentClusterGraph["coverage"],
): ContentClusterGraph["health"] {
  const members = clusterItems(cluster.id, items);
  let orphanCount = 0;
  let brokenLinkCount = 0;
  let totalDepth = 0;
  let depthCount = 0;

  const graph = contentGraphService.buildContentGraph(members);
  for (const item of members) {
    const incoming = contentGraphService.getIncomingContentLinks(item.id).length;
    if (incoming === 0 && item.indexing.indexable) orphanCount++;
    const depth = contentGraphService.calculateContentGraphDepth(item.id, graph);
    if (depth >= 0) {
      totalDepth += depth;
      depthCount++;
    }
  }

  for (const link of knowledgeGraphStore.listLinkRecords()) {
    if (link.status === "broken" && members.some((m) => m.id === link.sourceContentItemId)) {
      brokenLinkCount++;
    }
  }

  const coverage = coverageOverride ?? computeClusterCoverage(cluster, items);
  const coverageScore = coverage.expectedTopics.length
    ? (coverage.coveredTopics.length / coverage.expectedTopics.length) * 40
    : 20;
  const orphanPenalty = orphanCount * 5;
  const score = Math.max(0, Math.min(100, coverageScore + 30 - orphanPenalty - brokenLinkCount * 3));

  return {
    score: Math.round(score),
    orphanCount,
    brokenLinkCount,
    cannibalizationCount: coverage.duplicateTopics.length,
    averageDepth: depthCount ? totalDepth / depthCount : null,
  };
}

export const pillarClusterService = {
  identifyPillarCandidates,
  identifyHubCandidates,
  assignClusterRoles,
  buildPillarClusterGraph,
  calculateClusterCoverage,
  findMissingClusterTopics,
  findDuplicateClusterIntent,
  findWeakClusterConnections,
  recommendPillarClusterLinks,
  calculateClusterHealth,
  listSeoClusters: () => seoClusters,
};
