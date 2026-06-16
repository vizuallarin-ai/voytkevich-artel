import type { Lead, LeadAutomationResult, StoredLead } from "@/types/lead";
import { generateLeadSummary, formatSourceType } from "./lead-formatters";
import { getLeadProcessingType } from "./lead-routing";
import { formatSLAStatus } from "./lead-sla";
import { getPriorityLabel, getPriorityEmoji } from "./lead-routing";

export function formatLeadNotificationSummary(lead: Lead): string {
  const type = getLeadProcessingType(lead);
  const { context, request } = lead;

  switch (type) {
    case "calculator": {
      const c = context.calculator;
      const range =
        c?.totalMin && c?.totalMax
          ? `${(c.totalMin / 1_000_000).toFixed(1)}–${(c.totalMax / 1_000_000).toFixed(1)} млн ₽`
          : c?.total
            ? `${(c.total / 1_000_000).toFixed(1)} млн ₽`
            : null;
      return `Пользователь рассчитал дом ${c?.area ?? "—"} м² из ${c?.material ?? "—"}${c?.finish ? `, комплектация «${c.finish}»` : ""}${range ? `, диапазон ${range}` : ""} и запросил подробный расчёт.`;
    }
    case "project": {
      const p = context.project;
      return `Пользователь оставил заявку по проекту «${p?.title ?? p?.slug ?? "—"}»${p?.area ? `: ${p.area} м²` : ""}${p?.material ? `, ${p.material}` : ""}${p?.floors ? `, ${p.floors} эт.` : ""}. Нужно уточнить участок и комплектацию.`;
    }
    case "planner": {
      const pl = context.planner;
      const rooms = pl?.rooms?.length ? `${pl.rooms.length} помещений` : "";
      return `Пользователь собрал планировку${pl?.scenario ? ` (${pl.scenario})` : ""}: ${pl?.totalArea ?? pl?.targetArea ?? "—"} м²${rooms ? `, ${rooms}` : ""}. Запросил разбор.`;
    }
    case "lead-magnet":
      if (context.blog?.title) {
        return `Пользователь запросил «${context.leadMagnet?.title ?? request.title}» из статьи «${context.blog.title}».`;
      }
      return `Пользователь запросил лид-магнит «${context.leadMagnet?.title ?? request.title}».`;
    case "blog":
      return `Пользователь пришёл из статьи «${context.blog?.title ?? "—"}» и оставил заявку.`;
    case "case-like":
      return `Пользователь хочет похожий дом по кейсу «${context.case?.title ?? "—"}».`;
    case "objects-map":
      return `Пользователь смотрел карту объектов${context.objectMap?.locationLabel ? ` (${context.objectMap.locationLabel})` : ""} и хочет похожий дом в своём районе.`;
    case "service-page":
      return `Заявка с коммерческой страницы «${context.service?.title ?? request.title}».`;
    default:
      return buildCallbackSummary(lead);
  }
}

function buildCallbackSummary(lead: Lead): string {
  const { request, source, qualification, contact } = lead;
  const parts = [request.title];
  if (qualification.desiredArea) parts.push(`${qualification.desiredArea} м²`);
  if (qualification.budget?.raw) parts.push(`бюджет ${qualification.budget.raw}`);
  if (qualification.hasLand === "yes") {
    parts.push(qualification.landLocation ? `участок: ${qualification.landLocation}` : "есть участок");
  } else if (qualification.hasLand === "searching") {
    parts.push("участок в поиске");
  }
  if (contact.messenger) parts.push(`связь: ${contact.messenger}`);
  return `${parts.join(", ")}. Источник: ${formatSourceType(source.sourceType).toLowerCase()}.`;
}

export function formatTelegramLeadMessage(
  lead: StoredLead,
  automation: Pick<LeadAutomationResult, "priority" | "recommendedAction" | "sla">,
): string {
  const summary = formatLeadNotificationSummary(lead);
  const priorityLabel = getPriorityLabel(automation.priority);
  const emoji = getPriorityEmoji(automation.priority);
  const utm = lead.analytics.utm;
  const utmLine = utm?.source
    ? `${utm.source}${utm.medium ? ` / ${utm.medium}` : ""}${utm.campaign ? ` / ${utm.campaign}` : ""}`
    : null;

  const lines = [
    `${emoji} *Новая заявка* · ${escapeMarkdown(priorityLabel)}`,
    "",
    "*Контакт:*",
    `Имя: ${escapeMarkdown(lead.contact.name)}`,
    `Телефон: ${escapeMarkdown(lead.contact.phone)}`,
  ];

  if (lead.contact.messenger) lines.push(`Мессенджер: ${escapeMarkdown(lead.contact.messenger)}`);
  lines.push("", "*Суть:*", escapeMarkdown(summary));
  lines.push("", "*Источник:*", escapeMarkdown(formatSourceType(lead.source.sourceType)));
  if (lead.request.selectedCTA) lines.push(`CTA: ${escapeMarkdown(lead.request.selectedCTA)}`);
  if (lead.meta.currentUrl) lines.push(`Страница: ${escapeMarkdown(lead.meta.currentUrl)}`);
  if (utmLine) lines.push(`UTM: ${escapeMarkdown(utmLine)}`);

  if (automation.sla) {
    lines.push("", `*Приоритет:* ${escapeMarkdown(priorityLabel)}`);
    lines.push(`*SLA:* ${escapeMarkdown(formatSLAStatus({ ...lead, automation: { sla: automation.sla } }))}`);
  }

  if (automation.recommendedAction?.title) {
    lines.push("", "*Следующий шаг:*", escapeMarkdown(automation.recommendedAction.title));
    if (automation.recommendedAction.description) {
      lines.push(escapeMarkdown(automation.recommendedAction.description));
    }
  }

  const dashboardUrl = getDashboardLeadUrl(lead.id);
  if (dashboardUrl) {
    lines.push("", `[Открыть лид](${dashboardUrl})`);
  }

  return lines.join("\n");
}

