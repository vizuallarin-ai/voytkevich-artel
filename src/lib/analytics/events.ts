import { trackEvent as trackEventBase, YM_ID } from "@/lib/analytics";
import type { ConversionGoalId } from "./conversion-goals";
import { getConversionGoal } from "./conversion-goals";
import { legacyEventToAnalyticsName, inferCategoryFromEvent } from "./analytics-event";
import { recordAnalyticsEvent } from "./capture-client";
import type { AnalyticsEvent } from "@/types/analytics";
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";

export function trackEvent(eventName: string, payload?: Record<string, unknown>) {
  trackEventBase(eventName, payload);

  if (typeof window !== "undefined" && window.gtag && GA_ID) {
    window.gtag("event", eventName, payload ?? {});
  }

  const analyticsName = legacyEventToAnalyticsName(eventName);
  void recordAnalyticsEvent({
    name: analyticsName,
    category: inferCategoryFromEvent(analyticsName),
    action: payload?.ctaLabel ? { ctaLabel: String(payload.ctaLabel) } : undefined,
    context: sanitizeContext(payload),
    metrics: sanitizeMetrics(payload),
    leadId: payload?.leadId as string | undefined,
    page: payload?.pageType
      ? { pageType: String(payload.pageType), pageSlug: payload.pageSlug as string | undefined }
      : undefined,
  });
}

function sanitizeContext(payload?: Record<string, unknown>) {
  if (!payload) return undefined;
  const ctx: Record<string, string> = {};
  if (payload.projectSlug) ctx.projectSlug = String(payload.projectSlug);
  if (payload.leadMagnetId) ctx.leadMagnetId = String(payload.leadMagnetId);
  if (payload.pageSlug) ctx.pageSlug = String(payload.pageSlug);
  return Object.keys(ctx).length ? ctx : undefined;
}

function sanitizeMetrics(payload?: Record<string, unknown>) {
  if (!payload) return undefined;
  const m: Record<string, number | string> = {};
  if (typeof payload.leadScore === "number") m.leadScore = payload.leadScore;
  if (payload.readiness) m.readiness = String(payload.readiness);
  if (typeof payload.area === "number") m.area = payload.area;
  return Object.keys(m).length ? (m as AnalyticsEvent["metrics"]) : undefined;
}
export function trackConversionGoal(goalId: ConversionGoalId, payload?: Record<string, unknown>) {
  const goal = getConversionGoal(goalId);
  trackEvent(goal?.goalName ?? goalId, { goalId, ...payload });
}

export function trackLeadEvent(
  action: "viewed" | "started" | "submitted" | "success" | "error",
  payload?: Record<string, unknown>,
) {
  trackEvent(`lead_form_${action}`, payload);
}

export function trackFormEvent(formId: string, action: string, payload?: Record<string, unknown>) {
  trackEvent(`form_${action}`, { formId, ...payload });
}

export function trackCalculatorEvent(action: string, payload?: Record<string, unknown>) {
  trackEvent(`calculator_${action}`, payload);
}

export function trackPlannerEvent(action: string, payload?: Record<string, unknown>) {
  trackEvent(`planner_${action}`, payload);
}

export function trackLeadMagnetEvent(eventName: string, payload?: Record<string, unknown>) {
  trackEvent(eventName, payload);
}

export function trackProjectEvent(action: string, payload?: Record<string, unknown>) {
  trackEvent(`project_${action}`, payload);
}

export { YM_ID };
