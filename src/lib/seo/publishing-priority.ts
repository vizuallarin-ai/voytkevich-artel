import type { ProgrammaticSEOPage, PriorityTier } from "@/types/programmatic-seo";
import {
  pageTypePriorityScore,
  priorityWeights,
  regionPriorityToScore,
  scoreDemand,
  scoreRisk,
} from "@/data/seo-priority-model";
import { getRegionById } from "@/data/irkutsk-region-taxonomy";

function totalScore(page: ProgrammaticSEOPage): number {
  const p = page.priority;
  let score = 0;
  score += scoreDemand(p.searchDemand);
  score += scoreRisk(p.commercialIntent, priorityWeights.commercialIntent);
  score += scoreRisk(p.leadPotential, priorityWeights.leadPotential);
  score += scoreRisk(p.contentDifficulty, priorityWeights.contentDifficulty);
  score += scoreRisk(p.uniquenessRisk, priorityWeights.uniquenessRisk);
  score += scoreRisk(p.cannibalizationRisk, priorityWeights.cannibalizationRisk);
  score += pageTypePriorityScore(page.pageType);

  if (page.region) {
    const region = getRegionById(page.region);
    if (region) score += regionPriorityToScore(region.priority);
  }

  return score;
}

function scoreToTier(score: number): PriorityTier {
  if (score >= 10) return "P1";
  if (score >= 7) return "P2";
  if (score >= 4) return "P3";
  if (score >= 1) return "P4";
  return "P5";
}

export function calculatePublishingPriority(page: ProgrammaticSEOPage): PriorityTier {
  return scoreToTier(totalScore(page));
}

export function sortContentQueueByPriority(pages: ProgrammaticSEOPage[]): ProgrammaticSEOPage[] {
  return [...pages].sort((a, b) => {
    const tierOrder: Record<PriorityTier, number> = { P1: 0, P2: 1, P3: 2, P4: 3, P5: 4 };
    const tierA = calculatePublishingPriority(a);
    const tierB = calculatePublishingPriority(b);
    if (tierOrder[tierA] !== tierOrder[tierB]) return tierOrder[tierA] - tierOrder[tierB];
    return totalScore(b) - totalScore(a);
  });
}

export function explainPublishingPriority(page: ProgrammaticSEOPage): string[] {
  const p = page.priority;
  const lines = [
    `pageType: ${page.pageType} (+${pageTypePriorityScore(page.pageType)})`,
    `searchDemand: ${p.searchDemand} (${scoreDemand(p.searchDemand)})`,
    `commercialIntent: ${p.commercialIntent}`,
    `leadPotential: ${p.leadPotential}`,
    `cannibalizationRisk: ${p.cannibalizationRisk}`,
    `calculated tier: ${calculatePublishingPriority(page)}`,
  ];
  if (page.region) {
    const region = getRegionById(page.region);
    if (region) lines.push(`region ${region.title}: ${region.priority}`);
  }
  if (p.searchDemand === "unknown") {
    lines.push("⚠ searchDemand unknown — не публиковать без keyword validation");
  }
  return lines;
}

export { totalScore as publishingPriorityScore };
