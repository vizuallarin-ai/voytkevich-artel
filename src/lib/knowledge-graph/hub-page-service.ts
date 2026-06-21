import { randomUUID } from "crypto";
import type { ContentClusterGraph } from "@/types/content-cluster-graph";
import type { CMSContentItem } from "@/types/content-cms";
import type { SemanticCluster } from "@/types/semantic-clusters";
import type { KnowledgeGraphSnapshot } from "@/types/knowledge-graph";
import { pillarClusterService } from "@/lib/knowledge-graph/pillar-cluster-service";

export type HubPageNeed = {
  needed: boolean;
  reason: string;
  confidence: "low" | "medium" | "high";
};

export type HubPageStructure = {
  title: string;
  sections: Array<{ heading: string; linkedContentItemIds: string[] }>;
  navigationItems: Array<{ label: string; contentItemId: string }>;
};

export function detectHubPageNeed(cluster: SemanticCluster, items: CMSContentItem[]): HubPageNeed {
  const graph = pillarClusterService.buildPillarClusterGraph(cluster, items);
  if (graph.pillarNodeId && graph.hubNodeIds.length === 0 && graph.memberNodeIds.length >= 8) {
    return {
      needed: true,
      reason: "Large cluster without hub navigation layer",
      confidence: "medium",
    };
  }
  if (graph.coverage.missingTopics.length >= 3) {
    return {
      needed: true,
      reason: "Missing topics suggest navigational hub would help coverage",
      confidence: "low",
    };
  }
  if (graph.pillarNodeId && graph.memberNodeIds.length <= 6) {
    return {
      needed: false,
      reason: "Existing pillar/category likely sufficient for cluster size",
      confidence: "high",
    };
  }
  return { needed: false, reason: "No hub gap detected", confidence: "medium" };
}

export function recommendHubPageStructure(
  cluster: SemanticCluster,
  items: CMSContentItem[],
): HubPageStructure {
  const members = items.filter((i) => i.clusterId === cluster.id);
  const commercial = members.filter((i) => i.url.includes("calculator") || i.contentType?.includes("service"));
  const informational = members.filter((i) => i.kind === "technical-article" || i.kind === "editorial-content");

  return {
    title: `${cluster.title}: навигация по теме`,
    sections: [
      {
        heading: "Коммерческие страницы",
        linkedContentItemIds: commercial.map((i) => i.id),
      },
      {
        heading: "Полезные материалы",
        linkedContentItemIds: informational.map((i) => i.id),
      },
    ],
    navigationItems: members.slice(0, 12).map((i) => ({ label: i.title, contentItemId: i.id })),
  };
}

export function findExistingHubCandidate(
  cluster: SemanticCluster,
  items: CMSContentItem[],
): CMSContentItem | undefined {
  const hubs = pillarClusterService.identifyHubCandidates(cluster, items);
  const top = hubs[0];
  if (!top) return undefined;
  return items.find((i) => i.id === top.contentItemId);
}

export function createHubPageBrief(cluster: SemanticCluster, items: CMSContentItem[]): {
  briefId: string;
  clusterId: string;
  structure: HubPageStructure;
  requiresHumanReview: true;
} {
  return {
    briefId: randomUUID(),
    clusterId: cluster.id,
    structure: recommendHubPageStructure(cluster, items),
    requiresHumanReview: true,
  };
}

export function validateHubPageCandidate(page: CMSContentItem, cluster: SemanticCluster): {
  valid: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];
  if (page.clusterId !== cluster.id) {
    reasons.push("Page belongs to different cluster");
  }
  if (!page.indexing.indexable) {
    reasons.push("Hub candidate must be indexable");
  }
  if (page.seo.cannibalizationRisk === "high") {
    reasons.push("High cannibalization risk with existing pillar");
  }
  return { valid: reasons.length === 0, reasons };
}

export function recommendHubNavigation(
  page: CMSContentItem,
  graph: KnowledgeGraphSnapshot,
): Array<{ label: string; nodeId: string }> {
  const clusterMembers = graph.nodes.filter(
    (n) => n.clusterId === page.clusterId && n.contentItemId && n.contentItemId !== page.id,
  );
  return clusterMembers.slice(0, 10).map((n) => ({ label: n.title, nodeId: n.id }));
}

export const hubPageService = {
  detectHubPageNeed,
  recommendHubPageStructure,
  findExistingHubCandidate,
  createHubPageBrief,
  validateHubPageCandidate,
  recommendHubNavigation,
};
