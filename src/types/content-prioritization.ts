export type ContentPriorityLevel = "P1" | "P2" | "P3" | "P4" | "P5";

export type PriorityConfidence = "low" | "medium" | "high";

export type ContentPriorityScore = {
  contentItemId: string;
  score: number;
  level: ContentPriorityLevel;
  confidence: PriorityConfidence;
  heuristic: boolean;
  inputs: {
    searchDemandScore: number;
    commercialIntentScore: number;
    leadPotentialScore: number;
    strategicValueScore: number;
    contentDifficultyScore: number;
    competitionScore: number;
    localDemandScore: number;
    seasonalityScore: number;
    readinessScore: number;
    cannibalizationPenalty: number;
    thinContentPenalty: number;
  };
  dataAvailability: {
    hasSearchVolume: boolean;
    hasKeywordDifficulty: boolean;
    hasGSCData: boolean;
    hasYandexData: boolean;
    hasAnalyticsData: boolean;
  };
  warnings: string[];
  explanation: string;
  recommendedAction: string;
  calculatedAt: string;
};

export type PriorityMetrics = {
  totalItems: number;
  p1: number;
  p2: number;
  p3: number;
  p4: number;
  p5: number;
  highConfidence: number;
  lowConfidence: number;
  needsKeywordData: number;
  highCommercialIntent: number;
  highLeadPotential: number;
  highCannibalizationRisk: number;
  readyToSchedule: number;
};

export type PriorityQueueItem = {
  contentItemId: string;
  title: string;
  kind: string;
  slug: string;
  status: string;
  score: ContentPriorityScore;
  readinessBlockers: string[];
  scheduleSuggestion?: string;
};
