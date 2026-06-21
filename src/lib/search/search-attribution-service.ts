import { searchStore } from "@/lib/search/search-store";

export function buildSearchJourney(
  sessionId: string,
  payload: { queryId?: string; documentId?: string } = {},
) {
  const existing = searchStore.findJourneyBySession(sessionId);
  const now = new Date().toISOString();

  if (existing) {
    const updated = searchStore.saveJourney({
      ...existing,
      queryIds: payload.queryId ? [...new Set([...existing.queryIds, payload.queryId])] : existing.queryIds,
      documentIds: payload.documentId
        ? [...new Set([...existing.documentIds, payload.documentId])]
        : existing.documentIds,
      lastActivityAt: now,
    });
    return updated;
  }

  return searchStore.saveJourney({
    sessionId,
    queryIds: payload.queryId ? [payload.queryId] : [],
    documentIds: payload.documentId ? [payload.documentId] : [],
    startedAt: now,
    lastActivityAt: now,
  });
}

export function attributeLeadToSearchJourney(
  leadId: string,
  sessionId: string,
  confidence: "low" | "medium" | "high" = "medium",
) {
  const journey = searchStore.findJourneyBySession(sessionId);
  if (!journey) return null;

  const attributedJourney = searchStore.saveJourney({
    ...journey,
    convertedLeadId: leadId,
    lastActivityAt: new Date().toISOString(),
  });

  const attribution = searchStore.saveAttribution({
    leadId,
    journeyId: attributedJourney.id,
    confidence,
  });

  return { journey: attributedJourney, attribution };
}

export const searchAttributionService = {
  buildSearchJourney,
  attributeLeadToSearchJourney,
};
