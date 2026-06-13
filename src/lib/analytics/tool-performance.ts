import type { StoredAnalyticsEvent, ToolPerformanceReport } from "@/types/analytics";
import type { StoredLead } from "@/types/lead";
import type { DateRange } from "@/types/analytics";
import { isInDateRange } from "./date-range";

function count(events: StoredAnalyticsEvent[], names: string[]): number {
  const set = new Set(names);
  return events.filter((e) => set.has(e.name)).length;
}

export function computeToolPerformance(
  events: StoredAnalyticsEvent[],
  leads: StoredLead[],
  range: DateRange,
): ToolPerformanceReport {
  const ev = events.filter((e) => isInDateRange(e.timestamp, range));
  const ld = leads.filter((l) => !l.isDemo && isInDateRange(l.meta.createdAt, range));

  const calcLeads = ld.filter((l) => l.source.sourceType === "calculator");
  const plannerLeads = ld.filter((l) => l.source.sourceType === "planner");
  const magnetLeads = ld.filter((l) => l.source.sourceType === "lead-magnet" || l.request.type === "lead-magnet");

  const calcStarted = count(ev, ["calculator_started"]);
  const calcResult = count(ev, ["calculator_result_viewed"]);
  const calcSubmit = count(ev, ["calculator_lead_submitted", "calculator_submit"]);

  const plannerStarted = count(ev, ["planner_started"]);
  const plannerRec = count(ev, ["planner_recommendations_viewed"]);
  const plannerSubmit = count(ev, ["planner_lead_submitted", "planner_submit"]);

  const magnetViewed = count(ev, ["lead_magnet_viewed"]);
  const magnetClicked = count(ev, ["lead_magnet_clicked"]);
  const magnetSubmit = count(ev, ["lead_magnet_submitted"]);

  const materials = new Map<string, number>();
  const scenarios = new Map<string, number>();
  const magnets = new Map<string, { title: string; count: number }>();

  for (const l of calcLeads) {
    const m = l.context.calculator?.material ?? l.qualification.desiredMaterial;
    if (m) materials.set(m, (materials.get(m) ?? 0) + 1);
  }
  for (const l of plannerLeads) {
    const s = l.context.planner?.scenario ?? "unknown";
    scenarios.set(s, (scenarios.get(s) ?? 0) + 1);
  }
  for (const l of magnetLeads) {
    const id = l.context.leadMagnet?.id ?? l.context.leadMagnet?.title ?? "unknown";
    const title = l.context.leadMagnet?.title ?? id;
    magnets.set(id, { title, count: (magnets.get(id)?.count ?? 0) + 1 });
  }

  const calcAreas = calcLeads.map((l) => l.context.calculator?.area ?? l.qualification.desiredArea).filter(Boolean) as number[];
  const plannerAreas = plannerLeads.map((l) => l.context.planner?.totalArea ?? l.context.planner?.targetArea).filter(Boolean) as number[];

  const magnetScores = magnetLeads.map((l) => l.qualification.leadScore ?? 0);

  return {
    calculator: {
      started: calcStarted,
      resultViewed: calcResult,
      leadSubmitted: Math.max(calcSubmit, calcLeads.length),
      conversionToLead: calcResult > 0 ? Math.max(calcSubmit, calcLeads.length) / calcResult : calcLeads.length > 0 ? null : null,
      avgArea: calcAreas.length ? Math.round(calcAreas.reduce((a, b) => a + b, 0) / calcAreas.length) : null,
      topMaterial: topKey(materials),
    },
    planner: {
      started: plannerStarted,
      recommendationsViewed: plannerRec,
      leadSubmitted: Math.max(plannerSubmit, plannerLeads.length),
      conversionToLead: plannerRec > 0 ? Math.max(plannerSubmit, plannerLeads.length) / plannerRec : null,
      avgArea: plannerAreas.length ? Math.round(plannerAreas.reduce((a, b) => a + b, 0) / plannerAreas.length) : null,
      topScenario: topKey(scenarios),
    },
    leadMagnets: {
      viewed: magnetViewed,
      clicked: magnetClicked,
      submitted: Math.max(magnetSubmit, magnetLeads.length),
      conversion: magnetClicked > 0 ? Math.max(magnetSubmit, magnetLeads.length) / magnetClicked : null,
      topMagnets: [...magnets.values()].sort((a, b) => b.count - a.count).slice(0, 5).map((m) => ({ id: m.title, title: m.title, count: m.count })),
      avgLeadScore: magnetScores.length ? Math.round(magnetScores.reduce((a, b) => a + b, 0) / magnetScores.length) : 0,
    },
    catalog: {
      views: count(ev, ["catalog_viewed"]),
      projectClicks: count(ev, ["catalog_project_clicked"]),
      leads: ld.filter((l) => l.source.sourceType === "catalog" || l.source.sourceType === "catalog-category").length,
    },
  };
}

function topKey(map: Map<string, number>): string | null {
  const sorted = [...map.entries()].sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] ?? null;
}
