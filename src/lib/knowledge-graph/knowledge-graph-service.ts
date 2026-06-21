import { randomUUID } from "crypto";
import type {
  KnowledgeEdge,
  KnowledgeGraphSnapshot,
  KnowledgeNode,
  KnowledgeNodeType,
} from "@/types/knowledge-graph";
import type { CMSContentItem } from "@/types/content-cms";
import { contentRepository } from "@/lib/content-cms/content-repository";
import { isValidRelation } from "@/data/knowledge-relation-rules";
import { KNOWLEDGE_EDGE_WEIGHT_MAX, KNOWLEDGE_EDGE_WEIGHT_MIN } from "@/types/knowledge-graph";
import { knowledgeGraphStore } from "@/lib/knowledge-graph/knowledge-graph-store";
import { entityResolutionService } from "@/lib/knowledge-graph/entity-resolution-service";
import { normalizeEntityName, normalizeEntitySlug } from "@/lib/knowledge-graph/entity-normalization-service";
import { graphValidator } from "@/lib/knowledge-graph/graph-validator";

export type BuildGraphContext = {
  contentItems?: CMSContentItem[];
  incremental?: boolean;
};

function snapshot(): KnowledgeGraphSnapshot {
  return {
    nodes: knowledgeGraphStore.listNodes(),
    edges: knowledgeGraphStore.listEdges(),
    builtAt: new Date().toISOString(),
  };
}

function mapContentStatus(item: CMSContentItem): KnowledgeNode["status"] {
  if (item.status === "draft") return "draft";
  if (item.status === "review" || item.status === "needs-expert-review") return "review";
  if (item.status === "archived") return "archived";
  return "active";
}

function mapIndexability(item: CMSContentItem): KnowledgeNode["indexability"] {
  if (item.indexing.indexable) return "indexable";
  if (item.quality.shouldNoindex || !item.indexing.robots.index) return "not-indexable";
  return "unknown";
}

