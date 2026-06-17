import type { Lead, LeadFormInput, LeadRequestType, LeadSource, LeadSourceType } from "@/types/lead";

export type LeadFormConfig = {
  sourceType: LeadSourceType;
  sourceName?: string;
  pageSlug?: string;
  formId?: string;
  formName?: string;
  requestType?: LeadRequestType;
  requestTitle?: string;
  selectedCTA?: string;
  ctaLabel?: string;
  ctaPosition?: LeadSource["ctaPosition"];
  context?: LeadFormInput["context"];
  qualification?: LeadFormInput["qualification"];
  conversionGoal?: string;
};

export function buildLeadSource(config: LeadFormConfig): LeadSource {
  const currentUrl = typeof window !== "undefined" ? window.location.href : undefined;
  const referrer = typeof document !== "undefined" ? document.referrer || undefined : undefined;

  return {
    sourceType: config.sourceType,
    sourceName: config.sourceName ?? config.formName,
    pageSlug: config.pageSlug,
    pageType: config.sourceType,
    currentUrl,
    referrer,
    formId: config.formId,
    formName: config.formName,
    ctaLabel: config.ctaLabel ?? config.selectedCTA,
    ctaPosition: config.ctaPosition ?? "final",
    entryPoint: config.formId ?? config.sourceType,
  };
}

export function buildLeadFormInput(opts: {
  contact: LeadFormInput["contact"];
  config: LeadFormConfig;
  comment?: string;
  analytics?: LeadFormInput["analytics"];
  meta?: LeadFormInput["meta"];
  honeypot?: string;
}): LeadFormInput {
  return {
    contact: opts.contact,
    request: {
      type: opts.config.requestType ?? inferRequestType(opts.config.sourceType),
      title: opts.config.requestTitle ?? inferRequestTitle(opts.config.sourceType),
      comment: opts.comment ?? opts.contact.comment,
      selectedCTA: opts.config.selectedCTA ?? opts.config.ctaLabel,
    },
    source: buildLeadSource(opts.config),
    context: opts.config.context,
    qualification: opts.config.qualification,
    analytics: opts.analytics,
    meta: {
      currentUrl: typeof window !== "undefined" ? window.location.href : undefined,
      pageTitle: typeof document !== "undefined" ? document.title : undefined,
      ...opts.meta,
    },
    privacy: { consent: true },
    honeypot: opts.honeypot,
    conversionGoal: opts.config.conversionGoal,
  };
}

function inferRequestType(sourceType: LeadSourceType): LeadRequestType {
  switch (sourceType) {
    case "calculator":
      return "calculator-result";
    case "planner":
      return "planner-review";
    case "project-page":
      return "project-estimate";
    case "lead-magnet":
      return "lead-magnet";
    case "case-page":
      return "case-like";
    case "objects-map":
      return "object-map";
    case "service-page":
      return "service-page";
    case "catalog":
    case "catalog-category":
    case "programmatic-seo":
    case "technical-article":
      return "project-selection";
    default:
      return "callback";
  }
}

export function inferLeadConfigFromLegacy(opts: {
  id?: string;
  source?: string;
  title?: string;
  submitLabel?: string;
}): LeadFormConfig {
  const source = opts.source ?? opts.id ?? "unknown";
  const inferred = inferFromLegacySourceString(source);
  return {
    sourceType: inferred.sourceType,
    formId: opts.id ?? source,
    formName: opts.title,
    pageSlug: inferred.pageSlug,
    requestType: inferred.requestType,
    requestTitle: opts.title ?? inferred.requestTitle,
    selectedCTA: opts.submitLabel,
    conversionGoal: inferred.conversionGoal,
    context: inferred.context,
  };
}

