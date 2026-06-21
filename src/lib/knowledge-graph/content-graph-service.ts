import type { CMSContentItem } from "@/types/content-cms";
import type { KnowledgeGraphSnapshot } from "@/types/knowledge-graph";
import { knowledgeGraphStore } from "@/lib/knowledge-graph/knowledge-graph-store";
import { knowledgeGraphService } from "@/lib/knowledge-graph/knowledge-graph-service";

export type ContentGraph = {
  contentItemIds: string[];
  adjacency: Map<string, string[]>;
  builtAt: string;
};

const COMMERCIAL_URL_PATTERNS = [
  /^\/calculator/,
  /^\/catalog/,
  /stroitelstvo-domov-pod-klyuch/,
  /smeta-na-stroitelstvo/,
  /^\/proektirovanie/,
];

function isCommercialUrl(url: string): boolean {
  return COMMERCIAL_URL_PATTERNS.some((p) => p.test(url));
}

export function buildContentGraph(contentItems: CMSContentItem[]): ContentGraph {
  const adjacency = new Map<string, string[]>();
  for (const item of contentItems) {
    adjacency.set(item.id, []);
  }

  for (const link of knowledgeGraphStore.listLinkRecords()) {
    if (link.status !== "active" || !link.targetContentItemId) continue;
    const outgoing = adjacency.get(link.sourceContentItemId) ?? [];
    if (!outgoing.includes(link.targetContentItemId)) {
      outgoing.push(link.targetContentItemId);
      adjacency.set(link.sourceContentItemId, outgoing);
    }
  }

  for (const edge of knowledgeGraphStore.listEdges()) {
    if (edge.relation !== "links-to" || edge.status !== "active") continue;
    const source = knowledgeGraphStore.getNode(edge.sourceNodeId);
    const target = knowledgeGraphStore.getNode(edge.targetNodeId);
    if (!source?.contentItemId || !target?.contentItemId) continue;
    const outgoing = adjacency.get(source.contentItemId) ?? [];
    if (!outgoing.includes(target.contentItemId)) {
      outgoing.push(target.contentItemId);
      adjacency.set(source.contentItemId, outgoing);
    }
  }

  return {
    contentItemIds: contentItems.map((i) => i.id),
    adjacency,
    builtAt: new Date().toISOString(),
  };
}

export function mapContentRelationships(contentItem: CMSContentItem): string[] {
  const related = [
    ...(contentItem.related.editorialContent ?? []),
    ...(contentItem.related.technicalArticles ?? []),
    ...(contentItem.related.programmaticPages ?? []),
    ...(contentItem.related.leadMagnets ?? []),
  ];
  return related;
}

export function getIncomingContentLinks(contentItemId: string): string[] {
  const incoming: string[] = [];
  for (const link of knowledgeGraphStore.listLinkRecords()) {
    if (link.targetContentItemId === contentItemId && link.status === "active") {
      incoming.push(link.sourceContentItemId);
    }
  }
  for (const edge of knowledgeGraphStore.listEdges()) {
    if (edge.relation !== "links-to" || edge.status !== "active") continue;
    const target = knowledgeGraphStore.getNode(edge.targetNodeId);
    const source = knowledgeGraphStore.getNode(edge.sourceNodeId);
    if (target?.contentItemId === contentItemId && source?.contentItemId) {
      incoming.push(source.contentItemId);
    }
  }
  return [...new Set(incoming)];
}

export function getOutgoingContentLinks(contentItemId: string): string[] {
  const outgoing: string[] = [];
  for (const link of knowledgeGraphStore.listLinkRecords()) {
    if (link.sourceContentItemId === contentItemId && link.status === "active" && link.targetContentItemId) {
      outgoing.push(link.targetContentItemId);
    }
  }
  return [...new Set(outgoing)];
}

export function getRelatedContent(contentItemId: string, items: CMSContentItem[]): CMSContentItem[] {
  const item = items.find((i) => i.id === contentItemId);
  if (!item) return [];
  const relatedIds = new Set([
    ...getOutgoingContentLinks(contentItemId),
    ...mapContentRelationships(item),
  ]);
  return items.filter((i) => relatedIds.has(i.id));
}

export function getCommercialDestinations(contentItemId: string, items: CMSContentItem[]): CMSContentItem[] {
  return getOutgoingContentLinks(contentItemId)
    .map((id) => items.find((i) => i.id === id))
    .filter((i): i is CMSContentItem => Boolean(i && isCommercialUrl(i.url)));
}

export function getInformationalSupportPages(contentItemId: string, items: CMSContentItem[]): CMSContentItem[] {
  return getOutgoingContentLinks(contentItemId)
    .map((id) => items.find((i) => i.id === id))
    .filter(
      (i): i is CMSContentItem =>
        Boolean(i && (i.kind === "technical-article" || i.kind === "editorial-content")),
    );
}

export function findDisconnectedContentComponents(graph: ContentGraph): string[][] {
  const visited = new Set<string>();
  const components: string[][] = [];

  function dfs(id: string, component: string[]): void {
    visited.add(id);
    component.push(id);
    const neighbors = graph.adjacency.get(id) ?? [];
    for (const n of neighbors) {
      if (!visited.has(n)) dfs(n, component);
    }
    for (const [source, targets] of graph.adjacency) {
      if (targets.includes(id) && !visited.has(source)) dfs(source, component);
    }
  }

  for (const id of graph.contentItemIds) {
    if (visited.has(id)) continue;
    const component: string[] = [];
    dfs(id, component);
    components.push(component);
  }
  return components;
}

export function calculateContentGraphCentrality(nodeId: string, graph: ContentGraph): number {
  let inCount = 0;
  for (const [, targets] of graph.adjacency) {
    if (targets.includes(nodeId)) inCount++;
  }
  const outCount = graph.adjacency.get(nodeId)?.length ?? 0;
  const total = graph.contentItemIds.length || 1;
  return (inCount + outCount) / total;
}

export function calculateContentGraphDepth(nodeId: string, graph: ContentGraph, rootId?: string): number {
  const roots = rootId ? [rootId] : graph.contentItemIds.filter((id) => getIncomingContentLinks(id).length === 0);
  let minDepth = Infinity;

  for (const root of roots) {
    const queue: Array<{ id: string; depth: number }> = [{ id: root, depth: 0 }];
    const visited = new Set<string>();
    while (queue.length > 0) {
      const current = queue.shift();
      if (!current) break;
      if (visited.has(current.id)) continue;
      visited.add(current.id);
      if (current.id === nodeId) {
        minDepth = Math.min(minDepth, current.depth);
        break;
      }
      for (const next of graph.adjacency.get(current.id) ?? []) {
        queue.push({ id: next, depth: current.depth + 1 });
      }
    }
  }

  return minDepth === Infinity ? -1 : minDepth;
}

export const contentGraphService = {
  buildContentGraph,
  mapContentRelationships,
  getIncomingContentLinks,
  getOutgoingContentLinks,
  getRelatedContent,
  getCommercialDestinations,
  getInformationalSupportPages,
  findDisconnectedContentComponents,
  calculateContentGraphCentrality,
  calculateContentGraphDepth,
};