function contentToNode(item: CMSContentItem): KnowledgeNode {
  return {
    id: `content:${item.id}`,
    type: "content",
    title: item.title,
    slug: item.slug,
    canonicalUrl: item.indexing.canonicalUrl ?? item.url,
    aliases: item.seo.secondaryKeywords ?? [],
    normalizedName: normalizeEntityName(item.title),
    contentItemId: item.id,
    clusterId: item.clusterId,
    status: mapContentStatus(item),
    indexability: mapIndexability(item),
    metadata: {
      kind: item.kind,
      contentType: item.contentType ?? "",
      priority: item.seo.priority ?? "",
    },
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export async function buildKnowledgeGraph(context: BuildGraphContext = {}): Promise<KnowledgeGraphSnapshot> {
  const items = context.contentItems ?? (await contentRepository.listContent());
  if (!context.incremental) {
    knowledgeGraphStore.clear();
  }

  for (const item of items) {
    const node = contentToNode(item);
    knowledgeGraphStore.saveNode(node);
    knowledgeGraphStore.logAudit({
      action: "node_synced",
      entityType: "node",
      entityId: node.id,
      contentItemId: item.id,
    });

    const extracted = entityResolutionService.extractEntitiesFromContent(item);
    const resolved = entityResolutionService.mapContentToEntities(item, extracted);
    for (const result of resolved) {
      if (!result.entity || result.confidence === "low") continue;
      const entityNodeId = `entity:${result.entity.id}`;
      if (!knowledgeGraphStore.getNode(entityNodeId)) {
        knowledgeGraphStore.saveNode({
          id: entityNodeId,
          type: result.entity.entityType,
          title: result.entity.canonicalName,
          slug: result.entity.slug,
          aliases: result.entity.aliases,
          normalizedName: normalizeEntityName(result.entity.canonicalName),
          taxonomyId: result.entity.id,
          status: "active",
          indexability: "unknown",
          metadata: { source: result.entity.source },
          createdAt: new Date().toISOString(),
        });
      }
      createKnowledgeEdge({
        sourceNodeId: node.id,
        targetNodeId: entityNodeId,
        relation: "is-about",
        weight: result.confidence === "high" ? 0.85 : 0.6,
        confidence: result.confidence,
        source: "semantic-analysis",
        evidence: [`Extracted: ${result.extracted.raw}`],
      });
    }
  }

  return snapshot();
}

export function createKnowledgeNode(input: Partial<KnowledgeNode> & { type: KnowledgeNodeType; title: string }): KnowledgeNode {
  const now = new Date().toISOString();
  const node: KnowledgeNode = {
    id: input.id ?? randomUUID(),
    type: input.type,
    title: input.title,
    slug: input.slug ?? normalizeEntitySlug(input.title),
    canonicalUrl: input.canonicalUrl ?? null,
    aliases: input.aliases ?? [],
    normalizedName: input.normalizedName ?? normalizeEntityName(input.title),
    contentItemId: input.contentItemId,
    taxonomyId: input.taxonomyId,
    clusterId: input.clusterId,
    status: input.status ?? "active",
    indexability: input.indexability ?? "unknown",
    metadata: input.metadata ?? {},
    createdAt: input.createdAt ?? now,
    updatedAt: now,
  };
  knowledgeGraphStore.saveNode(node);
  knowledgeGraphStore.logAudit({ action: "node_created", entityType: "node", entityId: node.id });
  return node;
}

export function updateKnowledgeNode(nodeId: string, input: Partial<KnowledgeNode>): KnowledgeNode | null {
  const existing = knowledgeGraphStore.getNode(nodeId);
  if (!existing) return null;
  const updated: KnowledgeNode = {
    ...existing,
    ...input,
    updatedAt: new Date().toISOString(),
  };
  knowledgeGraphStore.saveNode(updated);
  knowledgeGraphStore.logAudit({
    action: "node_updated",
    entityType: "node",
    entityId: nodeId,
    previousValue: existing.title,
    newValue: updated.title,
  });
  return updated;
}

export function archiveKnowledgeNode(nodeId: string): KnowledgeNode | null {
  return updateKnowledgeNode(nodeId, { status: "archived" });
}

export function createKnowledgeEdge(
  input: Omit<KnowledgeEdge, "id" | "createdAt" | "status" | "direction"> & {
    id?: string;
    status?: KnowledgeEdge["status"];
    direction?: KnowledgeEdge["direction"];
  },
): KnowledgeEdge | null {
  const source = knowledgeGraphStore.getNode(input.sourceNodeId);
  const target = knowledgeGraphStore.getNode(input.targetNodeId);
  if (!source || !target) return null;
  if (!isValidRelation(source.type, input.relation, target.type)) return null;

  const weight = Math.min(KNOWLEDGE_EDGE_WEIGHT_MAX, Math.max(KNOWLEDGE_EDGE_WEIGHT_MIN, input.weight));
  const edge: KnowledgeEdge = {
    id: input.id ?? randomUUID(),
    sourceNodeId: input.sourceNodeId,
    targetNodeId: input.targetNodeId,
    relation: input.relation,
    direction: input.direction ?? "directed",
    weight,
    confidence: input.confidence,
    source: input.source,
    status: input.status ?? (input.source === "ai-suggestion" ? "suggested" : "approved"),
    evidence: input.evidence,
    createdAt: new Date().toISOString(),
  };

  const duplicate = knowledgeGraphStore.listEdges().find(
    (e) =>
      e.sourceNodeId === edge.sourceNodeId &&
      e.targetNodeId === edge.targetNodeId &&
      e.relation === edge.relation &&
      e.status !== "rejected",
  );
  if (duplicate) return duplicate;

  knowledgeGraphStore.saveEdge(edge);
  knowledgeGraphStore.logAudit({ action: "edge_created", entityType: "edge", entityId: edge.id });
  return edge;
}

export function approveKnowledgeEdge(edgeId: string, actor?: string): KnowledgeEdge | null {
  const edge = knowledgeGraphStore.getEdge(edgeId);
  if (!edge) return null;
  const updated: KnowledgeEdge = {
    ...edge,
    status: "active",
    updatedAt: new Date().toISOString(),
  };
  knowledgeGraphStore.saveEdge(updated);
  knowledgeGraphStore.logAudit({
    action: "edge_approved",
    entityType: "edge",
    entityId: edgeId,
    actorId: actor,
  });
  return updated;
}

export function rejectKnowledgeEdge(edgeId: string, actor: string | undefined, reason: string): KnowledgeEdge | null {
  const edge = knowledgeGraphStore.getEdge(edgeId);
  if (!edge) return null;
  const updated: KnowledgeEdge = { ...edge, status: "rejected", updatedAt: new Date().toISOString() };
  knowledgeGraphStore.saveEdge(updated);
  knowledgeGraphStore.logAudit({
    action: "edge_rejected",
    entityType: "edge",
    entityId: edgeId,
    actorId: actor,
    reason,
  });
  return updated;
}

export function removeKnowledgeEdge(edgeId: string, reason: string): void {
  const edge = knowledgeGraphStore.getEdge(edgeId);
  if (!edge) return;
  knowledgeGraphStore.deleteEdge(edgeId);
  knowledgeGraphStore.logAudit({
    action: "edge_removed",
    entityType: "edge",
    entityId: edgeId,
    reason,
  });
}

export function getNodeNeighbors(
  nodeId: string,
  options?: { relation?: KnowledgeEdge["relation"]; direction?: "in" | "out" | "both" },
): { node: KnowledgeNode; edge: KnowledgeEdge }[] {
  const direction = options?.direction ?? "both";
  const edges = knowledgeGraphStore.getEdgesByNode(nodeId).filter((e) => {
    if (options?.relation && e.relation !== options.relation) return false;
    if (e.status === "rejected" || e.status === "broken") return false;
    return true;
  });

  const results: { node: KnowledgeNode; edge: KnowledgeEdge }[] = [];
  for (const edge of edges) {
    if (direction !== "in" && edge.sourceNodeId === nodeId) {
      const node = knowledgeGraphStore.getNode(edge.targetNodeId);
      if (node) results.push({ node, edge });
    }
    if (direction !== "out" && edge.targetNodeId === nodeId) {
      const node = knowledgeGraphStore.getNode(edge.sourceNodeId);
      if (node) results.push({ node, edge });
    }
  }
  return results;
}

export function getGraphSubtree(nodeId: string, depth = 2): KnowledgeGraphSnapshot {
  const nodes = new Map<string, KnowledgeNode>();
  const edges = new Map<string, KnowledgeEdge>();
  const queue: Array<{ id: string; d: number }> = [{ id: nodeId, d: 0 }];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) break;
    const node = knowledgeGraphStore.getNode(current.id);
    if (!node) continue;
    nodes.set(node.id, node);
    if (current.d >= depth) continue;

    for (const { node: neighbor, edge } of getNodeNeighbors(current.id)) {
      edges.set(edge.id, edge);
      if (!nodes.has(neighbor.id)) {
        queue.push({ id: neighbor.id, d: current.d + 1 });
      }
    }
  }

  return {
    nodes: [...nodes.values()],
    edges: [...edges.values()],
    builtAt: new Date().toISOString(),
  };
}

