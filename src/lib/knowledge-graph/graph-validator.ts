import type { KnowledgeEdge, KnowledgeGraphSnapshot, KnowledgeNode } from "@/types/knowledge-graph";
import { isHierarchyRelation, isValidRelation } from "@/data/knowledge-relation-rules";
import { KNOWLEDGE_EDGE_WEIGHT_MAX, KNOWLEDGE_EDGE_WEIGHT_MIN } from "@/types/knowledge-graph";

export type GraphValidationIssue = {
  code: string;
  severity: "error" | "warning" | "info";
  message: string;
  nodeId?: string;
  edgeId?: string;
};

const SELF_REFERENCE_ALLOWED = new Set(["related-to", "alternative-to"]);

function clampIssues(issues: GraphValidationIssue[]): GraphValidationIssue[] {
  return issues;
}

export function validateKnowledgeNode(node: KnowledgeNode): GraphValidationIssue[] {
  const issues: GraphValidationIssue[] = [];
  if (!node.type) {
    issues.push({ code: "missing_type", severity: "error", message: "Node missing type", nodeId: node.id });
  }
  if (!node.title?.trim()) {
    issues.push({ code: "missing_title", severity: "error", message: "Node missing title", nodeId: node.id });
  }
  if (!node.normalizedName?.trim()) {
    issues.push({
      code: "missing_normalized_name",
      severity: "warning",
      message: "Node missing normalizedName",
      nodeId: node.id,
    });
  }
  if (node.status === "deleted") {
    issues.push({ code: "deleted_node", severity: "info", message: "Node is deleted", nodeId: node.id });
  }
  return issues;
}

export function validateKnowledgeEdge(
  edge: KnowledgeEdge,
  graph: KnowledgeGraphSnapshot,
): GraphValidationIssue[] {
  const issues: GraphValidationIssue[] = [];
  const source = graph.nodes.find((n) => n.id === edge.sourceNodeId);
  const target = graph.nodes.find((n) => n.id === edge.targetNodeId);

  if (!edge.sourceNodeId) {
    issues.push({ code: "missing_source", severity: "error", message: "Edge missing source", edgeId: edge.id });
  }
  if (!edge.targetNodeId) {
    issues.push({ code: "missing_target", severity: "error", message: "Edge missing target", edgeId: edge.id });
  }
  if (!source) {
    issues.push({
      code: "broken_source",
      severity: "error",
      message: "Edge references missing source node",
      edgeId: edge.id,
      nodeId: edge.sourceNodeId,
    });
  }
  if (!target) {
    issues.push({
      code: "broken_target",
      severity: "error",
      message: "Edge references missing target node",
      edgeId: edge.id,
      nodeId: edge.targetNodeId,
    });
  }

  if (edge.sourceNodeId === edge.targetNodeId && !SELF_REFERENCE_ALLOWED.has(edge.relation)) {
    issues.push({
      code: "invalid_self_reference",
      severity: "error",
      message: `Self-reference not allowed for relation ${edge.relation}`,
      edgeId: edge.id,
    });
  }

  if (source && target && !isValidRelation(source.type, edge.relation, target.type)) {
    issues.push({
      code: "invalid_relation",
      severity: "error",
      message: `Invalid relation ${edge.relation} from ${source.type} to ${target.type}`,
      edgeId: edge.id,
    });
  }

  const duplicate = graph.edges.filter(
    (e) =>
      e.id !== edge.id &&
      e.sourceNodeId === edge.sourceNodeId &&
      e.targetNodeId === edge.targetNodeId &&
      e.relation === edge.relation &&
      e.status !== "rejected",
  );
  if (duplicate.length > 0) {
    issues.push({ code: "duplicate_edge", severity: "warning", message: "Duplicate edge", edgeId: edge.id });
  }

  if (edge.weight < KNOWLEDGE_EDGE_WEIGHT_MIN || edge.weight > KNOWLEDGE_EDGE_WEIGHT_MAX) {
    issues.push({
      code: "invalid_weight",
      severity: "warning",
      message: `Edge weight must be between ${KNOWLEDGE_EDGE_WEIGHT_MIN} and ${KNOWLEDGE_EDGE_WEIGHT_MAX}`,
      edgeId: edge.id,
    });
  }

  if (edge.status === "active" && edge.evidence.length === 0) {
    issues.push({
      code: "missing_evidence",
      severity: "warning",
      message: "Active edge without evidence",
      edgeId: edge.id,
    });
  }

  if (edge.status === "active" && edge.source === "ai-suggestion" && edge.confidence === "low") {
    issues.push({
      code: "low_confidence_ai_active",
      severity: "error",
      message: "Low-confidence AI edge cannot be active",
      edgeId: edge.id,
    });
  }

  if (target?.indexability === "not-indexable" && edge.relation === "links-to" && edge.status === "active") {
    issues.push({
      code: "active_link_noindex",
      severity: "error",
      message: "Active link to non-indexable target",
      edgeId: edge.id,
      nodeId: target.id,
    });
  }

  if (target?.status === "deleted" || target?.status === "merged") {
    issues.push({
      code: "edge_to_deleted",
      severity: "error",
      message: "Edge points to deleted or merged node",
      edgeId: edge.id,
      nodeId: target?.id,
    });
  }

  return clampIssues(issues);
}

