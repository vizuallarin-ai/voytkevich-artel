import type { ContentCapacityRules } from "@/types/content-scheduling";
import type { ContentScheduleMode } from "@/types/content-calendar";

export const cautiousCapacityRules: ContentCapacityRules = {
  mode: "cautious",
  maxSitePublicationsPerDay: 3,
  maxExternalPublicationsPerDay: 5,
  maxProgrammaticPagesPerDay: 1,
  maxTechnicalArticlesPerDay: 2,
  maxEditorialItemsPerDay: 1,
  maxNewsItemsPerDay: 1,
  maxDigestItemsPerWeek: 2,
  minHoursBetweenPublications: 2,
  warnings: {
    sitePublicationWarningThreshold: 2,
    externalPublicationWarningThreshold: 4,
  },
};

export const workingCapacityRules: ContentCapacityRules = {
  mode: "working",
  maxSitePublicationsPerDay: 7,
  maxExternalPublicationsPerDay: 15,
  maxProgrammaticPagesPerDay: 2,
  maxTechnicalArticlesPerDay: 3,
  maxEditorialItemsPerDay: 2,
  maxNewsItemsPerDay: 2,
  maxDigestItemsPerWeek: 3,
  minHoursBetweenPublications: 1,
  warnings: {
    sitePublicationWarningThreshold: 5,
    externalPublicationWarningThreshold: 12,
  },
};

export const aggressiveCapacityRules: ContentCapacityRules = {
  mode: "aggressive",
  maxSitePublicationsPerDay: 15,
  maxExternalPublicationsPerDay: 40,
  maxProgrammaticPagesPerDay: 5,
  maxTechnicalArticlesPerDay: 5,
  maxEditorialItemsPerDay: 3,
  maxNewsItemsPerDay: 3,
  maxDigestItemsPerWeek: 5,
  minHoursBetweenPublications: 0.5,
  warnings: {
    sitePublicationWarningThreshold: 12,
    externalPublicationWarningThreshold: 30,
  },
};

export const capacityRulesByMode: Record<ContentScheduleMode, ContentCapacityRules> = {
  cautious: cautiousCapacityRules,
  working: workingCapacityRules,
  aggressive: aggressiveCapacityRules,
  manual: workingCapacityRules,
};

export function getCapacityRules(mode: ContentScheduleMode): ContentCapacityRules {
  return capacityRulesByMode[mode] ?? workingCapacityRules;
}
