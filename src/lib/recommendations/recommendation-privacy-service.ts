import type { RecommendationContext } from "@/types/recommendation-context";
import { recommendationStore, type RecommendationPrivacySettings } from "@/lib/recommendations/recommendation-store";
import { sessionRecommendationService } from "@/lib/recommendations/session-recommendation-service";
import { explicitPreferenceService } from "@/lib/recommendations/explicit-preference-service";
import { recommendationAnalytics } from "@/lib/recommendations/recommendation-analytics";

function privacyKey(context: RecommendationContext): string {
  return context.sessionId ?? context.requestId;
}

export function getPersonalizationSettings(context: RecommendationContext): RecommendationPrivacySettings {
  const key = privacyKey(context);
  return (
    recommendationStore.getPrivacySettings(key) ?? {
      sessionId: context.sessionId,
      personalizationEnabled: true,
      locationEnabled: context.consent.location,
      persistentPreferencesEnabled: context.consent.persistentPreferences,
      updatedAt: new Date().toISOString(),
    }
  );
}

export function updatePersonalizationSettings(
  input: Partial<RecommendationPrivacySettings> & { context: RecommendationContext },
): RecommendationPrivacySettings {
  const key = privacyKey(input.context);
  const current = getPersonalizationSettings(input.context);
  const updated: RecommendationPrivacySettings = {
    ...current,
    ...input,
    updatedAt: new Date().toISOString(),
  };
  recommendationStore.savePrivacySettings(key, updated);

  if (updated.personalizationEnabled) {
    recommendationAnalytics.trackRecommendationEvent("personalization_enabled", {
      sessionId: input.context.sessionId,
      requestId: input.context.requestId,
    });
  } else {
    recommendationAnalytics.trackRecommendationEvent("personalization_disabled", {
      sessionId: input.context.sessionId,
      requestId: input.context.requestId,
    });
  }

  return updated;
}

export function withdrawPersonalizationConsent(context: RecommendationContext): void {
  updatePersonalizationSettings({
    context,
    personalizationEnabled: false,
    persistentPreferencesEnabled: false,
    locationEnabled: false,
  });
  deletePersistentPreferences(context);
}

export function resetRecommendationProfile(context: RecommendationContext): void {
  if (context.sessionId) {
    sessionRecommendationService.clearSessionRecommendationData(context.sessionId);
  }
  explicitPreferenceService.resetExplicitPreferences(context);
  recommendationAnalytics.trackRecommendationEvent("recommendation_profile_reset", {
    sessionId: context.sessionId,
    requestId: context.requestId,
  });
}

export function deletePersistentPreferences(context: RecommendationContext): number {
  const prefs = recommendationStore.listPreferences({ sessionId: context.sessionId });
  let deleted = 0;
  for (const pref of prefs) {
    if (pref.persistent) {
      recommendationStore.deletePreference(pref.id);
      deleted++;
    }
  }
  return deleted;
}

export function exportRecommendationPreferences(context: RecommendationContext) {
  return recommendationStore.listPreferences({ sessionId: context.sessionId });
}

export function enforcePrivacyMode(context: RecommendationContext): RecommendationContext {
  const settings = getPersonalizationSettings(context);
  if (!settings.personalizationEnabled) {
    return {
      ...context,
      mode: "contextual",
      consent: {
        personalization: false,
        location: false,
        persistentPreferences: false,
      },
      viewedContentIds: [],
      clickedRecommendationIds: [],
    };
  }
  if (!settings.locationEnabled) {
    return {
      ...context,
      consent: { ...context.consent, location: false },
      preferences: { ...context.preferences, locations: [] },
    };
  }
  if (!settings.persistentPreferencesEnabled) {
    return {
      ...context,
      consent: { ...context.consent, persistentPreferences: false },
    };
  }
  return context;
}

export const recommendationPrivacyService = {
  getPersonalizationSettings,
  updatePersonalizationSettings,
  withdrawPersonalizationConsent,
  resetRecommendationProfile,
  deletePersistentPreferences,
  exportRecommendationPreferences,
  enforcePrivacyMode,
};
