import type { DemandLevel, PriorityTier, ProgrammaticSEOPage, RiskLevel } from "@/types/programmatic-seo";

/** Веса для расчёта publishPriority. Частотность не выдумываем — unknown = нейтрально. */
export const priorityWeights = {
  searchDemand: { high: 4, medium: 2, low: 1, unknown: 0 },
  commercialIntent: { high: 4, medium: 2, low: 1 },
  leadPotential: { high: 4, medium: 2, low: 1 },
  contentDifficulty: { high: -2, medium: -1, low: 0 },
  uniquenessRisk: { high: -3, medium: -1, low: 0 },
  cannibalizationRisk: { high: -4, medium: -2, low: 0 },
  regionPriority: { P1: 3, P2: 2, P3: 1, P4: 0, P5: 0 },
  pageTypePriority: {
    "project-location-page": 2,
    "project-category": 3,
    "project-size-page": 2,
    "project-material-page": 2,
    "project-feature-page": 1,
    "project-page": 2,
    "technical-how-to": 1,
    "technical-guide": 1,
    "editorial-story": 0,
    "news-digest": 0,
    "regulation-update": -1,
    "comparison-page": 1,
    "faq-page": 1,
    "opinion-article": 0,
  } as Record<string, number>,
} as const;

export const priorityTierDefinitions: Record<
  PriorityTier,
  { label: string; description: string }
> = {
  P1: {
    label: "P1 — горячий коммерческий",
    description: "Категории под ключ, ключевые типоразмеры, Иркутск/область — после review.",
  },
  P2: {
    label: "P2 — категории и типоразмеры",
    description: "Материалы, бани, среднечастотные project landing.",
  },
  P3: {
    label: "P3 — long-tail проекты и регионы",
    description: "Узкие комбинации и локации после keyword validation.",
  },
  P4: {
    label: "P4 — информационные",
    description: "How-to, гиды, сравнения — после качества и дисклеймера.",
  },
  P5: {
    label: "P5 — эксперимент",
    description: "Редакционные истории, дайджесты — низкий приоритет индексации.",
  },
};

export function scoreDemand(level: DemandLevel): number {
  return priorityWeights.searchDemand[level];
}

export function scoreRisk(level: RiskLevel, map: Record<RiskLevel, number>): number {
  return map[level];
}

export function regionPriorityToScore(tier: PriorityTier): number {
  return priorityWeights.regionPriority[tier] ?? 0;
}

export function pageTypePriorityScore(pageType: string): number {
  return priorityWeights.pageTypePriority[pageType] ?? 0;
}

export function defaultPriorityForPageType(
  pageType: ProgrammaticSEOPage["pageType"],
): ProgrammaticSEOPage["priority"] {
  const commercialTypes: ProgrammaticSEOPage["pageType"][] = [
    "project-category",
    "project-size-page",
    "project-material-page",
    "project-location-page",
  ];
  const isCommercial = commercialTypes.includes(pageType);

  return {
    searchDemand: "unknown",
    commercialIntent: isCommercial ? "high" : pageType.startsWith("technical") ? "low" : "medium",
    leadPotential: isCommercial ? "high" : pageType === "editorial-story" ? "low" : "medium",
    contentDifficulty:
      pageType === "technical-guide" || pageType === "comparison-page" ? "high" : "medium",
    uniquenessRisk: pageType === "project-location-page" ? "medium" : "low",
    cannibalizationRisk: pageType === "project-location-page" ? "medium" : "low",
    publishPriority: isCommercial ? "P2" : pageType.startsWith("technical") ? "P4" : "P5",
  };
}
