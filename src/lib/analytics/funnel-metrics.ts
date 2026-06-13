import type { StoredAnalyticsEvent, FunnelReport, FunnelStep } from "@/types/analytics";
import type { StoredLead } from "@/types/lead";
import type { DateRange } from "@/types/analytics";
import { isInDateRange } from "./date-range";

function countEvents(events: StoredAnalyticsEvent[], names: string | string[]): number {
  const set = new Set(Array.isArray(names) ? names : [names]);
  return events.filter((e) => set.has(e.name)).length;
}

function buildSteps(steps: { name: string; label: string; count: number }[]): FunnelStep[] {
  return steps.map((step, i) => {
    const prev = i > 0 ? steps[i - 1].count : step.count;
    const conversionFromPrev = prev > 0 ? step.count / prev : null;
    const dropOff = prev > 0 && i > 0 ? (prev - step.count) / prev : null;
    return { ...step, conversionFromPrev, dropOff };
  });
}

function hasEnoughData(steps: FunnelStep[]): boolean {
  return steps.some((s) => s.count > 0);
}

export function computeFunnels(
  events: StoredAnalyticsEvent[],
  leads: StoredLead[],
  range: DateRange,
): FunnelReport[] {
  const ev = events.filter((e) => isInDateRange(e.timestamp, range));
  const ld = leads.filter((l) => !l.isDemo && isInDateRange(l.meta.createdAt, range));

  const siteSteps = buildSteps([
    { name: "page_viewed", label: "Просмотры страниц", count: countEvents(ev, "page_viewed") },
    { name: "cta_clicked", label: "Клики по CTA", count: countEvents(ev, "cta_clicked") },
    { name: "form_started", label: "Начали форму", count: countEvents(ev, ["form_started", "lead_form_started"]) },
    { name: "form_submitted", label: "Отправили форму", count: countEvents(ev, ["form_submitted", "lead_form_submitted"]) },
    { name: "lead_created", label: "Лиды созданы", count: Math.max(countEvents(ev, "lead_created"), ld.length) },
  ]);

  const calcSteps = buildSteps([
    { name: "calculator_started", label: "Старт калькулятора", count: countEvents(ev, "calculator_started") },
    { name: "calculator_result_viewed", label: "Просмотр результата", count: countEvents(ev, "calculator_result_viewed") },
    { name: "calculator_lead_submitted", label: "Заявка из калькулятора", count: countEvents(ev, ["calculator_lead_submitted", "calculator_submit"]) },
    { name: "lead_created", label: "Лид создан", count: ld.filter((l) => l.source.sourceType === "calculator").length },
  ]);

  const plannerSteps = buildSteps([
    { name: "planner_started", label: "Старт планировщика", count: countEvents(ev, "planner_started") },
    { name: "planner_recommendations_viewed", label: "Рекомендации", count: countEvents(ev, "planner_recommendations_viewed") },
    { name: "planner_lead_submitted", label: "Заявка", count: countEvents(ev, ["planner_lead_submitted", "planner_submit"]) },
    { name: "lead_created", label: "Лид", count: ld.filter((l) => l.source.sourceType === "planner").length },
  ]);

  const magnetSteps = buildSteps([
    { name: "lead_magnet_viewed", label: "Просмотр", count: countEvents(ev, "lead_magnet_viewed") },
    { name: "lead_magnet_clicked", label: "Клик", count: countEvents(ev, "lead_magnet_clicked") },
    { name: "lead_magnet_submitted", label: "Отправка", count: countEvents(ev, "lead_magnet_submitted") },
    { name: "lead_created", label: "Лид", count: ld.filter((l) => l.source.sourceType === "lead-magnet").length },
  ]);

  const projectSteps = buildSteps([
    { name: "project_viewed", label: "Просмотр проекта", count: countEvents(ev, "project_viewed") + countEvents(ev, "page_viewed") },
    { name: "project_cta_clicked", label: "CTA проекта", count: countEvents(ev, "project_cta_clicked") },
    { name: "project_lead_submitted", label: "Заявка", count: countEvents(ev, "project_lead_submitted") },
    { name: "lead_created", label: "Лид", count: ld.filter((l) => l.source.sourceType === "project-page").length },
  ]);

  const crmSteps = buildSteps([
    { name: "lead_created", label: "Новые", count: ld.length },
    { name: "contacted", label: "Связались", count: ld.filter((l) => ["contacted", "in_discussion", "estimate_requested", "proposal_sent", "won"].includes(l.status)).length },
    { name: "in_discussion", label: "В обсуждении", count: ld.filter((l) => ["in_discussion", "estimate_requested", "proposal_sent", "won"].includes(l.status)).length },
    { name: "estimate_requested", label: "Нужна смета", count: ld.filter((l) => ["estimate_requested", "proposal_sent", "won"].includes(l.status)).length },
    { name: "proposal_sent", label: "КП отправлено", count: ld.filter((l) => ["proposal_sent", "won"].includes(l.status)).length },
    { name: "won", label: "Выиграно", count: ld.filter((l) => l.status === "won").length },
  ]);

  const mk = (id: string, title: string, question: string, steps: FunnelStep[]): FunnelReport => ({
    id,
    title,
    question,
    steps,
    overallConversion: steps.length >= 2 && steps[0].count > 0 ? steps[steps.length - 1].count / steps[0].count : null,
    hasEnoughData: hasEnoughData(steps),
  });

  return [
    mk("site", "Общая воронка", "Как пользователь доходит до заявки?", siteSteps),
    mk("calculator", "Калькулятор", "Конвертирует ли калькулятор?", calcSteps),
    mk("planner", "Планировщик", "Доводят ли до заявки?", plannerSteps),
    mk("lead-magnet", "Лид-магниты", "Работают ли лид-магниты?", magnetSteps),
    mk("project", "Проекты", "Конверсия карточек проектов?", projectSteps),
    mk("crm", "CRM-воронка", "Как лиды движутся по статусам?", crmSteps),
  ];
}
