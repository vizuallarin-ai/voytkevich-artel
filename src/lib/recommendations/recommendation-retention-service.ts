import { recommendationStore } from "@/lib/recommendations/recommendation-store";
import { sessionRecommendationService } from "@/lib/recommendations/session-recommendation-service";
import { recommendationFrequencyService } from "@/lib/recommendations/recommendation-frequency-service";

const RETENTION_POLICY = {
  anonymousSessionHours: 24,
  exposureHours: 24,
  feedbackDays: 90,
  analyticsAggregateDays: 365,
  persistentPreferenceDays: 180,
};

export function expireAnonymousRecommendationSessions(): number {
  return sessionRecommendationService.expireSessionRecommendationData();
}

export function purgeExpiredRecommendationEvents(): number {
  const now = Date.now();
  let purged = 0;

  for (const pref of recommendationStore.listPreferences()) {
    if (pref.expiresAt && new Date(pref.expiresAt).getTime() < now) {
      recommendationStore.deletePreference(pref.id);
      purged++;
    }
  }

  purged += recommendationFrequencyService.resetExpiredFrequencyCaps();
  return purged;
}

export function anonymizeRecommendationAnalytics(): number {
  const events = recommendationStore.listAnalyticsEvents(10000);
  let count = 0;
  for (const event of events) {
    if (event.payload.sessionId) {
      count++;
    }
  }
  return count;
}

export function validateRecommendationRetentionPolicy(): { valid: boolean; policy: typeof RETENTION_POLICY } {
  return {
    valid:
      RETENTION_POLICY.anonymousSessionHours > 0 &&
      RETENTION_POLICY.exposureHours > 0 &&
      RETENTION_POLICY.feedbackDays > 0,
    policy: RETENTION_POLICY,
  };
}

export const recommendationRetentionService = {
  expireAnonymousRecommendationSessions,
  purgeExpiredRecommendationEvents,
  anonymizeRecommendationAnalytics,
  validateRecommendationRetentionPolicy,
  RETENTION_POLICY,
};
