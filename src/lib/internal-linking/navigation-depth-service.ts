import type { CMSContentItem } from "@/types/content-cms";
import type { ContentGraph } from "@/lib/knowledge-graph/content-graph-service";
import type { SemanticCluster } from "@/types/semantic-clusters";
import { contentGraphService } from "@/lib/knowledge-graph/content-graph-service";

const HOME_URLS = ["/", "/stroitelstvo-domov-pod-klyuch-irkutsk"];

export function calculateClickDepth(
  pageId: string,
  graph: ContentGraph,
  rootIds?: string[],
): number {
  const roots = rootIds ?? graph.contentItemIds.filter((id) => {
    return contentGraphService.getIncomingContentLinks(id).length === 0;
  });

  let minDepth = Infinity;
  for (const root of roots) {
    const depth = contentGraphService.calculateContentGraphDepth(pageId, graph, root);
    if (depth >= 0) minDepth = Math.min(minDepth, depth);
  }
  return minDepth === Infinity ? -1 : minDepth;
}

export function calculateDepthFromHome(pageId: string, items: CMSContentItem[]): number {
  const homeIds = items.filter((i) => HOME_URLS.includes(i.url)).map((i) => i.id);
  const graph = contentGraphService.buildContentGraph(items);
  return calculateClickDepth(pageId, graph, homeIds.length ? homeIds : undefined);
}

export function calculateDepthFromRelevantHub(
  pageId: string,
  hubId: string,
  items: CMSContentItem[],
): number {
  const graph = contentGraphService.buildContentGraph(items);
  return contentGraphService.calculateContentGraphDepth(pageId, graph, hubId);
}

export function findHighValueDeepPages(
  items: CMSContentItem[],
  minDepth = 4,
): Array<{ contentItemId: string; depth: number; priority?: string }> {
  const graph = contentGraphService.buildContentGraph(items);
  const results: Array<{ contentItemId: string; depth: number; priority?: string }> = [];

  for (const item of items) {
    if (!item.indexing.indexable) continue;
    const depth = calculateDepthFromHome(item.id, items);
    if (depth >= minDepth && (item.seo.priority === "P1" || item.seo.priority === "P2")) {
      results.push({ contentItemId: item.id, depth, priority: item.seo.priority });
    }
  }
  return results.sort((a, b) => b.depth - a.depth);
}

export function findUnnecessaryNavigationChains(
  items: CMSContentItem[],
): Array<{ chain: string[]; reason: string }> {
  const chains: Array<{ chain: string[]; reason: string }> = [];
  const graph = contentGraphService.buildContentGraph(items);

  for (const item of items) {
    const outgoing = graph.adjacency.get(item.id) ?? [];
    if (outgoing.length === 1) {
      const next = outgoing[0];
      const nextOut = graph.adjacency.get(next) ?? [];
      if (nextOut.length === 1) {
        chains.push({
          chain: [item.id, next, nextOut[0]],
          reason: "Linear chain without branching value",
        });
      }
    }
  }
  return chains.slice(0, 20);
}

export function recommendDepthReduction(
  pageId: string,
  items: CMSContentItem[],
): string[] {
  const depth = calculateDepthFromHome(pageId, items);
  if (depth < 4) return [];
  return [
    `Page depth ${depth} from home — consider hub or cross-cluster link`,
    "Add incoming link from pillar or category page",
  ];
}

export function calculateAverageClusterDepth(
  cluster: SemanticCluster,
  items: CMSContentItem[],
): number | null {
  const members = items.filter((i) => i.clusterId === cluster.id && i.indexing.indexable);
  if (!members.length) return null;
  const graph = contentGraphService.buildContentGraph(items);
  let total = 0;
  let count = 0;
  for (const item of members) {
    const depth = calculateClickDepth(item.id, graph);
    if (depth >= 0) {
      total += depth;
      count++;
    }
  }
  return count ? total / count : null;
}

export const navigationDepthService = {
  calculateClickDepth,
  calculateDepthFromHome,
  calculateDepthFromRelevantHub,
  findHighValueDeepPages,
  findUnnecessaryNavigationChains,
  recommendDepthReduction,
  calculateAverageClusterDepth,
};
