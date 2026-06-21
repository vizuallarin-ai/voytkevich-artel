import { randomUUID } from "crypto";
import type { RecommendationPreference } from "@/types/recommendation-preference";
import type { RecommendationRuleset } from "@/types/recommendation-ruleset";
import type { PersonalizationMode, UserJourneyStage } from "@/types/recommendation-context";

const EMAIL_RE = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const PHONE_RE = /(?:\+?7|8)\s*\(?\d{3}\)?[\s-]*\d{3}[\s-]*\d{2}[\s-]*\d{2}/g;

export type RecommendationExposureRecord = {
  id: string;
  sessionId?: string;
  contentItemId?: string;
  recommendationId: string;
  placement: string;
  recommendationType: string;
  count: number;
  lastExposedAt: string;
  expiresAt?: string;
};

export type RecommendationFeedbackRecord = {
  id: string;
  sessionId?: string;
  recommendationId: string;
  contentItemId?: string;
  placement?: string;
  feedbackType:
    | "helpful"
    | "not-relevant"
    | "already-seen"
    | "not-interested"
    | "wrong-params"
    | "unavailable"
    | "hide"
    | "reset-preferences";
  message?: string;
  status: "queued" | "reviewed" | "dismissed";
  createdAt: string;
  updatedAt?: string;
};

export type RecommendationJourneyRecord = {
  id: string;
  sessionId: string;
  viewedContentIds: string[];
  clickedRecommendationIds: string[];
  dismissedRecommendationIds: string[];
  journeyStage: UserJourneyStage;
  personalizationMode: PersonalizationMode;
  startedAt: string;
  lastActivityAt: string;
  expiresAt: string;
  convertedLeadId?: string;
};

export type RecommendationPrivacySettings = {
  sessionId?: string;
  userId?: string;
  personalizationEnabled: boolean;
  locationEnabled: boolean;
  persistentPreferencesEnabled: boolean;
  updatedAt: string;
};

export type RecommendationAuditEntry = {
  id: string;
  action: string;
  entityType:
    | "preference"
    | "exposure"
    | "feedback"
    | "journey"
    | "privacy"
    | "ruleset"
    | "attribution"
    | "analytics"
    | "cms-pin"
    | "cms-exclusion";
  entityId: string;
  actorId?: string;
  previousValue?: string;
  newValue?: string;
  reason?: string;
  createdAt: string;
};

export type RecommendationAnalyticsEvent = {
  id: string;
  eventName: string;
  payload: Record<string, unknown>;
  occurredAt: string;
};

const preferences = new Map<string, RecommendationPreference>();
const exposures = new Map<string, RecommendationExposureRecord>();
const feedbackQueue = new Map<string, RecommendationFeedbackRecord>();
const journeys = new Map<string, RecommendationJourneyRecord>();
const privacySettings = new Map<string, RecommendationPrivacySettings>();
const rulesets = new Map<string, RecommendationRuleset>();
const auditLog: RecommendationAuditEntry[] = [];
const analyticsEvents: RecommendationAnalyticsEvent[] = [];

function sanitizeFreeText(value: string): string {
  return value.replace(EMAIL_RE, "[redacted-email]").replace(PHONE_RE, "[redacted-phone]").trim();
}

function sanitizePayload(payload: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (typeof value === "string") {
      result[key] = sanitizeFreeText(value);
    } else if (Array.isArray(value)) {
      result[key] = value.map((v) => (typeof v === "string" ? sanitizeFreeText(v) : v));
    } else {
      result[key] = value;
    }
  }
  return result;
}

function pushAudit(entry: Omit<RecommendationAuditEntry, "id" | "createdAt">): RecommendationAuditEntry {
  const full: RecommendationAuditEntry = {
    ...entry,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  };
  auditLog.unshift(full);
  if (auditLog.length > 5000) auditLog.pop();
  return full;
}

function exposureKey(sessionId: string | undefined, recommendationId: string, placement: string): string {
  return `${sessionId ?? "anonymous"}:${placement}:${recommendationId}`;
}