/** Plain text for Telegram groups — avoids Markdown parse errors. */
export function formatTelegramLeadMessagePlain(
  lead: StoredLead,
  automation: Pick<LeadAutomationResult, "priority" | "recommendedAction" | "sla">,
): string {
  const summary = formatLeadNotificationSummary(lead);
  const priorityLabel = getPriorityLabel(automation.priority);
  const utm = lead.analytics.utm;
  const utmLine = utm?.source
    ? `${utm.source}${utm.medium ? ` / ${utm.medium}` : ""}${utm.campaign ? ` / ${utm.campaign}` : ""}`
    : null;

  const lines = [
    `Новая заявка · ${priorityLabel}`,
    "",
    "Контакт:",
    `Имя: ${lead.contact.name}`,
    `Телефон: ${lead.contact.phone}`,
  ];

  if (lead.contact.messenger) lines.push(`Мессенджер: ${lead.contact.messenger}`);
  lines.push("", "Суть:", summary);
  lines.push("", "Источник:", formatSourceType(lead.source.sourceType));
  if (lead.request.selectedCTA) lines.push(`CTA: ${lead.request.selectedCTA}`);
  if (lead.meta.currentUrl) lines.push(`Страница: ${lead.meta.currentUrl}`);
  if (utmLine) lines.push(`UTM: ${utmLine}`);

  if (automation.sla) {
    lines.push("", `Приоритет: ${priorityLabel}`);
    lines.push(`SLA: ${formatSLAStatus({ ...lead, automation: { sla: automation.sla } })}`);
  }

  if (automation.recommendedAction?.title) {
    lines.push("", "Следующий шаг:", automation.recommendedAction.title);
    if (automation.recommendedAction.description) {
      lines.push(automation.recommendedAction.description);
    }
  }

  const dashboardUrl = getDashboardLeadUrl(lead.id);
  if (dashboardUrl) lines.push("", `Карточка: ${dashboardUrl}`);

  return lines.join("\n");
}

export function formatEmailSubject(lead: Lead, priority: string): string {
  const type = getLeadProcessingType(lead);
  const typeLabels: Record<string, string> = {
    calculator: "Калькулятор",
    project: "Проект",
    planner: "Планировщик",
    "lead-magnet": "Лид-магнит",
    blog: "Блог",
    "case-like": "Кейс",
    "objects-map": "Карта",
    "service-page": "Услуга",
    callback: "Обратный звонок",
    unknown: "Заявка",
  };
  return `Новая заявка: ${typeLabels[type] ?? "Заявка"} — ${lead.contact.name} — ${priority}`;
}

export function formatEmailBody(
  lead: StoredLead,
  automation: Pick<LeadAutomationResult, "priority" | "recommendedAction" | "sla">,
): string {
  const summary = formatLeadNotificationSummary(lead);
  const lines = [
    formatEmailSubject(lead, getPriorityLabel(automation.priority)),
    "",
    "Контакт:",
    `Имя: ${lead.contact.name}`,
    `Телефон: ${lead.contact.phone}`,
  ];
  if (lead.contact.messenger) lines.push(`Мессенджер: ${lead.contact.messenger}`);
  lines.push("", "Суть:", summary);
  lines.push("", "Источник:", formatSourceType(lead.source.sourceType));
  if (lead.request.selectedCTA) lines.push(`CTA: ${lead.request.selectedCTA}`);
  if (lead.meta.currentUrl) lines.push(`URL: ${lead.meta.currentUrl}`);

  const q = lead.qualification;
  if (q.desiredArea || q.desiredMaterial || q.budget?.raw) {
    lines.push("", "Параметры:");
    if (q.desiredArea) lines.push(`Площадь: ${q.desiredArea} м²`);
    if (q.desiredMaterial) lines.push(`Материал: ${q.desiredMaterial}`);
    if (q.budget?.raw) lines.push(`Бюджет: ${q.budget.raw}`);
  }

  if (automation.recommendedAction?.title) {
    lines.push("", "Следующий шаг:", automation.recommendedAction.title);
    if (automation.recommendedAction.description) lines.push(automation.recommendedAction.description);
  }

  if (automation.sla) {
    lines.push("", "SLA:", formatSLAStatus({ ...lead, automation: { sla: automation.sla } }));
  }

  const dashboardUrl = getDashboardLeadUrl(lead.id);
  if (dashboardUrl) lines.push("", `Карточка лида: ${dashboardUrl}`);

  return lines.join("\n");
}

function escapeMarkdown(text: string): string {
  return text.replace(/([_*[\]()~`>#+\-=|{}.!\\])/g, "\\$1");
}

function getDashboardLeadUrl(leadId: string): string | null {
  let base = process.env.NEXT_PUBLIC_SITE_URL;
  if (!base && process.env.VERCEL_URL) {
    base = process.env.VERCEL_URL.startsWith("http")
      ? process.env.VERCEL_URL
      : `https://${process.env.VERCEL_URL}`;
  }
  if (!base) return null;
  return `${base.replace(/\/$/, "")}/dashboard/leads/${leadId}`;
}
