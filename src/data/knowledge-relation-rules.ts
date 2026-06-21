import type { KnowledgeNodeType, KnowledgeRelationType } from "@/types/knowledge-graph";

export type RelationRule = {
  sourceType: KnowledgeNodeType;
  relation: KnowledgeRelationType;
  targetType: KnowledgeNodeType;
  bidirectional?: boolean;
  notes?: string;
};

/** Allowed semantic relations between node types. Invalid combos rejected by graph validator. */
export const knowledgeRelationRules: RelationRule[] = [
  { sourceType: "project", relation: "uses-material", targetType: "material" },
  { sourceType: "project", relation: "uses-technology", targetType: "technology" },
  { sourceType: "project", relation: "available-in", targetType: "location" },
  { sourceType: "project", relation: "has-size", targetType: "size" },
  { sourceType: "project", relation: "has-area", targetType: "area" },
  { sourceType: "project", relation: "has-floors", targetType: "floors" },
  { sourceType: "project", relation: "has-layout", targetType: "layout" },
  { sourceType: "project", relation: "belongs-to", targetType: "project-category" },
  { sourceType: "project", relation: "part-of", targetType: "building-type" },

  { sourceType: "content", relation: "is-about", targetType: "technical-topic" },
  { sourceType: "content", relation: "is-about", targetType: "service" },
  { sourceType: "content", relation: "is-about", targetType: "material" },
  { sourceType: "content", relation: "is-about", targetType: "technology" },
  { sourceType: "content", relation: "is-about", targetType: "location" },
  { sourceType: "content", relation: "explains", targetType: "technical-topic" },
  { sourceType: "content", relation: "supports", targetType: "service" },
  { sourceType: "content", relation: "leads-to", targetType: "service" },
  { sourceType: "content", relation: "leads-to", targetType: "cta" },
  { sourceType: "content", relation: "converts-to", targetType: "cta" },
  { sourceType: "content", relation: "links-to", targetType: "content" },
  { sourceType: "content", relation: "cluster-member", targetType: "semantic-cluster" },
  { sourceType: "content", relation: "cites", targetType: "source" },

  { sourceType: "technical-topic", relation: "related-to", targetType: "technology", bidirectional: true },
  { sourceType: "technical-topic", relation: "related-to", targetType: "material", bidirectional: true },
  { sourceType: "technical-topic", relation: "prerequisite-for", targetType: "technical-topic" },

  { sourceType: "comparison", relation: "compares-with", targetType: "material" },
  { sourceType: "comparison", relation: "compares-with", targetType: "technology" },
  { sourceType: "comparison", relation: "compares-with", targetType: "building-type" },

  { sourceType: "faq", relation: "answers", targetType: "technical-topic" },
  { sourceType: "faq", relation: "answers", targetType: "service" },

  { sourceType: "service", relation: "uses-technology", targetType: "technology" },
  { sourceType: "service", relation: "uses-material", targetType: "material" },
  { sourceType: "service", relation: "available-in", targetType: "location" },
  { sourceType: "service", relation: "leads-to", targetType: "cta" },
  { sourceType: "service", relation: "has-project", targetType: "project" },

  { sourceType: "location", relation: "leads-to", targetType: "service" },
  { sourceType: "location", relation: "available-in", targetType: "project" },

  { sourceType: "pillar", relation: "pillar-for", targetType: "content" },
  { sourceType: "pillar", relation: "pillar-for", targetType: "semantic-cluster" },
  { sourceType: "hub", relation: "parent-of", targetType: "content" },
  { sourceType: "hub", relation: "cluster-member", targetType: "semantic-cluster" },

  { sourceType: "semantic-cluster", relation: "parent-of", targetType: "content" },
  { sourceType: "semantic-cluster", relation: "child-of", targetType: "pillar" },

  { sourceType: "content", relation: "competes-with", targetType: "content" },
  { sourceType: "content", relation: "duplicates", targetType: "content" },
  { sourceType: "content", relation: "canonical-of", targetType: "content" },
  { sourceType: "content", relation: "redirects-to", targetType: "content" },
  { sourceType: "content", relation: "alternative-to", targetType: "content" },
  { sourceType: "content", relation: "next-step", targetType: "content" },

  { sourceType: "construction-stage", relation: "prerequisite-for", targetType: "construction-stage" },
  { sourceType: "construction-stage", relation: "part-of", targetType: "service" },

  { sourceType: "project-category", relation: "parent-of", targetType: "project" },
  { sourceType: "building-type", relation: "parent-of", targetType: "project-category" },

  { sourceType: "author", relation: "related-to", targetType: "content", bidirectional: true },
];

const HIERARCHY_RELATIONS = new Set<KnowledgeRelationType>([
  "parent-of",
  "child-of",
  "part-of",
  "belongs-to",
  "pillar-for",
  "cluster-member",
  "prerequisite-for",
]);

export function isValidRelation(
  sourceType: KnowledgeNodeType,
  relation: KnowledgeRelationType,
  targetType: KnowledgeNodeType,
): boolean {
  return knowledgeRelationRules.some(
    (rule) =>
      rule.sourceType === sourceType &&
      rule.relation === relation &&
      rule.targetType === targetType,
  );
}

export function isHierarchyRelation(relation: KnowledgeRelationType): boolean {
  return HIERARCHY_RELATIONS.has(relation);
}

export function getAllowedRelationsForSource(
  sourceType: KnowledgeNodeType,
): RelationRule[] {
  return knowledgeRelationRules.filter((r) => r.sourceType === sourceType);
}