export const recommendationStore = {
  savePreference(pref: RecommendationPreference): RecommendationPreference {
    const sanitized: RecommendationPreference = {
      ...pref,
      value: sanitizeFreeText(pref.value),
    };
    preferences.set(sanitized.id, sanitized);
    pushAudit({ action: "save", entityType: "preference", entityId: sanitized.id });
    return sanitized;
  },

  getPreference(id: string): RecommendationPreference | undefined {
    return preferences.get(id);
  },

  listPreferences(filter?: { sessionId?: string; userId?: string }): RecommendationPreference[] {
    return [...preferences.values()].filter((p) => {
      if (filter?.sessionId && p.sessionId !== filter.sessionId) return false;
      if (filter?.userId && p.userId !== filter.userId) return false;
      return true;
    });
  },

  deletePreference(id: string): void {
    preferences.delete(id);
    pushAudit({ action: "delete", entityType: "preference", entityId: id });
  },

  saveExposure(
    record: Omit<RecommendationExposureRecord, "id" | "count" | "lastExposedAt"> & Partial<RecommendationExposureRecord>,
  ): RecommendationExposureRecord {
    const key = exposureKey(record.sessionId, record.recommendationId, record.placement);
    const existing = exposures.get(key);
    const full: RecommendationExposureRecord = {
      id: existing?.id ?? record.id ?? randomUUID(),
      sessionId: record.sessionId,
      contentItemId: record.contentItemId,
      recommendationId: record.recommendationId,
      placement: record.placement,
      recommendationType: record.recommendationType,
      count: (existing?.count ?? 0) + 1,
      lastExposedAt: new Date().toISOString(),
      expiresAt: record.expiresAt,
    };
    exposures.set(key, full);
    pushAudit({ action: "save", entityType: "exposure", entityId: full.id });
    return full;
  },

  getExposure(sessionId: string | undefined, recommendationId: string, placement: string): RecommendationExposureRecord | undefined {
    return exposures.get(exposureKey(sessionId, recommendationId, placement));
  },

  listExposures(sessionId?: string): RecommendationExposureRecord[] {
    return [...exposures.values()].filter((e) => !sessionId || e.sessionId === sessionId);
  },

  saveFeedback(
    record: Omit<RecommendationFeedbackRecord, "id" | "createdAt" | "status"> & Partial<RecommendationFeedbackRecord>,
  ): RecommendationFeedbackRecord {
    const full: RecommendationFeedbackRecord = {
      id: record.id ?? randomUUID(),
      sessionId: record.sessionId,
      recommendationId: record.recommendationId,
      contentItemId: record.contentItemId,
      placement: record.placement,
      feedbackType: record.feedbackType,
      message: record.message ? sanitizeFreeText(record.message) : undefined,
      status: record.status ?? "queued",
      createdAt: record.createdAt ?? new Date().toISOString(),
      updatedAt: record.updatedAt,
    };
    feedbackQueue.set(full.id, full);
    pushAudit({ action: "save", entityType: "feedback", entityId: full.id });
    return full;
  },

  listFeedback(limit = 500): RecommendationFeedbackRecord[] {
    return [...feedbackQueue.values()]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  },

  saveJourney(journey: RecommendationJourneyRecord): RecommendationJourneyRecord {
    journeys.set(journey.id, journey);
    pushAudit({ action: "save", entityType: "journey", entityId: journey.id });
    return journey;
  },

  getJourney(id: string): RecommendationJourneyRecord | undefined {
    return journeys.get(id);
  },

  findJourneyBySession(sessionId: string): RecommendationJourneyRecord | undefined {
    return [...journeys.values()].find((j) => j.sessionId === sessionId);
  },

  listJourneys(): RecommendationJourneyRecord[] {
    return [...journeys.values()].sort((a, b) => b.lastActivityAt.localeCompare(a.lastActivityAt));
  },

  deleteJourney(id: string): void {
    journeys.delete(id);
    pushAudit({ action: "delete", entityType: "journey", entityId: id });
  },

  getPrivacySettings(key: string): RecommendationPrivacySettings | undefined {
    return privacySettings.get(key);
  },

  savePrivacySettings(key: string, settings: RecommendationPrivacySettings): RecommendationPrivacySettings {
    privacySettings.set(key, settings);
    pushAudit({ action: "save", entityType: "privacy", entityId: key });
    return settings;
  },

  listPrivacySettings(): RecommendationPrivacySettings[] {
    return [...privacySettings.values()];
  },

  saveRuleset(ruleset: RecommendationRuleset): RecommendationRuleset {
    rulesets.set(ruleset.id, ruleset);
    pushAudit({ action: "save", entityType: "ruleset", entityId: ruleset.id });
    return ruleset;
  },

  getRuleset(id: string): RecommendationRuleset | undefined {
    return rulesets.get(id);
  },

  listRulesets(): RecommendationRuleset[] {
    return [...rulesets.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  getActiveRuleset(): RecommendationRuleset | undefined {
    return [...rulesets.values()].find((r) => r.status === "active");
  },

  listAudit(limit = 500): RecommendationAuditEntry[] {
    return auditLog.slice(0, limit);
  },

  saveAnalyticsEvent(
    event: Omit<RecommendationAnalyticsEvent, "id" | "occurredAt"> & Partial<RecommendationAnalyticsEvent>,
  ): RecommendationAnalyticsEvent {
    const full: RecommendationAnalyticsEvent = {
      id: event.id ?? randomUUID(),
      eventName: event.eventName,
      payload: sanitizePayload(event.payload ?? {}),
      occurredAt: event.occurredAt ?? new Date().toISOString(),
    };
    analyticsEvents.unshift(full);
    if (analyticsEvents.length > 10000) analyticsEvents.pop();
    pushAudit({ action: "save", entityType: "analytics", entityId: full.id });
    return full;
  },

  listAnalyticsEvents(limit = 1000): RecommendationAnalyticsEvent[] {
    return analyticsEvents.slice(0, limit);
  },

  clear(): void {
    preferences.clear();
    exposures.clear();
    feedbackQueue.clear();
    journeys.clear();
    privacySettings.clear();
    rulesets.clear();
    auditLog.length = 0;
    analyticsEvents.length = 0;
  },
};
