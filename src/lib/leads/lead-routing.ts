import type { Lead, LeadPriority, LeadProcessingType } from "@/types/lead";

const ESTIMATE_CTA = /смет|расч|под ключ|строительств/i;

export function getLeadProcessingType(lead: Lead): LeadProcessingType {
  const { source, request, context } = lead;

  if (request.type === "calculator-result" || source.sourceType === "calculator" || context.calculator) {
    return "calculator";
  }
  if (request.type === "project-estimate" || source.sourceType === "project-page" || context.project?.slug) {
    return "project";
  }
  if (request.type === "planner-review" || source.sourceType === "planner" || context.planner) {
    return "planner";
  }
  if (request.type === "lead-magnet" || context.leadMagnet?.id || source.sourceType === "lead-magnet") {
    return "lead-magnet";
  }
  if (source.sourceType === "service-page" || context.service?.slug) {
    return "service-page";
  }
  if (source.sourceType === "blog" || source.sourceType === "blog-post" || context.blog?.slug) {
    return "blog";
  }
  if (request.type === "case-like" || context.case?.slug) {
    return "case-like";
  }
  if (request.type === "object-map" || source.sourceType === "objects-map" || context.objectMap) {
    return "objects-map";
  }
  if (request.type === "callback" || request.type === "consultation") {
    return "callback";
  }
  return "unknown";
}

export function getLeadPriority(lead: Lead): LeadPriority {
  if (lead.status === "spam") return "low";

  const score = lead.qualification.leadScore ?? 0;
  const readiness = lead.qualification.readiness;
  const processingType = getLeadProcessingType(lead);
  const hasPhone = Boolean(lead.contact.phone?.trim());
  const hasBudget = Boolean(lead.qualification.budget?.raw || lead.qualification.budget?.min);
  const hasLand =
    lead.qualification.hasLand === "yes" ||
    Boolean(lead.qualification.landLocation) ||
    Boolean(lead.context.calculator?.landLocation);
  const cta = lead.request.selectedCTA ?? "";
  const estimateIntent = ESTIMATE_CTA.test(cta) || ESTIMATE_CTA.test(lead.request.title);

  const highValueSource = ["calculator", "project-page", "service-page"].includes(
    lead.source.sourceType,
  );

  if (
    readiness === "hot" &&
    score >= 75 &&
    hasPhone &&
    highValueSource &&
    (hasBudget || hasLand || estimateIntent)
  ) {
    return "urgent";
  }

  if (
    score >= 60 ||
    (processingType === "calculator" || processingType === "project") ||
    (lead.qualification.desiredArea && lead.qualification.desiredMaterial) ||
    estimateIntent
  ) {
    return "high";
  }

  if (
    score >= 30 ||
    processingType === "lead-magnet" ||
    processingType === "blog" ||
    processingType === "planner" ||
    requestTypeIsNormal(lead.request.type)
  ) {
    return "normal";
  }

  return "low";
}

function requestTypeIsNormal(type: Lead["request"]["type"]): boolean {
  return ["project-selection", "planner-review", "consultation"].includes(type);
}

export function getPriorityLabel(priority: LeadPriority): string {
  const map: Record<LeadPriority, string> = {
    urgent: "Срочный",
    high: "Высокий",
    normal: "Обычный",
    low: "Низкий",
  };
  return map[priority];
}

export function getPriorityEmoji(priority: LeadPriority): string {
  const map: Record<LeadPriority, string> = {
    urgent: "🔥",
    high: "⚡",
    normal: "📋",
    low: "💤",
  };
  return map[priority];
}