export function getShortestSemanticPath(sourceId: string, targetId: string): KnowledgeNode[] | null {
  if (sourceId === targetId) return [knowledgeGraphStore.getNode(sourceId)!].filter(Boolean);

  const visited = new Set<string>();
  const queue: Array<{ id: string; path: string[] }> = [{ id: sourceId, path: [sourceId] }];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) break;
    if (visited.has(current.id)) continue;
    visited.add(current.id);

    for (const { node } of getNodeNeighbors(current.id)) {
      if (visited.has(node.id)) continue;
      const path = [...current.path, node.id];
      if (node.id === targetId) {
        return path.map((id) => knowledgeGraphStore.getNode(id)).filter(Boolean) as KnowledgeNode[];
      }
      queue.push({ id: node.id, path });
    }
  }
  return null;
}

export async function rebuildGraphForContentItem(contentItemId: string): Promise<KnowledgeGraphSnapshot> {
  const item = await contentRepository.getContentById(contentItemId);
  if (!item) return snapshot();
  const node = contentToNode(item);
  knowledgeGraphStore.saveNode(node);
  return snapshot();
}

export function validateKnowledgeGraph(): ReturnType<typeof graphValidator.getGraphValidationSummary> {
  return graphValidator.getGraphValidationSummary(snapshot());
}

export const knowledgeGraphService = {
  buildKnowledgeGraph,
  createKnowledgeNode,
  updateKnowledgeNode,
  archiveKnowledgeNode,
  createKnowledgeEdge,
  approveKnowledgeEdge,
  rejectKnowledgeEdge,
  removeKnowledgeEdge,
  getNodeNeighbors,
  getGraphSubtree,
  getShortestSemanticPath,
  rebuildGraphForContentItem,
  validateKnowledgeGraph,
  snapshot,
};
