import { randomUUID } from "crypto";
import type { RecommendationContext, UserJourneyStage } from "@/types/recommendation-context";
import type { RecommendationPreference, PreferenceSource } from "@/types/recommendation-preference";
import type { RecommendationCandidate, RecommendationItem } from "@/types/recommendation";
import { recommendationStore } from "@/lib/recommendations/recommendation-store";
import { navigationMemoryService } from "@/lib/ai-navigation/navigation-memory-service";
import { journeyStageService } from "@/lib/recommendations/journey-stage-service";

export type SessionEvent = {
  type: "view" | "click" | "search" | "filter" | "dismiss";
  contentItemId?: string;
  recommendationId?: string;
  filterKey?: string;
  filterValue?: string;
  query?: string;
  occurredAt?: string;
};

export type AnonymousSessionProfile = {
  sessionId: string;
  viewedContentIds: string[];
  clickedRecommendationIds: string[];
  dismissedRecommendationIds: string[];
  inferredPreferences: RecommendationPreference[];
  journeyStage: UserJourneyStage;
  signalStrength: "low" | "medium" | "high";
  lastActivityAt: string;
};

const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

function prefKeyToField(key: RecommendationPreference["key"]): keyof RecommendationContext["preferences"] | null {
  const map: Partial<Record<RecommendationPreference["key"], keyof RecommendationContext["preferences"]>> = {
    "building-type": "buildingTypes",
    technology: "technologies",
    material: "materials",
    size: "sizes",
    area: "areas",
    floors: "floors",
    layout: "layouts",
    location: "locations",
  };
  return map[key] ?? null;
}

export function buildAnonymousSessionProfile(events: SessionEvent[]): AnonymousSessionProfile {
  const sessionId = randomUUID();
  const viewed = new Set<string>();
  const clicked: string[] = [];
  const dismissed: string[] = [];
  const inferred: RecommendationPreference[] = [];

  for (const event of events) {
    if (event.type === "view" && event.contentItemId) viewed.add(event.contentItemId);
    if (event.type === "click" && event.recommendationId) clicked.push(event.recommendationId);
    if (event.type === "dismiss" && event.recommendationId) dismissed.push(event.recommendationId);
    if (event.type === "filter" && event.filterKey && event.filterValue) {
      inferred.push({
        id: randomUUID(),
        sessionId,
        key: event.filterKey as RecommendationPreference["key"],
        value: event.filterValue,
        source: "search-filter",
        confidence: viewed.size >= 2 ? "medium" : "low",
        explicit: false,
        persistent: false,
        createdAt: new Date().toISOString(),
      });
    }
  }

  const signalStrength = viewed.size >= 3 ? "high" : viewed.size >= 2 ? "medium" : "low";

  return {
    sessionId,
    viewedContentIds: [...viewed],
    clickedRecommendationIds: clicked,
    dismissedRecommendationIds: dismissed,
    inferredPreferences: inferred,
    journeyStage: "exploration",
    signalStrength,
    lastActivityAt: new Date().toISOString(),
  };
}

export function updateSessionPreferences(
  sessionId: string,
  event: SessionEvent,
): RecommendationPreference[] {
  const journey = recommendationStore.findJourneyBySession(sessionId);
  const now = new Date().toISOString();

  if (event.type === "view" && event.contentItemId && journey) {
    journey.viewedContentIds = [...new Set([...journey.viewedContentIds, event.contentItemId])];
    journey.lastActivityAt = now;
    recommendationStore.saveJourney(journey);
  }

  if (event.type === "filter" && event.filterKey && event.filterValue) {
    const confidence = (journey?.viewedContentIds.length ?? 0) >= 2 ? "medium" : "low";
    const pref: RecommendationPreference = {
      id: randomUUID(),
      sessionId,
      key: event.filterKey as RecommendationPreference["key"],
      value: event.filterValue,
      source: "search-filter" as PreferenceSource,
      confidence,
      explicit: false,
      persistent: false,
      createdAt: now,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
    };
    recommendationStore.savePreference(pref);
    return [pref];
  }

  return recommendationStore.listPreferences({ sessionId }).filter((p) => !p.explicit);
}

export function inferJourneyStage(sessionId: string): UserJourneyStage {
  const journey = recommendationStore.findJourneyBySession(sessionId);
  const navMemory = navigationMemoryService.get(sessionId);
  const context: RecommendationContext = {
    requestId: randomUUID(),
    sessionId,
    mode: "anonymous-session",
    preferences: {
      buildingTypes: navMemory.buildingType ? [navMemory.buildingType] : [],
      technologies: navMemory.technology ? [navMemory.technology] : [],
      materials: navMemory.material ? [navMemory.material] : [],
      sizes: [],
      areas: navMemory.area ? [navMemory.area] : [],
      floors: navMemory.floors ? [navMemory.floors] : [],
      layouts: [],
      locations: navMemory.location ? [navMemory.location] : [],
    },
    journeyStage: journey?.journeyStage ?? "unknown",
    viewedContentIds: journey?.viewedContentIds ?? navMemory.viewedContentIds ?? [],
    clickedRecommendationIds: journey?.clickedRecommendationIds ?? [],
    dismissedRecommendationIds: journey?.dismissedRecommendationIds ?? [],
    consent: { personalization: true, location: false, persistentPreferences: false },
    createdAt: new Date().toISOString(),
  };
  return journeyStageService.detectJourneyStage(context);
}

