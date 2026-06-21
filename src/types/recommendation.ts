export type RecommendationType =
  | "related-content"
  | "next-content"
  | "project"
  | "service"
  | "technology"
  | "material"
  | "comparison"
  | "location"
  | "faq"
  | "next-action";

export type RecommendationCandidate = {
  id: string;
  type: RecommendationType;

  contentItemId?: string;
  targetUrl?: string;

  title: string;
  description?: string;

  entityNodeIds: string[];
  clusterIds: string[];

  source:
    | "knowledge-graph"
    | "taxonomy"
    | "search"
    | "session"
    | "analytics"
    | "manual-rule"
    | "popular"
    | "cold-start";

  eligibility: {
    published: boolean;
    indexable: boolean;
    canonical: boolean;
    available: boolean;
  };

  createdAt: string;
};

export type RankedRecommendation = {
  recommendationId: string;

  score: number;
  confidence: "low" | "medium" | "high";

  factors: {
    contextualRelevance: number;
    entityRelevance: number;
    clusterRelevance: number;
    preferenceMatch: number;
    journeyValue: number;
    contentQuality: number;
    freshness: number;
    businessValue: number;
    diversityBoost: number;
    noveltyBoost: number;
    repetitionPenalty: number;
    exclusionPenalty: number;
  };

  explanation: string;
  reasonCodes: string[];
};

export type RecommendationItem = RecommendationCandidate & RankedRecommendation;
