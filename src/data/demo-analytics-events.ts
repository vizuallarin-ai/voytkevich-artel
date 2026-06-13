import type { StoredAnalyticsEvent } from "@/types/analytics";

const now = Date.now();
const hoursAgo = (h: number) => new Date(now - h * 3600000).toISOString();
const daysAgo = (d: number) => new Date(now - d * 86400000).toISOString();

const session = "demo_session_analytics";

export const demoAnalyticsEvents: StoredAnalyticsEvent[] = [
  { id: "demo_ev_001", name: "page_viewed", category: "page", timestamp: daysAgo(2), sessionId: session, page: { path: "/calculator", pageType: "calculator" }, meta: { debug: true } },
  { id: "demo_ev_002", name: "calculator_started", category: "calculator", timestamp: daysAgo(2), sessionId: session, meta: { debug: true } },
  { id: "demo_ev_003", name: "calculator_result_viewed", category: "calculator", timestamp: daysAgo(2), sessionId: session, metrics: { area: 140 }, meta: { debug: true } },
  { id: "demo_ev_004", name: "cta_clicked", category: "cta", timestamp: daysAgo(2), sessionId: session, page: { path: "/calculator", pageType: "calculator" }, action: { ctaLabel: "Получить расчёт" }, meta: { debug: true } },
  { id: "demo_ev_005", name: "form_submitted", category: "form", timestamp: daysAgo(2), sessionId: session, meta: { debug: true } },
  { id: "demo_ev_006", name: "calculator_lead_submitted", category: "calculator", timestamp: daysAgo(2), sessionId: session, leadId: "demo_calc_001", metrics: { leadScore: 75, readiness: "hot" }, meta: { debug: true } },
  { id: "demo_ev_007", name: "lead_created", category: "lead", timestamp: daysAgo(2), sessionId: session, leadId: "demo_calc_001", meta: { debug: true } },
  { id: "demo_ev_008", name: "page_viewed", category: "page", timestamp: daysAgo(3), sessionId: "demo_s2", page: { path: "/catalog/angara-100-gotovyj-proekt-dvuhetazhnogo-doma", pageType: "project-page" }, meta: { debug: true } },
  { id: "demo_ev_009", name: "project_cta_clicked", category: "project", timestamp: daysAgo(3), sessionId: "demo_s2", action: { ctaLabel: "Отправить проект на расчёт" }, context: { projectSlug: "angara-100-gotovyj-proekt-dvuhetazhnogo-doma" }, meta: { debug: true } },
  { id: "demo_ev_010", name: "project_lead_submitted", category: "project", timestamp: daysAgo(3), sessionId: "demo_s2", leadId: "demo_project_002", meta: { debug: true } },
  { id: "demo_ev_011", name: "page_viewed", category: "page", timestamp: daysAgo(5), sessionId: "demo_s3", page: { path: "/blog/smeta-na-stroitelstvo-doma-iz-chego-sostoit", pageType: "blog-post" }, source: { utmSource: "google", utmMedium: "organic" }, meta: { debug: true } },
  { id: "demo_ev_012", name: "lead_magnet_clicked", category: "lead-magnet", timestamp: daysAgo(5), sessionId: "demo_s3", context: { leadMagnetId: "estimate-example", clusterId: "estimate" }, meta: { debug: true } },
  { id: "demo_ev_013", name: "lead_magnet_submitted", category: "lead-magnet", timestamp: daysAgo(5), sessionId: "demo_s3", leadId: "demo_magnet_003", meta: { debug: true } },
  { id: "demo_ev_014", name: "planner_started", category: "planner", timestamp: daysAgo(2), sessionId: "demo_s4", meta: { debug: true } },
  { id: "demo_ev_015", name: "planner_lead_submitted", category: "planner", timestamp: daysAgo(2), sessionId: "demo_s4", leadId: "demo_planner_004", meta: { debug: true } },
  { id: "demo_ev_016", name: "cta_clicked", category: "cta", timestamp: hoursAgo(6), sessionId: session, page: { path: "/", pageType: "home" }, action: { ctaLabel: "Получить консультацию" }, meta: { debug: true } },
  { id: "demo_ev_017", name: "sla_overdue", category: "automation", timestamp: hoursAgo(2), leadId: "demo_calc_001", meta: { debug: true } },
];

export function shouldIncludeDemoAnalytics(realCount: number): boolean {
  if (process.env.NODE_ENV === "production") return false;
  if (process.env.ANALYTICS_USE_DEMO === "true") return true;
  return realCount === 0 && process.env.NODE_ENV === "development";
}
