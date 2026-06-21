import { contentRepository } from "@/lib/content-cms/content-repository";
import { knowledgeGraphService } from "@/lib/knowledge-graph/knowledge-graph-service";
import { graphValidator } from "@/lib/knowledge-graph/graph-validator";
import { entityRegistry } from "@/lib/knowledge-graph/entity-registry";
import { entityNormalizationService } from "@/lib/knowledge-graph/entity-normalization-service";
import { contentGraphService } from "@/lib/knowledge-graph/content-graph-service";
import { pillarClusterService } from "@/lib/knowledge-graph/pillar-cluster-service";
import { cannibalizationGraphService } from "@/lib/knowledge-graph/cannibalization-graph-service";
import { userJourneyGraphService } from "@/lib/knowledge-graph/user-journey-graph-service";
import { orphanPageService } from "@/lib/internal-linking/orphan-page-service";
import { linkOpportunityService } from "@/lib/internal-linking/link-opportunity-service";
import { internalLinkInventoryService } from "@/lib/internal-linking/internal-link-inventory-service";
import { linkReviewService } from "@/lib/internal-linking/link-review-service";
import { knowledgeGraphStore } from "@/lib/knowledge-graph/knowledge-graph-store";
import { semanticClusterService } from "@/lib/content-prioritization/semantic-cluster-service";
import type { KnowledgeGraphSnapshot } from "@/types/knowledge-graph";

export type KnowledgeGraphDashboardData = {
  kpis: {
    nodes: number;
    edges: number;
    activeEdges: number;
    suggestedEdges: number;
    entities: number;
    orphanPages: number;
    suggestedLinks: number;
    validationErrors: number;
    cannibalizationConflicts: number;
  };
  graph: KnowledgeGraphSnapshot;
  validation: ReturnType<typeof graphValidator.getGraphValidationSummary>;
  subgraph: {
    nodes: KnowledgeGraphSnapshot["nodes"];
    edges: KnowledgeGraphSnapshot["edges"];
  };
};

export async function getMainKnowledgeGraphDashboardData(): Promise<KnowledgeGraphDashboardData> {
  const items = await contentRepository.listContent();
  const graph = await knowledgeGraphService.buildKnowledgeGraph({ contentItems: items, incremental: false });
  const contentGraph = contentGraphService.buildContentGraph(items);
  const orphans = orphanPageService.detectOrphanPages(contentGraph, items);
  const validation = graphValidator.getGraphValidationSummary(graph);
  const cannibalizationSnapshot = cannibalizationGraphService.buildCannibalizationGraph(items);
  const cannibalizationConflicts = cannibalizationGraphService.findCompetingContentNodes(cannibalizationSnapshot);

  const activeEdges = graph.edges.filter((e) => e.status === "active").length;
  const suggestedEdges = graph.edges.filter((e) => e.status === "suggested").length;
  const suggestedLinks = knowledgeGraphStore.listRecommendations().filter((r) => r.status === "suggested").length;

  return {
    kpis: {
      nodes: graph.nodes.length,
      edges: graph.edges.length,
      activeEdges,
      suggestedEdges,
      entities: entityRegistry.listEntities().length,
      orphanPages: orphans.length,
      suggestedLinks,
      validationErrors: validation.errorCount,
      cannibalizationConflicts: cannibalizationConflicts.length,
    },
    graph,
    validation,
    subgraph: {
      nodes: graph.nodes.slice(0, 80),
      edges: graph.edges.slice(0, 120),
    },
  };
}

export async function getInternalLinkingDashboardData() {
  const items = await contentRepository.listContent();
  const inventory = await internalLinkInventoryService.buildInternalLinkInventory(items);
  const summary = internalLinkInventoryService.getInternalLinkInventorySummary();
  const firstItem = items.find((i) => i.indexing.indexable) ?? items[0];
  const opportunities = firstItem
    ? await linkOpportunityService.findLinkOpportunities(firstItem, {
        nodes: knowledgeGraphStore.listNodes(),
        edges: knowledgeGraphStore.listEdges(),
        builtAt: new Date().toISOString(),
      })
    : [];

  return {
    inventory,
    summary,
    sampleOpportunities: opportunities.slice(0, 20),
    recommendations: knowledgeGraphStore.listRecommendations(),
    batches: knowledgeGraphStore.listBatches(),
  };
}

export async function getOrphanPagesDashboardData() {
  const items = await contentRepository.listContent();
  const graph = contentGraphService.buildContentGraph(items);
  const orphans = orphanPageService.detectOrphanPages(graph, items);

  return {
    orphans: orphans.map((page) => ({
      contentItemId: page.id,
      url: page.url,
      classification: orphanPageService.classifyOrphanPage(page, graph),
      severity: orphanPageService.calculateOrphanSeverity(page, {
        classification: orphanPageService.classifyOrphanPage(page, graph),
      }),
      priority: page.seo.priority ?? "unknown",
      indexability: page.indexing.indexable ? "indexable" : "not-indexable",
      recovery: orphanPageService.recommendOrphanRecovery(page, items),
    })),
  };
}

export async function getClusterArchitectureDashboardData() {
  const clusters = await semanticClusterService.list();
  const items = await contentRepository.listContent();

  const architecture = await Promise.all(
    clusters.slice(0, 12).map(async (cluster) => {
      const graph = pillarClusterService.buildPillarClusterGraph(cluster, items);
      const health = pillarClusterService.calculateClusterHealth(cluster, items);
      const links = pillarClusterService.recommendPillarClusterLinks(cluster, items);
      return { cluster, graph, health, links: links.slice(0, 10) };
    }),
  );

  return { architecture };
}

export async function getCannibalizationDashboardData() {
  const items = await contentRepository.listContent();
  const snapshot = cannibalizationGraphService.buildCannibalizationGraph(items);
  return {
    conflicts: cannibalizationGraphService.findCompetingContentNodes(snapshot),
  };
}

export async function getUserJourneyDashboardData() {
  const items = await contentRepository.listContent();
  const graph = userJourneyGraphService.buildUserJourneyGraph(items);
  return {
    deadEnds: userJourneyGraphService.findJourneyDeadEnds(graph, items),
    missingSteps: userJourneyGraphService.findMissingJourneySteps(graph, items),
    transitions: graph.transitions.slice(0, 50),
  };
}

export async function getEntityNormalizationReport() {
  const entities = entityRegistry.listEntities();
  const duplicates = entityNormalizationService.detectEntityDuplicates(entities);
  return {
    entities: entities.length,
    duplicates,
    report: entityNormalizationService.buildEntityNormalizationReport(entities),
  };
}

export const knowledgeGraphDashboardService = {
  getMainKnowledgeGraphDashboardData,
  getInternalLinkingDashboardData,
  getOrphanPagesDashboardData,
  getClusterArchitectureDashboardData,
  getCannibalizationDashboardData,
  getUserJourneyDashboardData,
  getEntityNormalizationReport,
};
