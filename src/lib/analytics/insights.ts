import type {
  AnalyticsInsight,
  AnalyticsKPIs,
  AnalyticsReport,
  CTAPerformance,
  PagePerformance,
  SourcePerformance,
  ToolPerformanceReport,
} from "@/types/analytics";
import { pagesWithViewsNoLeads } from "./page-performance";
import { hasUtmData } from "./source-performance";

export function generateAnalyticsInsights(report: Pick<
  AnalyticsReport,
  "kpis" | "pages" | "sources" | "tools" | "crm" | "funnels" | "meta"
>): AnalyticsInsight[] {
  const insights: AnalyticsInsight[] = [];
  let id = 0;
  const add = (type: AnalyticsInsight["type"], text: string, basedOn: AnalyticsInsight["basedOn"] = "data") => {
    insights.push({ id: `insight_${++id}`, type, text, basedOn });
  };

  if (!report.meta.hasEvents && report.kpis.leads === 0) {
    add("info", "Данных пока недостаточно. Проверьте подключение событий и отправьте тестовые заявки.", "recommendation");
    return insights.slice(0, 5);
  }

  const calcLeads = report.tools.calculator.leadSubmitted;
  if (calcLeads >= 3) {
    add("success", `Калькулятор дал ${calcLeads} заявок — усилите CTA на калькулятор с главной, в статьях и карточках проектов.`);
  }

  const lowConvProjects = pagesWithViewsNoLeads(report.pages, 2);
  if (lowConvProjects.length >= 2) {
    add("warning", "Проекты смотрят, но редко отправляют заявку. Усильте CTA «Получить расчёт проекта» и блок доверия в карточках.");
  }

  const blogLeads = report.pages.filter((p) => p.pageType.includes("blog") && p.leads > 0);
  if (blogLeads.length > 0) {
    add("success", "Блог уже влияет на заявки. Развивайте кластеры, которые дают лиды.");
  }

  if (report.tools.leadMagnets.submitted >= 2) {
    add("action", "Лид-магниты собирают контакты. Добавьте их на похожие страницы и в перелинковку.");
  }

  if (report.crm.overdue > 0) {
    add("warning", `Есть ${report.crm.overdue} просроченных лидов по SLA. Сократите время реакции или усильте уведомления.`);
  }

  const lowSource = report.sources.find((s) => s.leads >= 3 && s.averageLeadScore < 35);
  if (lowSource) {
    add("warning", `Источник «${lowSource.source}» даёт лиды с низким score. Проверьте рекламное сообщение или посадочную страницу.`);
  }

  const servicePages = report.pages.filter((p) => p.pageType === "service-page" && p.leads >= 2);
  if (servicePages.length > 0) {
    add("success", "Коммерческие страницы конвертируют. Усильте внутреннюю перелинковку на них.");
  }

  if (!hasUtmData(report.sources)) {
    add("info", "UTM-метки не найдены. Для рекламной аналитики размечайте ссылки utm_source / utm_medium / utm_campaign.", "recommendation");
  }

  if (report.kpis.hotLeads >= 5 && report.crm.avgResponseMinutes && report.crm.avgResponseMinutes > 60) {
    add("warning", "Горячие лиды есть, но среднее время реакции высокое. Приоритизируйте urgent-лиды.");
  }

  if (insights.length < 3) {
    add("info", "Продолжайте собирать события — через 2–4 недели insights станут точнее.", "recommendation");
  }

  return insights.slice(0, 10);
}

export function formatPercent(value: number | null | undefined, digits = 1): string {
  if (value == null || Number.isNaN(value)) return "—";
  return `${(value * 100).toFixed(digits)}%`;
}

export function formatTrend(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

export function computeKPIs(
  events: { name: string; sessionId?: string }[],
  leads: { qualification: { leadScore?: number; readiness: string }; meta: { createdAt: string } }[],
  pages: PagePerformance[],
  sources: SourcePerformance[],
  ctas: CTAPerformance[],
  crm: { overdue: number },
  prevLeads?: typeof leads,
): AnalyticsKPIs {
  const pageViews = events.filter((e) => e.name === "page_viewed").length;
  const ctaClicks = events.filter((e) => e.name === "cta_clicked").length;
  const formStarts = events.filter((e) => ["form_started", "lead_form_started"].includes(e.name)).length;
  const formSubmits = events.filter((e) => ["form_submitted", "lead_form_success"].includes(e.name)).length;

  const hotLeads = leads.filter((l) => l.qualification.readiness === "hot").length;
  const scores = leads.map((l) => l.qualification.leadScore ?? 0).filter((s) => s > 0);

  const topPage = pages.sort((a, b) => b.leads - a.leads)[0];
  const topSource = sources.sort((a, b) => b.leads - a.leads)[0];
  const topCTA = ctas.sort((a, b) => b.leads - a.leads)[0];

  const kpis: AnalyticsKPIs = {
    leads: leads.length,
    hotLeads,
    avgLeadScore: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
    formSubmitRate: formStarts > 0 ? formSubmits / formStarts : null,
    overdueSLA: crm.overdue,
    topSource: topSource ? `${topSource.source}${topSource.medium ? ` / ${topSource.medium}` : ""}` : null,
    topPage: topPage?.path ?? null,
    topCTA: topCTA?.ctaLabel ?? null,
    pageViews,
    ctaClicks,
  };

  if (prevLeads) {
    const prevHot = prevLeads.filter((l) => l.qualification.readiness === "hot").length;
    const prevScores = prevLeads.map((l) => l.qualification.leadScore ?? 0).filter((s) => s > 0);
    kpis.trends = {
      leads: formatTrend(leads.length, prevLeads.length),
      hotLeads: formatTrend(hotLeads, prevHot),
      avgLeadScore: prevScores.length && scores.length
        ? formatTrend(kpis.avgLeadScore, Math.round(prevScores.reduce((a, b) => a + b, 0) / prevScores.length))
        : null,
    };
  }

  return kpis;
}
