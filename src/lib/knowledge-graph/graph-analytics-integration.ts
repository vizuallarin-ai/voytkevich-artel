import type { InternalLinkRecord } from "@/types/internal-link";
import type { KnowledgeEdge, KnowledgeGraphSnapshot } from "@/types/knowledge-graph";

export type LinkPerformanceMetrics = {
  linkId: string;
  clicks: number;
  impressions: number;
  ctr: number | null;
  assistedConversions: number;
  leads: number;
};

export type EdgePerformanceMetrics = {
  edgeId: string;
  clicks: number;
  transitions: number;
  assistedConversions: number;
};

export function attachLinkPerformanceToGraph(
  links: InternalLinkRecord[],
  analytics: Record<string, LinkPerformanceMetrics>,
): InternalLinkRecord[] {
  return links.map((link) => {
    const metrics = analytics[link.id];
    if (!metrics) return link;
    return {
      ...link,
      relevanceScore: metrics.ctr ?? link.relevanceScore,
      lastCheckedAt: new Date().toISOString(),
    };
  });
}

export function calculateEdgePerformance(
  edge: KnowledgeEdge,
  analytics?: Record<string, EdgePerformanceMetrics>,
): EdgePerformanceMetrics {
  const metrics = analytics?.[edge.id];
  return {
    edgeId: edge.id,
    clicks: metrics?.clicks ?? 0,
    transitions: metrics?.transitions ?? 0,
    assistedConversions: metrics?.assistedConversions ?? 0,
  };
}

export function findHighValueTransitions(
  graph: KnowledgeGraphSnapshot,
  analytics?: Record<string, EdgePerformanceMetrics>,
): Array<{ edgeId: string; score: number }> {
  return graph.edges
    .map((edge) => {
      const perf = calculateEdgePerformance(edge, analytics);
      const score = perf.transitions * 0.6 + perf.assistedConversions * 2 + perf.clicks * 0.3;
      return { edgeId: edge.id, score };
    })
    .filter((e) => e.score > 0)
    .sort((a, b) => b.score - a.score);
}

export function findUnusedInternalLinks(
  graph: KnowledgeGraphSnapshot,
  links: InternalLinkRecord[],
  analytics?: Record<string, LinkPerformanceMetrics>,
): InternalLinkRecord[] {
  return links.filter((link) => {
    const metrics = analytics?.[link.id];
    if (!metrics) return false;
    return metrics.clicks === 0 && metrics.impressions > 50;
  });
}

export function findLinksWithAssistedConversions(
  links: InternalLinkRecord[],
  analytics: Record<string, LinkPerformanceMetrics>,
): InternalLinkRecord[] {
  return links.filter((l) => (analytics[l.id]?.assistedConversions ?? 0) > 0);
}

export function compareRecommendedVsAppliedLinks(period: { from: string; to: string }): {
  recommended: number;
  applied: number;
  conversionRate: number | null;
} {
  return {
    recommended: 0,
    applied: 0,
    conversionRate: null,
  };
}

export function measureOrphanRecoveryImpact(period: { from: string; to: string }): {
  orphansBefore: number;
  orphansAfter: number;
  linksAdded: number;
} {
  return { orphansBefore: 0, orphansAfter: 0, linksAdded: 0 };
}

export function measureClusterHealthChange(period: { from: string; to: string }): {
  averageHealthBefore: number | null;
  averageHealthAfter: number | null;
} {
  return { averageHealthBefore: null, averageHealthAfter: null };
}

export const graphAnalyticsIntegration = {
  attachLinkPerformanceToGraph,
  calculateEdgePerformance,
  findHighValueTransitions,
  findUnusedInternalLinks,
  findLinksWithAssistedConversions,
  compareRecommendedVsAppliedLinks,
  measureOrphanRecoveryImpact,
  measureClusterHealthChange,
};