function inferFromLegacySourceString(source: string): {
  sourceType: import("@/types/lead").LeadSourceType;
  pageSlug?: string;
  requestType: import("@/types/lead").LeadRequestType;
  requestTitle: string;
  conversionGoal?: import("@/lib/analytics/conversion-goals").ConversionGoalId;
  context?: import("@/types/lead").LeadContext;
} {
  if (source === "calculator" || source.startsWith("calculator")) {
    return { sourceType: "calculator", requestType: "calculator-result", requestTitle: "Расчёт калькулятора", conversionGoal: "calculator_submit" };
  }
  if (source === "planner" || source.startsWith("planner")) {
    return { sourceType: "planner", requestType: "planner-review", requestTitle: "Планировка из планировщика", conversionGoal: "planner_submit" };
  }
  if (source.startsWith("project-page-")) {
    const slug = source.replace("project-page-", "");
    return { sourceType: "project-page", pageSlug: slug, requestType: "project-estimate", requestTitle: "Заявка по проекту", conversionGoal: "project_request", context: { project: { slug } } };
  }
  if (source.startsWith("lead-magnet")) {
    return { sourceType: "lead-magnet", requestType: "lead-magnet", requestTitle: "Запрос лид-магнита", conversionGoal: "lead_magnet_submit" };
  }
  if (source.startsWith("cases")) {
    return { sourceType: "case-page", requestType: "case-like", requestTitle: "Хочу похожий дом", conversionGoal: "case_like_request" };
  }
  if (source.startsWith("objects-map")) {
    const areaSlug = source.includes(":") ? source.split(":")[1] : undefined;
    return { sourceType: "objects-map", pageSlug: areaSlug, requestType: "object-map", requestTitle: "Заявка с карты объектов", conversionGoal: "objects_map_request", context: areaSlug ? { objectMap: { areaSlug } } : undefined };
  }
  if (source.startsWith("lead-") && source !== "lead") {
    const slug = source.replace(/^lead-/, "");
    return { sourceType: "service-page", pageSlug: slug, requestType: "service-page", requestTitle: "Заявка с коммерческой страницы", conversionGoal: "service_page_submit", context: { service: { slug } } };
  }
  if (source.startsWith("blog")) {
    return { sourceType: "blog-post", requestType: "consultation", requestTitle: "Заявка из блога", conversionGoal: "blog_submit" };
  }
  if (source === "catalog" || source.startsWith("catalog")) {
    const categorySlug = source.startsWith("catalog-")
      ? source.replace(/^catalog-/, "")
      : undefined;
    return {
      sourceType: categorySlug ? "catalog-category" : "catalog",
      pageSlug: categorySlug,
      requestType: "project-selection",
      requestTitle: "Подбор проекта",
      conversionGoal: "catalog_project_selection",
      context: categorySlug ? { catalog: { categorySlug } } : undefined,
    };
  }
  if (source === "faq") {
    return {
      sourceType: "faq",
      requestType: "consultation",
      requestTitle: "Вопрос из FAQ",
      conversionGoal: "callback_request",
    };
  }
  if (source === "process") {
    return {
      sourceType: "process",
      requestType: "consultation",
      requestTitle: "Консультация по процессу строительства",
      conversionGoal: "callback_request",
    };
  }
  if (source === "home" || source === "lead") {
    return { sourceType: "home", requestType: "callback", requestTitle: "Заявка с главной", conversionGoal: "callback_request" };
  }
  return { sourceType: "unknown", requestType: "unknown", requestTitle: "Заявка с сайта", conversionGoal: "form_submit" };
}

function inferRequestTitle(sourceType: LeadSourceType): string {
  switch (sourceType) {
    case "calculator":
      return "Расчёт калькулятора";
    case "planner":
      return "Планировка из планировщика";
    case "project-page":
      return "Заявка по проекту";
    case "lead-magnet":
      return "Запрос лид-магнита";
    case "case-page":
      return "Хочу похожий дом";
    case "objects-map":
      return "Заявка с карты объектов";
    case "service-page":
      return "Заявка с коммерческой страницы";
    case "blog-post":
      return "Заявка из статьи блога";
    case "home":
      return "Заявка с главной";
    case "programmatic-seo":
      return "Заявка с programmatic-страницы";
    case "technical-article":
      return "Заявка из технической статьи";
    default:
      return "Заявка с сайта";
  }
}

