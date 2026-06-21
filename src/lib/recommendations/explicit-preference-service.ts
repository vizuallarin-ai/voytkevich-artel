import { randomUUID } from "crypto";
import type { RecommendationContext } from "@/types/recommendation-context";
import type { RecommendationPreference } from "@/types/recommendation-preference";
import type { RecommendationCandidate } from "@/types/recommendation";
import { recommendationStore } from "@/lib/recommendations/recommendation-store";

const VALID_VALUES: Partial<Record<RecommendationPreference["key"], RegExp>> = {
  "building-type": /^(дом|коттедж|баня|таунхаус)/i,
  technology: /^(каркас|монолит|модуль)/i,
  material: /^(газобетон|кирпич|каркас|брус|монолит)/i,
  area: /^\d{2,4}$/,
  floors: /^[1-3]$/,
  location: /^[а-яёa-z\-\s]{2,40}$/i,
};

export function validatePreferenceValue(key: RecommendationPreference["key"], value: string): boolean {
  const pattern = VALID_VALUES[key];
  if (!pattern) return value.trim().length >= 2 && value.length <= 80;
  return pattern.test(value.trim());
}

export function setExplicitPreference(
  input: {
    sessionId?: string;
    userId?: string;
    key: RecommendationPreference["key"];
    value: string;
  },
  consent: { persistentPreferences: boolean },
): RecommendationPreference {
  if (!validatePreferenceValue(input.key, input.value)) {
    throw new Error(`Invalid preference value for key ${input.key}`);
  }
  if (input.userId && !consent.persistentPreferences) {
    throw new Error("Persistent preference requires consent");
  }

  const pref: RecommendationPreference = {
    id: randomUUID(),
    sessionId: input.sessionId,
    userId: input.userId,
    key: input.key,
    value: input.value.trim(),
    source: "explicit",
    confidence: "high",
    explicit: true,
    persistent: Boolean(input.userId && consent.persistentPreferences),
    createdAt: new Date().toISOString(),
    expiresAt: input.userId && consent.persistentPreferences ? undefined : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };
  return recommendationStore.savePreference(pref);
}

export function updateExplicitPreference(id: string, value: string): RecommendationPreference {
  const existing = recommendationStore.getPreference(id);
  if (!existing || !existing.explicit) throw new Error("Explicit preference not found");
  if (!validatePreferenceValue(existing.key, value)) throw new Error("Invalid preference value");
  return recommendationStore.savePreference({ ...existing, value: value.trim() });
}

export function removeExplicitPreference(id: string): void {
  recommendationStore.deletePreference(id);
}

export function listExplicitPreferences(context: RecommendationContext): RecommendationPreference[] {
  return recommendationStore
    .listPreferences({ sessionId: context.sessionId })
    .filter((p) => p.explicit);
}

export function resetExplicitPreferences(context: RecommendationContext): number {
  const prefs = listExplicitPreferences(context);
  for (const pref of prefs) {
    recommendationStore.deletePreference(pref.id);
  }
  return prefs.length;
}

export function applyExplicitPreferences(
  candidates: RecommendationCandidate[],
  preferences: RecommendationPreference[],
): RecommendationCandidate[] {
  const explicit = preferences.filter((p) => p.explicit);
  const inferred = preferences.filter((p) => !p.explicit);

  return candidates
    .map((candidate) => {
      let explicitMatch = 0;
      let inferredMatch = 0;
      const hay = `${candidate.title} ${candidate.description ?? ""}`.toLowerCase();

      for (const pref of explicit) {
        if (hay.includes(pref.value.toLowerCase())) explicitMatch++;
      }
      for (const pref of inferred) {
        if (pref.confidence === "low") continue;
        if (hay.includes(pref.value.toLowerCase())) inferredMatch++;
      }

      const boost = explicitMatch * 0.3 + inferredMatch * 0.1;
      return {
        ...candidate,
        description: explicitMatch > 0 ? "Совпадает с вашим выбором" : candidate.description,
        eligibility: { ...candidate.eligibility, available: candidate.eligibility.available },
      };
    })
    .sort((a, b) => {
      const aExplicit = a.description?.includes("вашим выбором") ? 1 : 0;
      const bExplicit = b.description?.includes("вашим выбором") ? 1 : 0;
      return bExplicit - aExplicit;
    });
}

export const explicitPreferenceService = {
  setExplicitPreference,
  updateExplicitPreference,
  removeExplicitPreference,
  listExplicitPreferences,
  resetExplicitPreferences,
  validatePreferenceValue,
  applyExplicitPreferences,
};
