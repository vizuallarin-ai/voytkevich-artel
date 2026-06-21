import { randomUUID } from "crypto";
import type { KnowledgeEdge, KnowledgeNode } from "@/types/knowledge-graph";
import type { LinkRecommendation } from "@/types/link-recommendation";
import type { InternalLinkRecord } from "@/types/internal-link";

export type GraphAuditEntry = {
  id: string;
  action: string;
  entityType: "node" | "edge" | "batch" | "recommendation" | "entity";
  entityId: string;
  contentItemId?: string;
  actorId?: string;
  previousValue?: string;
  newValue?: string;
  reason?: string;
  batchId?: string;
  createdAt: string;
};

export type LinkBatchStatus =
  | "preview"
  | "approved"
  | "applied"
  | "verified"
  | "rolled-back"
  | "rejected";

export type LinkBatch = {
  id: string;
  recommendationIds: string[];
  status: LinkBatchStatus;
  actorId?: string;
  previewSummary?: string;
  appliedAt?: string;
  verifiedAt?: string;
  rollbackSnapshot?: InternalLinkRecord[];
  createdAt: string;
  updatedAt?: string;
};

const nodes = new Map<string, KnowledgeNode>();
const edges = new Map<string, KnowledgeEdge>();
const recommendations = new Map<string, LinkRecommendation>();
const linkInventory = new Map<string, InternalLinkRecord>();
const batches = new Map<string, LinkBatch>();
const auditLog: GraphAuditEntry[] = [];

function logAudit(entry: Omit<GraphAuditEntry, "id" | "createdAt">): GraphAuditEntry {
  const full: GraphAuditEntry = {
    ...entry,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  };
  auditLog.unshift(full);
  if (auditLog.length > 2000) auditLog.pop();
  return full;
}

export const knowledgeGraphStore = {
  saveNode(node: KnowledgeNode): KnowledgeNode {
    nodes.set(node.id, node);
    return node;
  },

  getNode(id: string): KnowledgeNode | undefined {
    return nodes.get(id);
  },

  listNodes(): KnowledgeNode[] {
    return [...nodes.values()];
  },

  deleteNode(id: string): void {
    nodes.delete(id);
  },

  saveEdge(edge: KnowledgeEdge): KnowledgeEdge {
    edges.set(edge.id, edge);
    return edge;
  },

  getEdge(id: string): KnowledgeEdge | undefined {
    return edges.get(id);
  },

  listEdges(): KnowledgeEdge[] {
    return [...edges.values()];
  },

  getEdgesByNode(nodeId: string): KnowledgeEdge[] {
    return [...edges.values()].filter(
      (e) => e.sourceNodeId === nodeId || e.targetNodeId === nodeId,
    );
  },

  deleteEdge(id: string): void {
    edges.delete(id);
  },

  saveRecommendation(rec: LinkRecommendation): LinkRecommendation {
    recommendations.set(rec.id, rec);
    return rec;
  },

  getRecommendation(id: string): LinkRecommendation | undefined {
    return recommendations.get(id);
  },

  listRecommendations(): LinkRecommendation[] {
    return [...recommendations.values()];
  },

  saveLinkRecord(link: InternalLinkRecord): InternalLinkRecord {
    linkInventory.set(link.id, link);
    return link;
  },

  getLinkRecord(id: string): InternalLinkRecord | undefined {
    return linkInventory.get(id);
  },

  listLinkRecords(): InternalLinkRecord[] {
    return [...linkInventory.values()];
  },

  getLinksBySourceContentItem(contentItemId: string): InternalLinkRecord[] {
    return [...linkInventory.values()].filter((l) => l.sourceContentItemId === contentItemId);
  },

  getLinksByTargetUrl(targetUrl: string): InternalLinkRecord[] {
    const normalized = targetUrl.replace(/\/$/, "") || "/";
    return [...linkInventory.values()].filter(
      (l) => l.targetUrl.replace(/\/$/, "") || "/" === normalized,
    );
  },

  saveBatch(batch: LinkBatch): LinkBatch {
    batches.set(batch.id, batch);
    return batch;
  },

  getBatch(id: string): LinkBatch | undefined {
    return batches.get(id);
  },

  listBatches(): LinkBatch[] {
    return [...batches.values()];
  },

  logAudit,

  listAudit(limit = 100): GraphAuditEntry[] {
    return auditLog.slice(0, limit);
  },

  clear(): void {
    nodes.clear();
    edges.clear();
    recommendations.clear();
    linkInventory.clear();
    batches.clear();
    auditLog.length = 0;
  },
};