export function getSessionRecommendationContext(sessionId: string): Partial<RecommendationContext> {
  const journey = recommendationStore.findJourneyBySession(sessionId);
  const navMemory = navigationMemoryService.get(sessionId);
  const sessionPrefs = recommendationStore.listPreferences({ sessionId });

  const preferences: RecommendationContext["preferences"] = {
    buildingTypes: [],
    technologies: [],
    materials: [],
    sizes: [],
    areas: [],
    floors: [],
    layouts: [],
    locations: [],
  };

  for (const pref of sessionPrefs) {
    const field = prefKeyToField(pref.key);
    if (!field) continue;
    if (!preferences[field].includes(pref.value)) {
      preferences[field].push(pref.value);
    }
  }

  if (navMemory.buildingType && !preferences.buildingTypes.includes(navMemory.buildingType)) {
    preferences.buildingTypes.push(navMemory.buildingType);
  }
  if (navMemory.technology) preferences.technologies.push(navMemory.technology);
  if (navMemory.material) preferences.materials.push(navMemory.material);
  if (navMemory.area) preferences.areas.push(navMemory.area);
  if (navMemory.floors) preferences.floors.push(navMemory.floors);
  if (navMemory.location) preferences.locations.push(navMemory.location);

  return {
    sessionId,
    mode: "anonymous-session",
    preferences,
    journeyStage: journey?.journeyStage ?? inferJourneyStage(sessionId),
    viewedContentIds: journey?.viewedContentIds ?? navMemory.viewedContentIds ?? [],
    clickedRecommendationIds: journey?.clickedRecommendationIds ?? [],
    dismissedRecommendationIds: journey?.dismissedRecommendationIds ?? [],
  };
}

export function recommendFromSession(
  sessionId: string,
  candidates: RecommendationCandidate[],
): RecommendationCandidate[] {
  const profile = getSessionRecommendationContext(sessionId);
  const viewed = new Set(profile.viewedContentIds ?? []);
  const dismissed = new Set(profile.dismissedRecommendationIds ?? []);

  return candidates
    .filter((c) => !viewed.has(c.contentItemId ?? "") && !dismissed.has(c.id))
    .map((c) => {
      let boost = 0;
      const hay = `${c.title} ${c.description ?? ""}`.toLowerCase();
      for (const tech of profile.preferences?.technologies ?? []) {
        if (hay.includes(tech.toLowerCase())) boost += 0.1;
      }
      return { ...c, description: c.description ?? (boost > 0 ? "Совпадает с интересами сессии" : undefined) };
    })
    .sort((a, b) => (b.description?.includes("Совпадает") ? 1 : 0) - (a.description?.includes("Совпадает") ? 1 : 0));
}

export function decaySessionSignals(sessionId: string): void {
  const prefs = recommendationStore.listPreferences({ sessionId });
  const now = Date.now();
  for (const pref of prefs) {
    if (pref.explicit) continue;
    if (pref.expiresAt && new Date(pref.expiresAt).getTime() < now) {
      recommendationStore.deletePreference(pref.id);
    } else if (pref.confidence === "high" && !pref.explicit) {
      recommendationStore.savePreference({ ...pref, confidence: "medium" });
    }
  }
}

export function clearSessionRecommendationData(sessionId: string): void {
  const journey = recommendationStore.findJourneyBySession(sessionId);
  if (journey) recommendationStore.deleteJourney(journey.id);
  for (const pref of recommendationStore.listPreferences({ sessionId })) {
    if (!pref.persistent) recommendationStore.deletePreference(pref.id);
  }
  navigationMemoryService.clearNavigationMemory(sessionId);
}

export function expireSessionRecommendationData(): number {
  const now = Date.now();
  let expired = 0;
  for (const journey of recommendationStore.listJourneys()) {
    if (new Date(journey.expiresAt).getTime() < now) {
      clearSessionRecommendationData(journey.sessionId);
      expired++;
    }
  }
  return expired;
}

export const sessionRecommendationService = {
  buildAnonymousSessionProfile,
  updateSessionPreferences,
  inferJourneyStage,
  getSessionRecommendationContext,
  recommendFromSession,
  decaySessionSignals,
  clearSessionRecommendationData,
  expireSessionRecommendationData,
};
