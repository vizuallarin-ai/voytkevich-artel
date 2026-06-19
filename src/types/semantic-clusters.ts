export type SemanticClusterType =
  | "programmatic"
  | "technical"
  | "editorial"
  | "local"
  | "commercial"
  | "comparison"
  | "news"
  | "future";

export type SemanticClusterIntent =
  | "commercial"
  | "informational"
  | "transactional"
  | "comparison"
  | "local"
  | "editorial"
  | "unknown";

export type SemanticCluster = {
  id: string;
  slug: string;
  title: string;
  description: string;
  clusterType: SemanticClusterType;
  keywords: string[];
  primaryIntent: SemanticClusterIntent;
  relatedContentIds: string[];
  demand: {
    totalSearchVolume?: number | null;
    averageDifficulty?: number | null;
    dataCompleteness: "none" | "partial" | "good" | "strong";
    demandLevel: "high" | "medium" | "low" | "unknown";
  };
  businessValue: {
    commercialIntent: "high" | "medium" | "low";
    leadPotential: "high" | "medium" | "low";
    strategicValue: "high" | "medium" | "low";
  };
  risks: {
    cannibalizationRisk: "high" | "medium" | "low";
    thinContentRisk: "high" | "medium" | "low";
    contentDifficulty: "high" | "medium" | "low";
  };
  priority: {
    score: number;
    level: "P1" | "P2" | "P3" | "P4" | "P5";
    confidence: "low" | "medium" | "high";
    reason: string;
  };
  createdAt: string;
  updatedAt?: string;
};
