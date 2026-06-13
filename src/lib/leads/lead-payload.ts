import type {
  Lead,
  LeadContext,
  LeadFormInput,
  LeadQualification,
  LegacyLeadPayload,
} from "@/types/lead";
import { calculateLeadScore, scoreToReadiness } from "./lead-score";
import { normalizePhone } from "./lead-validation";

const MAX_COMMENT_LENGTH = 8000;

export function cleanLeadPayload<T extends Record<string, unknown>>(payload: T): T {
  const result = {} as T;

  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined || value === null) continue;

    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) continue;
      (result as Record<string, unknown>)[key] =
        key === "comment" ? trimmed.slice(0, MAX_COMMENT_LENGTH) : trimmed;
      continue;
    }

    if (Array.isArray(value)) {
      if (!value.length) continue;
      (result as Record<string, unknown>)[key] = value;
      continue;
    }

    if (typeof value === "object") {
      const cleaned = cleanLeadPayload(value as Record<string, unknown>);
      if (Object.keys(cleaned).length) {
        (result as Record<string, unknown>)[key] = cleaned;
      }
      continue;
    }

    (result as Record<string, unknown>)[key] = value;
  }

  return result;
}

export function cleanLeadContext(context?: LeadContext): LeadContext {
  if (!context) return {};
  return cleanLeadPayload(context as Record<string, unknown>) as LeadContext;
}

export function buildLeadFromInput(
  input: LeadFormInput,
  serverMeta?: Partial<Lead["meta"]>,
): Lead {
  const isSpam = Boolean(input.honeypot?.trim());
  const areaNum = parseOptionalNumber(input.contact.area);
  const qualification: LeadQualification = {
    readiness: "unknown",
    ...input.qualification,
    desiredArea: input.qualification?.desiredArea ?? areaNum,
    desiredMaterial: input.qualification?.desiredMaterial ?? input.contact.material,
    hasLand: input.qualification?.hasLand ?? mapHasLand(input.contact.hasLand),
    landLocation: input.qualification?.landLocation ?? input.contact.landLocation,
    budget: input.qualification?.budget ?? (input.contact.budget ? { raw: input.contact.budget, currency: "RUB" } : undefined),
  };

  const lead: Lead = {
    status: isSpam ? "spam" : "new",
    source: cleanLeadPayload(input.source as Record<string, unknown>) as Lead["source"],
    contact: {
      name: input.contact.name.trim(),
      phone: normalizePhone(input.contact.phone),
      messenger: input.contact.messenger?.trim() || undefined,
      email: input.contact.email?.trim() || undefined,
    },
    request: {
      type: input.request.type,
      title: input.request.title.trim(),
      comment: input.request.comment?.trim() || input.contact.comment?.trim() || undefined,
      selectedCTA: input.request.selectedCTA?.trim() || undefined,
    },
    context: cleanLeadContext(input.context),
    qualification,
    analytics: cleanLeadPayload((input.analytics ?? {}) as Record<string, unknown>) as Lead["analytics"],
    meta: {
      createdAt: new Date().toISOString(),
      currentUrl: input.meta?.currentUrl ?? input.source.currentUrl,
      pageTitle: input.meta?.pageTitle,
      language: input.meta?.language ?? "ru",
      referrer: input.source.referrer ?? input.analytics?.traffic?.referrer,
      ...serverMeta,
    },
    privacy: input.privacy ?? { consent: true },
  };

  const score = calculateLeadScore(lead, { honeypotFilled: isSpam });
  lead.qualification.leadScore = score;
  lead.qualification.readiness = scoreToReadiness(score);

  return lead;
}

export function normalizeLegacyPayload(legacy: LegacyLeadPayload): LeadFormInput {
  const { source, context, requestType, requestTitle } = inferFromLegacySource(legacy.source);

  return {
    contact: {
      name: legacy.name,
      phone: legacy.phone,
      area: legacy.area,
      comment: legacy.comment,
      messenger: legacy.messenger,
    },
    request: {
      type: requestType,
      title: requestTitle,
      comment: legacy.comment,
    },
    source,
    context,
    honeypot: legacy.website,
    privacy: { consent: true },
  };
}

function inferFromLegacySource(sourceStr?: string): {
  source: LeadFormInput["source"];
  context?: LeadContext;
  requestType: LeadFormInput["request"]["type"];
  requestTitle: string;
} {
  const source = sourceStr ?? "unknown";
  const base: LeadFormInput["source"] = {
    sourceType: "unknown",
    sourceName: source,
    entryPoint: source,
  };

  if (source === "calculator" || source.startsWith("calculator")) {
    return { source: { ...base, sourceType: "calculator", formId: source }, requestType: "calculator-result", requestTitle: "Расчёт калькулятора" };
  }
  if (source === "planner" || source.startsWith("planner")) {
    return { source: { ...base, sourceType: "planner", formId: source }, requestType: "planner-review", requestTitle: "Планировка из планировщика" };
  }
  if (source.startsWith("project-page-")) {
    const slug = source.replace("project-page-", "");
    return {
      source: { ...base, sourceType: "project-page", pageSlug: slug, formId: source },
      context: { project: { slug } },
      requestType: "project-estimate",
      requestTitle: "Заявка по проекту",
    };
  }
  if (source.startsWith("lead-magnet")) {
    return { source: { ...base, sourceType: "lead-magnet", formId: source }, requestType: "lead-magnet", requestTitle: "Запрос лид-магнита" };
  }
  if (source.startsWith("cases")) {
    return { source: { ...base, sourceType: "case-page", formId: source }, requestType: "case-like", requestTitle: "Хочу похожий дом" };
  }
  if (source.startsWith("objects-map")) {
    const areaSlug = source.includes(":") ? source.split(":")[1] : undefined;
    return {
      source: { ...base, sourceType: "objects-map", pageSlug: areaSlug, formId: source },
      context: areaSlug ? { objectMap: { areaSlug } } : undefined,
      requestType: "object-map",
      requestTitle: "Заявка с карты объектов",
    };
  }
  if (source.startsWith("service:") || source.startsWith("lead-")) {
    const slug = source.replace(/^service:/, "").replace(/^lead-/, "");
    return {
      source: { ...base, sourceType: "service-page", pageSlug: slug, formId: source },
      context: { service: { slug } },
      requestType: "service-page",
      requestTitle: "Заявка с коммерческой страницы",
    };
  }
  if (source.startsWith("blog")) {
    return { source: { ...base, sourceType: "blog-post", formId: source }, requestType: "consultation", requestTitle: "Заявка из блога" };
  }
  if (source === "catalog" || source.startsWith("catalog")) {
    return { source: { ...base, sourceType: "catalog", formId: source }, requestType: "project-selection", requestTitle: "Подбор проекта" };
  }
  if (source === "home" || source === "lead") {
    return { source: { ...base, sourceType: "home", formId: source }, requestType: "callback", requestTitle: "Заявка с главной" };
  }

  return { source: base, requestType: "unknown", requestTitle: "Заявка с сайта" };
}

function parseOptionalNumber(value?: string): number | undefined {
  if (!value?.trim()) return undefined;
  const n = Number(value.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : undefined;
}

function mapHasLand(value?: string): LeadQualification["hasLand"] {
  if (!value) return undefined;
  if (value === "yes" || value === "да") return "yes";
  if (value === "no" || value === "нет") return "no";
  if (value === "searching" || value === "подбираю") return "searching";
  return "unknown";
}
