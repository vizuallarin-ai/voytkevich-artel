import type { Lead, LeadReadiness, LeadSourceType, StoredLead } from "@/types/lead";
import { getLeadStatusLabel, READINESS_META } from "./lead-status";

export function formatSourceType(sourceType: LeadSourceType): string {
  const map: Record<LeadSourceType, string> = {
    home: "Главная",
    catalog: "Каталог",
    "catalog-category": "Категория каталога",
    "project-page": "Проект",
    calculator: "Калькулятор",
    planner: "Планировщик",
    "service-page": "Услуга",
    blog: "Блог",
    "blog-post": "Статья",
    "lead-magnet": "Лид-магнит",
    "case-page": "Кейс",
    "objects-map": "Карта объектов",
    process: "Процесс",
    about: "О компании",
    faq: "FAQ",
    unknown: "Неизвестно",
  };
  return map[sourceType] ?? sourceType;
}

export function formatReadiness(readiness: LeadReadiness): string {
  return READINESS_META[readiness]?.label ?? readiness;
}

export function formatPriceRange(min?: number, max?: number): string | null {
  if (min && max) return `${formatRub(min)} – ${formatRub(max)}`;
  if (min) return `от ${formatRub(min)}`;
  if (max) return `до ${formatRub(max)}`;
  return null;
}

export function formatRub(value: number): string {
  return `${value.toLocaleString("ru-RU")} ₽`;
}

export function getLeadInterestLabel(lead: Lead): string {
  const { request, context } = lead;
  if (context.leadMagnet?.title) return context.leadMagnet.title;
  if (context.project?.title) return `Проект: ${context.project.title}`;
  if (context.service?.title) return context.service.title;
  if (context.blog?.title) return context.blog.title;
  if (context.case?.title) return `Кейс: ${context.case.title}`;
  if (request.type === "calculator-result") return "Расчёт калькулятора";
  if (request.type === "planner-review") return "Разбор планировки";
  return request.title;
}

export function getLeadShortSummary(lead: Lead): string {
  return generateLeadSummary(lead).split("\n")[0] ?? getLeadInterestLabel(lead);
}

export function generateLeadSummary(lead: Lead): string {
  const { context, request, source, qualification } = lead;

  if (context.calculator?.area && context.calculator.material) {
    const range = formatPriceRange(context.calculator.totalMin, context.calculator.totalMax);
    const total = context.calculator.total ? formatRub(context.calculator.total) : range;
    return `Пользователь рассчитал дом ${context.calculator.area} м² из ${context.calculator.material}${context.calculator.finish ? `, комплектация «${context.calculator.finish}»` : ""}${total ? `, ориентир ${total}` : ""} и оставил заявку на подробный расчёт.`;
  }

  if (context.project?.title || context.project?.slug) {
    const p = context.project;
    return `Пользователь оставил заявку по проекту «${p.title ?? p.slug}»${p.area ? `: ${p.area} м²` : ""}${p.material ? `, ${p.material}` : ""}. Источник — ${formatSourceType(source.sourceType).toLowerCase()}.`;
  }

  if (context.leadMagnet?.title && context.blog?.title) {
    return `Пользователь пришёл из статьи «${context.blog.title}» и запросил: ${context.leadMagnet.title}.`;
  }

  if (context.leadMagnet?.title) {
    return `Пользователь запросил лид-магнит: ${context.leadMagnet.title}.`;
  }

  if (context.planner?.targetArea || context.planner?.rooms?.length) {
    const rooms = context.planner.rooms?.map((r) => r.name).join(", ");
    return `Пользователь собрал планировку${context.planner.scenario ? ` (${context.planner.scenario})` : ""}: ${context.planner.totalArea ?? context.planner.targetArea ?? "—"} м²${rooms ? `, помещения: ${rooms}` : ""}, отправил на разбор.`;
  }

  if (context.objectMap?.areaSlug || context.objectMap?.locationLabel) {
    return `Пользователь смотрел карту объектов${context.objectMap.locationLabel ? ` (${context.objectMap.locationLabel})` : ""} и запросил похожий дом.`;
  }

  if (context.case?.title) {
    return `Пользователь хочет дом, похожий на кейс «${context.case.title}».`;
  }

  if (context.service?.title) {
    return `Заявка с коммерческой страницы «${context.service.title}».`;
  }

  if (qualification.desiredArea || qualification.desiredMaterial) {
    return `Заявка: ${request.title}${qualification.desiredArea ? `, ${qualification.desiredArea} м²` : ""}${qualification.desiredMaterial ? `, ${qualification.desiredMaterial}` : ""}.`;
  }

  return `${request.title}. Источник: ${formatSourceType(source.sourceType).toLowerCase()}.`;
}

export function formatLeadForManager(lead: StoredLead): string {
  const lines = [
    "Новая заявка",
    "",
    "Контакт:",
    `Имя: ${lead.contact.name}`,
    `Телефон: ${lead.contact.phone}`,
  ];

  if (lead.contact.messenger) lines.push(`Мессенджер: ${lead.contact.messenger}`);
  lines.push("", "Суть:", generateLeadSummary(lead));
  lines.push("", "Источник:", `${formatSourceType(lead.source.sourceType)}${lead.source.pageSlug ? ` / ${lead.source.pageSlug}` : ""}`);
  if (lead.request.selectedCTA) lines.push(`CTA: ${lead.request.selectedCTA}`);
  if (lead.meta.currentUrl) lines.push(`URL: ${lead.meta.currentUrl}`);

  const q = lead.qualification;
  const params: string[] = [];
  if (q.desiredArea) params.push(`Площадь: ${q.desiredArea} м²`);
  if (q.desiredMaterial) params.push(`Материал: ${q.desiredMaterial}`);
  if (q.budget?.raw) params.push(`Бюджет: ${q.budget.raw}`);
  if (q.landLocation) params.push(`Участок: ${q.landLocation}`);
  if (params.length) {
    lines.push("", "Параметры:", ...params);
  }

  if (lead.request.comment) {
    lines.push("", "Комментарий:", lead.request.comment);
  }

  lines.push(
    "",
    `Статус: ${getLeadStatusLabel(lead.status)}`,
    `Готовность: ${formatReadiness(lead.qualification.readiness)}`,
    `Score: ${lead.qualification.leadScore ?? 0}`,
  );

  if (lead.nextAction?.type) {
    lines.push("", "Следующий шаг:", lead.nextAction.comment ?? lead.nextAction.type);
    if (lead.nextAction.at) lines.push(`Дата: ${new Date(lead.nextAction.at).toLocaleString("ru-RU")}`);
  }

  return lines.join("\n");
}

export function getPublicLinkForLead(lead: Lead): { href: string; label: string } | null {
  const { context } = lead;
  if (context.project?.slug) {
    return { href: `/catalog/${context.project.slug}`, label: "Открыть проект" };
  }
  if (context.blog?.slug) {
    return { href: `/blog/${context.blog.slug}`, label: "Открыть статью" };
  }
  if (context.service?.slug) {
    return { href: `/${context.service.slug}`, label: "Открыть услугу" };
  }
  if (context.case?.slug) {
    return { href: `/cases/${context.case.slug}`, label: "Открыть кейс" };
  }
  if (context.objectMap?.areaSlug) {
    return { href: `/objects-map/${context.objectMap.areaSlug}`, label: "Открыть зону на карте" };
  }
  if (lead.meta.currentUrl) {
    try {
      const url = new URL(lead.meta.currentUrl);
      return { href: url.pathname, label: "Страница заявки" };
    } catch {
      return null;
    }
  }
  return null;
}