export function detectGraphCycles(graph: KnowledgeGraphSnapshot): GraphValidationIssue[] {
  const issues: GraphValidationIssue[] = [];
  const hierarchyEdges = graph.edges.filter(
    (e) => isHierarchyRelation(e.relation) && e.status !== "rejected" && e.direction !== "bidirectional",
  );

  const adjacency = new Map<string, string[]>();
  for (const edge of hierarchyEdges) {
    const list = adjacency.get(edge.sourceNodeId) ?? [];
    list.push(edge.targetNodeId);
    adjacency.set(edge.sourceNodeId, list);
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();

  function dfs(nodeId: string, path: string[]): void {
    if (visiting.has(nodeId)) {
      issues.push({
        code: "hierarchy_cycle",
        severity: "error",
        message: `Hierarchy cycle detected: ${[...path, nodeId].join(" → ")}`,
        nodeId,
      });
      return;
    }
    if (visited.has(nodeId)) return;
    visiting.add(nodeId);
    for (const next of adjacency.get(nodeId) ?? []) {
      dfs(next, [...path, nodeId]);
    }
    visiting.delete(nodeId);
    visited.add(nodeId);
  }

  for (const node of graph.nodes) {
    if (!visited.has(node.id)) dfs(node.id, []);
  }

  return issues;
}

export function detectBrokenGraphEdges(graph: KnowledgeGraphSnapshot): GraphValidationIssue[] {
  const nodeIds = new Set(graph.nodes.map((n) => n.id));
  return graph.edges
    .filter((e) => !nodeIds.has(e.sourceNodeId) || !nodeIds.has(e.targetNodeId))
    .map((e) => ({
      code: "broken_edge",
      severity: "error" as const,
      message: "Edge references missing node",
      edgeId: e.id,
    }));
}

export function detectConflictingRelations(graph: KnowledgeGraphSnapshot): GraphValidationIssue[] {
  const issues: GraphValidationIssue[] = [];
  const byPair = new Map<string, KnowledgeEdge[]>();

  for (const edge of graph.edges) {
    const key = [edge.sourceNodeId, edge.targetNodeId].sort().join("|");
    const list = byPair.get(key) ?? [];
    list.push(edge);
    byPair.set(key, list);
  }

  for (const [, edges] of byPair) {
    const active = edges.filter((e) => e.status === "active" || e.status === "approved");
    const relations = new Set(active.map((e) => e.relation));
    if (relations.has("duplicates") && relations.has("competes-with")) {
      issues.push({
        code: "conflicting_relations",
        severity: "warning",
        message: "Conflicting duplicate and compete relations between same nodes",
        edgeId: active[0]?.id,
      });
    }
    if (relations.has("canonical-of") && relations.has("duplicates")) {
      issues.push({
        code: "conflicting_canonical",
        severity: "warning",
        message: "Both canonical-of and duplicates between same nodes",
        edgeId: active[0]?.id,
      });
    }
  }

  return issues;
}

export function getGraphValidationSummary(graph: KnowledgeGraphSnapshot): {
  valid: boolean;
  errorCount: number;
  warningCount: number;
  issues: GraphValidationIssue[];
} {
  const issues: GraphValidationIssue[] = [];
  for (const node of graph.nodes) {
    issues.push(...validateKnowledgeNode(node));
  }
  for (const edge of graph.edges) {
    issues.push(...validateKnowledgeEdge(edge, graph));
  }
  issues.push(...detectGraphCycles(graph));
  issues.push(...detectBrokenGraphEdges(graph));
  issues.push(...detectConflictingRelations(graph));

  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;
  return { valid: errorCount === 0, errorCount, warningCount, issues };
}

export const graphValidator = {
  validateKnowledgeNode,
  validateKnowledgeEdge,
  detectGraphCycles,
  detectBrokenGraphEdges,
  detectConflictingRelations,
  getGraphValidationSummary,
};
