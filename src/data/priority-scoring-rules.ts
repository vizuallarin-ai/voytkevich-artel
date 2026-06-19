export const priorityScoringWeights = {
  searchDemand: 0.2,
  commercialIntent: 0.2,
  leadPotential: 0.2,
  strategicValue: 0.12,
  localDemand: 0.08,
  seasonality: 0.05,
  readiness: 0.1,
  competition: 0.05,
  contentDifficulty: -0.05,
  cannibalizationPenalty: -0.15,
  thinContentPenalty: -0.15,
} as const;

export const priorityLevelThresholds: Array<{ level: "P1" | "P2" | "P3" | "P4" | "P5"; min: number; max: number }> = [
  { level: "P1", min: 80, max: 100 },
  { level: "P2", min: 60, max: 79 },
  { level: "P3", min: 40, max: 59 },
  { level: "P4", min: 20, max: 39 },
  { level: "P5", min: 0, max: 19 },
];

export function scoreToPriorityLevel(score: number): "P1" | "P2" | "P3" | "P4" | "P5" {
  const clamped = Math.max(0, Math.min(100, score));
  for (const t of priorityLevelThresholds) {
    if (clamped >= t.min && clamped <= t.max) return t.level;
  }
  return "P5";
}
