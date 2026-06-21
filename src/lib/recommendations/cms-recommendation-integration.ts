import { recommendationStore } from "@/lib/recommendations/recommendation-store";
import { recommendationAnalytics } from "@/lib/recommendations/recommendation-analytics";
import { contentRepository } from "@/lib/content-cms/content-repository";
import { recommendationEligibilityService } from "@/lib/recommendations/recommendation-eligibility-service";
import { randomUUID } from "crypto";

export type CMSRecommendationSettings = {
  contentItemId: string;
  enabled: boolean;
  allowedPlacements: string[];
  pinnedTargets: string[];
  excludedTargets: string[];
  fallbackContentItemId?: string;
  reason?: string;
};

const settingsStore = new Map<string, CMSRecommendationSettings>();

function defaultSettings(contentItemId: string): CMSRecommendationSettings {
  return {
    contentItemId,
    enabled: true,
    allowedPlacements: [],
    pinnedTargets: [],
    excludedTargets: [],
  };
}

export function getCMSRecommendationSettings(contentItemId: string): CMSRecommendationSettings {
  return settingsStore.get(contentItemId) ?? defaultSettings(contentItemId);
}

export function updateCMSRecommendationSettings(
  contentItemId: string,
  input: Partial<CMSRecommendationSettings>,
): CMSRecommendationSettings {
  const current = getCMSRecommendationSettings(contentItemId);
  const updated = { ...current, ...input, contentItemId };
  settingsStore.set(contentItemId, updated);
  recommendationStore.listAudit(1);
  return updated;
}

export function pinCMSRecommendation(sourceId: string, targetId: string, _placement: string): CMSRecommendationSettings {
  const settings = getCMSRecommendationSettings(sourceId);
  if (!settings.pinnedTargets.includes(targetId)) {
    settings.pinnedTargets.push(targetId);
  }
  settingsStore.set(sourceId, settings);
  return settings;
}

export function excludeCMSRecommendation(sourceId: string, targetId: string, reason?: string): CMSRecommendationSettings {
  const settings = getCMSRecommendationSettings(sourceId);
  if (!settings.excludedTargets.includes(targetId)) {
    settings.excludedTargets.push(targetId);
  }
  settings.reason = reason;
  settingsStore.set(sourceId, settings);
  return settings;
}

export async function validateCMSManualRecommendation(sourceId: string, targetId: string): Promise<boolean> {
  const source = await contentRepository.getContentById(sourceId);
  const target = await contentRepository.getContentById(targetId);
  if (!source || !target) return false;
  if (target.status !== "published" || !target.indexing.indexable) return false;

  const eligible = await recommendationEligibilityService.isCMSItemRecommendable(targetId);
  return eligible;
}

export function getCMSRecommendationPerformance(contentItemId: string): {
  views: number;
  clicks: number;
  ctr: number;
} {
  const events = recommendationAnalytics.listEvents(500).filter(
    (e) => e.payload.contentItemId === contentItemId,
  );
  const views = events.filter((e) => e.eventName === "recommendation_viewed").length;
  const clicks = events.filter((e) => e.eventName === "recommendation_clicked").length;
  return { views, clicks, ctr: views > 0 ? clicks / views : 0 };
}

export const cmsRecommendationIntegration = {
  getCMSRecommendationSettings,
  updateCMSRecommendationSettings,
  pinCMSRecommendation,
  excludeCMSRecommendation,
  validateCMSManualRecommendation,
  getCMSRecommendationPerformance,
};
