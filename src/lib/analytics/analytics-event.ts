import type { AnalyticsEvent, AnalyticsEventCategory, AnalyticsEventName } from "@/types/analytics";

const PII_KEYS = new Set(["name", "phone", "email", "messenger", "comment", "contact"]);

function stripUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    if (typeof v === "object" && !Array.isArray(v) && v !== null) {
      const nested = stripUndefined(v as Record<string, unknown>);
      if (Object.keys(nested).length) out[k] = nested;
    } else {
      out[k] = v;
    }
  }
  return out as Partial<T>;
}

export function sanitizeAnalyticsPayload(payload?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!payload) return undefined;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(payload)) {
    if (PII_KEYS.has(k.toLowerCase())) continue;
    out[k] = v;
  }
  return Object.keys(out).length ? out : undefined;
}

export function inferCategoryFromEvent(name: AnalyticsEventName | string): AnalyticsEventCategory {
  if (name.startsWith("page_")) return "page";
  if (name.startsWith("cta_")) return "cta";
  if (name.startsWith("form_")) return "form";
  if (name.startsWith("lead_")) return "lead";
  if (name.startsWith("calculator_")) return "calculator";
  if (name.startsWith("planner_")) return "planner";
  if (name.startsWith("catalog_")) return "catalog";
  if (name.startsWith("project_") || name.startsWith("related_project")) return "project";
  if (name.startsWith("blog_") || name.startsWith("related_article")) return "blog";
  if (name.startsWith("service_page")) return "service-page";
  if (name.startsWith("lead_magnet")) return "lead-magnet";
  if (name.startsWith("case_")) return "case";
  if (name.startsWith("objects_map")) return "objects-map";
  if (name.startsWith("crm_")) return "crm";
  if (name.startsWith("automation_") || name.startsWith("notification_") || name.startsWith("sla_")) return "automation";
  return "page";
}

export function buildAnalyticsEvent(
  input: Omit<AnalyticsEvent, "timestamp" | "category"> & {
    category?: AnalyticsEventCategory;
    timestamp?: string;
  },
): AnalyticsEvent {
  const event: AnalyticsEvent = {
    name: input.name,
    category: input.category ?? inferCategoryFromEvent(input.name),
    timestamp: input.timestamp ?? new Date().toISOString(),
    sessionId: input.sessionId,
    visitorId: input.visitorId,
    leadId: input.leadId,
    page: input.page ? stripUndefined(input.page) : undefined,
    source: input.source ? stripUndefined(input.source) : undefined,
    context: input.context ? stripUndefined(input.context) : undefined,
    action: input.action ? stripUndefined(input.action) : undefined,
    metrics: input.metrics ? stripUndefined(input.metrics) : undefined,
    meta: input.meta ? stripUndefined(input.meta) : undefined,
  };
  return stripUndefined(event as unknown as Record<string, unknown>) as AnalyticsEvent;
}

export function legacyEventToAnalyticsName(eventName: string): AnalyticsEventName | string {
  const map: Record<string, AnalyticsEventName> = {
    cta_click: "cta_clicked",
    calculator_submit: "calculator_lead_submitted",
    lead_form_started: "form_started",
    lead_form_submitted: "form_submitted",
    lead_form_success: "form_success",
    lead_form_error: "form_error",
  };
  if (map[eventName]) return map[eventName];
  if (eventName.startsWith("calculator_")) {
    const action = eventName.replace("calculator_", "");
    if (action === "submit") return "calculator_lead_submitted";
    if (action === "result") return "calculator_result_viewed";
    if (action === "start") return "calculator_started";
  }
  if (eventName.startsWith("planner_")) {
    const action = eventName.replace("planner_", "");
    if (action === "submit") return "planner_lead_submitted";
    if (action === "start") return "planner_started";
  }
  if (eventName.startsWith("project_")) {
    if (eventName.includes("submit")) return "project_lead_submitted";
    if (eventName.includes("cta")) return "project_cta_clicked";
    return "project_viewed";
  }
  return eventName;
}
