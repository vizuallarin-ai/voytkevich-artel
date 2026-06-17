export type ContentQualityLevel = "poor" | "acceptable" | "good" | "strong";

export type UnifiedContentQualityScore = {
  score: number;
  level: ContentQualityLevel;
  warnings: string[];
  blockers: string[];
  canPublish: boolean;
  shouldNoindex: boolean;
  requiredActions: string[];
};
