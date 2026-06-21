import { recommendationAnalytics } from "@/lib/recommendations/recommendation-analytics";
import { recommendationQualityService } from "@/lib/recommendations/recommendation-quality-service";
import { recommendationAttributionService } from "@/lib/recommendations/recommendation-attribution-service";
import { recommendationStore } from "@/lib/recommendations/recommendation-store";
import { recommendationPlacementRegistry } from "@/lib/recommendations/recommendation-placement-registry";
import { filterBubbleGuard } from "@/lib/recommendations/filter-bubble-guard";
import type { RecommendationContext } from "@/types/recommendation-context";

function defaultPeriod(): { from: string; to: string } {
  const to = new Date();
  const from = new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000);
  return { from: from.toISOString(), to: to.toISOString() };
}

export function getRecommendationDashboardOverview(period = defaultPeriod()) {
  const quality = recommendationQualityService.calculateRecommendationQuality(period);
  const assistedLeads = recommendationAttributionService.getRecommendationAssistedLeads(period);
  const placements = recommendationPlacementRegistry.listPlacements().map((p) =>
    recommendationQualityService.calculatePlacementQuality(p.id, period),
  );

  return {
    period,
    kpi: quality,
    assistedLeads: assistedLeads.length,
    directLeads: recommendationAttributionService.getDirectRecommendationLeads(period).length,
    topPlacements: placements.sort((a, b) => b.clicked - a.clicked).slice(0, 5),
    lowQualityItems: recommendationQualityService.detectLowQualityRecommendations(period),
    highDismissalItems: recommendationQualityService.detectHighDismissalRecommendations(period),
    privacyWarnings: recommendationStore.listPrivacySettings().filter((s) => !s.personalizationEnabled).length,
  };
}

export function getPrivacyDashboardSummary() {
  const settings = recommendationStore.listPrivacySettings();
  return {
    activeModes: {
      contextual: settings.filter((s) => s.personalizationEnabled).length,
      disabled: settings.filter((s) => !s.personalizationEnabled).length,
    },
    consentRate: settings.length > 0 ? settings.filter((s) => s.persistentPreferencesEnabled).length / settings.length : 0,
    profileResets: recommendationAnalytics.listEvents(500).filter((e) => e.eventName === "recommendation_profile_reset").length,
    expiredSessions: recommendationStore.listJourneys().filter((j) => new Date(j.expiresAt).getTime() < Date.now()).length,
    persistentPreferenceCount: recommendationStore.listPreferences().filter((p) => p.persistent).length,
  };
}

export function getRulesDashboardSummary() {
  const rulesets = recommendationStore.listRulesets();
  const active = rulesets.find((r) => r.status === "active");
  return {
    activeRuleset: active,
    draftCount: rulesets.filter((r) => r.status === "draft").length,
    recentAudit: recommendationStore.listAudit(20),
  };
}

export function getFilterBubbleWarnings(context: RecommendationContext): string | null {
  return filterBubbleGuard.buildFilterBubbleWarning(context);
}

export const recommendationDashboardService = {
  getRecommendationDashboardOverview,
  getPrivacyDashboardSummary,
  getRulesDashboardSummary,
  getFilterBubbleWarnings,
};
