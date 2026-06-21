export type KnowledgeNodeType =
  | "content"
  | "service"
  | "project"
  | "project-category"
  | "building-type"
  | "technology"
  | "material"
  | "size"
  | "area"
  | "floors"
  | "layout"
  | "location"
  | "construction-stage"
  | "technical-topic"
  | "comparison"
  | "faq"
  | "semantic-cluster"
  | "pillar"
  | "hub"
  | "cta"
  | "author"
  | "source";

export type KnowledgeRelationType =
  | "is-about"
  | "belongs-to"
  | "part-of"
  | "has-project"
  | "uses-material"
  | "uses-technology"
  | "available-in"
  | "has-size"
  | "has-area"
  | "has-floors"
  | "has-layout"
  | "related-to"
  | "explains"
  | "compares-with"
  | "answers"
  | "supports"
  | "leads-to"
  | "converts-to"
  | "pillar-for"
  | "cluster-member"
  | "parent-of"
  | "child-of"
  | "prerequisite-for"
  | "next-step"
  | "alternative-to"
  | "canonical-of"
  | "redirects-to"
  | "duplicates"
  | "competes-with"
  | "links-to"
  | "cites";

/** Edge weight range: 0 (weakest) to 1 (strongest). Not equivalent to confidence. */
export const KNOWLEDGE_EDGE_WEIGHT_MIN = 0;
export const KNOWLEDGE_EDGE_WEIGHT_MAX = 1;

export type KnowledgeNode = {
  id: string;
  type: KnowledgeNodeType;

  title: string;
  slug?: string;
  canonicalUrl?: string | null;

  aliases: string[];
  normalizedName: string;

  contentItemId?: string;
  taxonomyId?: string;
  clusterId?: string;

  status: "active" | "draft" | "review" | "archived" | "merged" | "deleted";

  indexability: "indexable" | "not-indexable" | "unknown";

  metadata: Record<string, string | number | boolean | null>;

  createdAt: string;
  updatedAt?: string;
};

export type KnowledgeEdge = {
  id: string;

  sourceNodeId: string;
  targetNodeId: string;

  relation: KnowledgeRelationType;

  direction: "directed" | "bidirectional";

  /** 0–1 semantic strength; see KNOWLEDGE_EDGE_WEIGHT_* constants */
  weight: number;
  confidence: "low" | "medium" | "high";

  source:
    | "taxonomy"
    | "cms"
    | "manual"
    | "semantic-analysis"
    | "analytics"
    | "internal-link"
    | "ai-suggestion"
    | "migration";

  status: "suggested" | "approved" | "active" | "rejected" | "stale" | "broken";

  evidence: string[];
  createdAt: string;
  updatedAt?: string;
};

export type KnowledgeGraphSnapshot = {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
  builtAt: string;
};
