import { recordServerAnalyticsEvent } from "@/lib/analytics/server-events";

type AnalyticsPrimitive = string | number | boolean | null | undefined;
type AnalyticsPayload = Record<string, AnalyticsPrimitive>;

const PHONE_PATTERN = /\+?\d[\d\s\-()]{8,}\d/;
const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;

function sanitizeValue(value: AnalyticsPrimitive): AnalyticsPrimitive {
  if (typeof value !== "string") return value;
  if (PHONE_PATTERN.test(value)) return "[redacted-phone]";
  if (EMAIL_PATTERN.test(value)) return "[redacted-email]";
  return value.slice(0, 200);
}

function sanitizePayload(payload?: AnalyticsPayload): AnalyticsPayload | undefined {
  if (!payload) return undefined;
  const safe: AnalyticsPayload = {};
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined || value === null) continue;
    if (key.toLowerCase().includes("query") || key.toLowerCase().includes("message")) {
      safe[`${key}Length`] = String(value).length;
      continue;
    }
    safe[key] = sanitizeValue(value);
  }
  return Object.keys(safe).length > 0 ? safe : undefined;
}

export async function trackEvent(eventName: string, payload?: AnalyticsPayload): Promise<void> {
  const safePayload = sanitizePayload(payload);
  await recordServerAnalyticsEvent({
    name: eventName,
    category: "automation",
    action: safePayload
      ? {
          value: JSON.stringify(safePayload).slice(0, 500),
        }
      : undefined,
  });
}

export async function trackQuestionReceived(sessionId: string, query: string): Promise<void> {
  await trackEvent("ai_navigation_question_received", {
    sessionId,
    queryLength: query.length,
  });
}

export async function trackInjectionBlocked(sessionId: string): Promise<void> {
  await trackEvent("ai_navigation_injection_blocked", { sessionId });
}

export async function trackRetrievalCompleted(
  sessionId: string,
  payload: { fragmentCount: number; sourceCount: number },
): Promise<void> {
  await trackEvent("ai_navigation_retrieval_completed", {
    sessionId,
    fragmentCount: payload.fragmentCount,
    sourceCount: payload.sourceCount,
  });
}

export async function trackAnswerGenerated(
  sessionId: string,
  payload: { answerability: string; confidence: string; citationCount: number },
): Promise<void> {
  await trackEvent("ai_navigation_answer_generated", {
    sessionId,
    answerability: payload.answerability,
    confidence: payload.confidence,
    citationCount: payload.citationCount,
  });
}

export async function trackManagerHandoff(sessionId: string, reason: string): Promise<void> {
  await trackEvent("ai_navigation_manager_handoff", { sessionId, reason });
}

export async function trackLeadCreated(
  sessionId: string,
  payload: { leadId?: string; channel: string },
): Promise<void> {
  await trackEvent("ai_navigation_lead_created", {
    sessionId,
    leadId: payload.leadId,
    channel: payload.channel,
  });
}

export async function trackAssistantFailure(sessionId: string, errorCode: string): Promise<void> {
  await trackEvent("ai_navigation_failure", { sessionId, errorCode });
}

export const aiNavigationAnalytics = {
  trackEvent,
  trackQuestionReceived,
  trackInjectionBlocked,
  trackRetrievalCompleted,
  trackAnswerGenerated,
  trackManagerHandoff,
  trackLeadCreated,
  trackAssistantFailure,
};
