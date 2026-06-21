import type { KnowledgeGraphSnapshot, KnowledgeNode } from "@/types/knowledge-graph";
import type { CMSContentItem } from "@/types/content-cms";
import { cmsPriorityIntegration } from "@/lib/content-prioritization/cms-priority-integration";
import { contentGraphService } from "@/lib/knowledge-graph/content-graph-service";
import { knowledgeGraphStore } from "@/lib/knowledge-graph/knowledge-graph-store";

export function applyPrioritySignalsToGraph(nodes: KnowledgeNode[]): KnowledgeNode[] {
  return nodes.map((node) => {
    if (!node.contentItemId) return node;
    const score = cmsPriorityIntegration.getCachedScore(node.contentItemId);
    if (!score) return node;
    return {
      ...node,
      metadata: {
        ...node.metadata,
        priorityLevel: score.level,
        priorityScore: score.score,
      },
    };
  });
}

export function findHighPriorityWeaklyConnectedPages(
  graph: KnowledgeGraphSnapshot,
  items: CMSContentItem[],
): Array<{ contentItemId: string; priority: string; connectionCount: number }> {
  const contentGraph = contentGraphService.buildContentGraph(items);
  const results: Array<{ contentItemId: string; priority: string; connectionCount: number }> = [];

  for (const item of items) {
    const score = cmsPriorityIntegration.getCachedScore(item.id);
    const priority = score?.level ?? item.seo.priority;
    if (priority !== "P1" && priority !== "P2") continue;

    const incoming = contentGraphService.getIncomingContentLinks(item.id).length;
    const outgoing = contentGraphService.getOutgoingContentLinks(item.id).length;
    const connectionCount = incoming + outgoing;
    if (connectionCount < 3) {
      results.push({ contentItemId: item.id, priority: priority ?? "unknown", connectionCount });
    }
  }
  return results;
}

export function recommendAuthorityFlowToPriorityPages(
  graph: KnowledgeGraphSnapshot,
  items: CMSContentItem[],
): string[] {
  const weak = findHighPriorityWeaklyConnectedPages(graph, items);
  return weak.map(
    (w) => `Recommend contextual links toward priority page ${w.contentItemId} (${w.priority}, ${w.connectionCount} connections)`,
  );
}

export function findOverlinkedLowValuePages(items: CMSContentItem[]): string[] {
  const overlinked: string[] = [];
  for (const item of items) {
    const score = cmsPriorityIntegration.getCachedScore(item.id);
    const priority = score?.level ?? item.seo.priority;
    if (priority === "P1" || priority === "P2") continue;

    const incoming = contentGraphService.getIncomingContentLinks(item.id).length;
    if (incoming > 15) overlinked.push(item.id);
  }
  return overlinked;
}

export function explainGraphPriorityRecommendation(node: KnowledgeNode): string {
  const level = node.metadata.priorityLevel ?? "unknown";
  return `Node ${node.title} has priority ${level}; link recommendations must remain contextually relevant`;
}

export function sendGraphFeedbackToPrioritySystem(node: KnowledgeNode): {
  contentItemId?: string;
  feedback: string;
  requiresManualApproval: true;
} {
  knowledgeGraphStore.logAudit({
    action: "graph_feedback_to_priority",
    entityType: "node",
    entityId: node.id,
    contentItemId: node.contentItemId,
  });
  return {
    contentItemId: node.contentItemId,
    feedback: explainGraphPriorityRecommendation(node),
    requiresManualApproval: true,
  };
}

export const priorityGraphIntegration = {
  applyPrioritySignalsToGraph,
  findHighPriorityWeaklyConnectedPages,
  recommendAuthorityFlowToPriorityPages,
  findOverlinkedLowValuePages,
  explainGraphPriorityRecommendation,
  sendGraphFeedbackToPrioritySystem,
};