export function formatLeadSummary(lead: Lead): string {
  const lines: string[] = [
    "🏠 *Новая заявка с сайта*",
    "",
    "*Контакт:*",
    `• Имя: ${lead.contact.name}`,
    `• Телефон: ${lead.contact.phone}`,
  ];

  if (lead.contact.messenger) lines.push(`• Мессенджер: ${lead.contact.messenger}`);

  lines.push("", "*Источник:*");
  lines.push(`• Тип: ${lead.source.sourceType}`);
  if (lead.source.formName) lines.push(`• Форма: ${lead.source.formName}`);
  if (lead.source.pageSlug) lines.push(`• Slug: ${lead.source.pageSlug}`);
  if (lead.request.selectedCTA) lines.push(`• CTA: ${lead.request.selectedCTA}`);
  if (lead.meta.currentUrl) lines.push(`• URL: ${lead.meta.currentUrl}`);

  const utm = lead.analytics.utm;
  if (utm?.source || utm?.medium || utm?.campaign) {
    lines.push("", "*UTM:*");
    if (utm.source) lines.push(`• source: ${utm.source}`);
    if (utm.medium) lines.push(`• medium: ${utm.medium}`);
    if (utm.campaign) lines.push(`• campaign: ${utm.campaign}`);
  }

  lines.push("", "*Интерес:*");
  lines.push(`• Тип заявки: ${lead.request.type}`);
  lines.push(`• Заголовок: ${lead.request.title}`);

  if (lead.context.project?.title || lead.context.project?.slug) {
    lines.push(`• Проект: ${lead.context.project.title ?? lead.context.project.slug}`);
  }
  if (lead.context.service?.title || lead.context.service?.slug) {
    lines.push(`• Услуга: ${lead.context.service.title ?? lead.context.service.slug}`);
  }
  if (lead.context.leadMagnet?.title) {
    lines.push(`• Лид-магнит: ${lead.context.leadMagnet.title}`);
  }
  if (lead.context.blog?.title) {
    lines.push(`• Статья: ${lead.context.blog.title}`);
  }
  if (lead.context.case?.title) {
    lines.push(`• Кейс: ${lead.context.case.title}`);
  }

  const calc = lead.context.calculator;
  if (calc) {
    lines.push("", "*Калькулятор:*");
    if (calc.area) lines.push(`• Площадь: ${calc.area} м²`);
    if (calc.material) lines.push(`• Материал: ${calc.material}`);
    if (calc.total) lines.push(`• Итог: ${calc.total.toLocaleString("ru-RU")} ₽`);
    if (calc.totalMin && calc.totalMax) {
      lines.push(`• Диапазон: ${calc.totalMin.toLocaleString("ru-RU")} – ${calc.totalMax.toLocaleString("ru-RU")} ₽`);
    }
  }

  const planner = lead.context.planner;
  if (planner) {
    lines.push("", "*Планировщик:*");
    if (planner.scenario) lines.push(`• Сценарий: ${planner.scenario}`);
    if (planner.totalArea) lines.push(`• Площадь: ${planner.totalArea} м²`);
    if (planner.rooms?.length) {
      lines.push(`• Комнаты: ${planner.rooms.map((r) => `${r.name} ${r.area}м²`).join(", ")}`);
    }
  }

  lines.push("", "*Квалификация:*");
  lines.push(`• leadScore: ${lead.qualification.leadScore ?? 0}`);
  lines.push(`• readiness: ${lead.qualification.readiness}`);

  if (lead.request.comment) {
    lines.push("", "*Комментарий:*", lead.request.comment);
  }

  lines.push(
    "",
    `🕐 ${new Date(lead.meta.createdAt).toLocaleString("ru-RU", { timeZone: "Asia/Irkutsk" })} (ИСТ)`,
  );

  return lines.join("\n");
}
