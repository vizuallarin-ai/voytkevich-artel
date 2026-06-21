import type { KnowledgeRelationType } from "@/types/knowledge-graph";

export type LinkRecommendation = {
  id: string;

  sourceContentItemId: string;
  targetContentItemId: string;

  relation: KnowledgeRelationType;

  score: number;
  confidence: "low" | "medium" | "high";

  factors: {
    semanticRelevance: number;
    entityOverlap: number;
    clusterRelationship: number;
    userJourneyValue: number;
    businessValue: number;
    targetPriority: number;
    targetDepth: number;
    targetAuthorityNeed: number;
    duplicationPenalty: number;
    anchorRiskPenalty: number;
    linkDensityPenalty: number;
  };

  suggestedAnchors: string[];
  suggestedPlacement?: string;
  explanation: string;
  evidence: string[];

  status: "suggested" | "approved" | "rejected" | "applied" | "expired";

  createdAt: string;
};
