import type { LeadSourceType, LeadStatus, StoredLead } from "@/types/lead";
import { isLeadOverdue } from "./lead-sla";

export type LeadMetrics = {
  total: number;
  newCount: number;
  hotCount: number;
  warmCount: number;
  coldCount: number;
  last7DaysCount: number;
  last30DaysCount: number;
  calculatorCount: number;
  leadMagnetCount: number;
  averageLeadScore: number;
  overdueCount: number;
  urgentCount: number;
  noNextActionCount: number;
  bySourceType: Record<string, number>;
  byStatus: Record<LeadStatus, number>;
  byRequestType: Record<string, number>;
  byLeadMagnet: Record<string, number>;
  byService: Record<string, number>;
  byProject: Record<string, number>;
};

export function getLeadMetrics(leads: StoredLead[]): LeadMetrics {
  const realLeads = leads.filter((l) => !l.isDemo);
  const now = Date.now();
  const day7 = now - 7 * 24 * 60 * 60 * 1000;
  const day30 = now - 30 * 24 * 60 * 60 * 1000;

  const bySourceType: Record<string, number> = {};
  const byStatus = {} as Record<LeadStatus, number>;
  const byRequestType: Record<string, number> = {};
  const byLeadMagnet: Record<string, number> = {};
  const byService: Record<string, number> = {};
  const byProject: Record<string, number> = {};

  let scoreSum = 0;
  let scoreCount = 0;

  for (const lead of realLeads) {
    bySourceType[lead.source.sourceType] = (bySourceType[lead.source.sourceType] ?? 0) + 1;
    byStatus[lead.status] = (byStatus[lead.status] ?? 0) + 1;
    byRequestType[lead.request.type] = (byRequestType[lead.request.type] ?? 0) + 1;

    if (lead.context.leadMagnet?.title) {
      byLeadMagnet[lead.context.leadMagnet.title] = (byLeadMagnet[lead.context.leadMagnet.title] ?? 0) + 1;
    }
    if (lead.context.service?.title) {
      byService[lead.context.service.title] = (byService[lead.context.service.title] ?? 0) + 1;
    }
    if (lead.context.project?.title) {
      byProject[lead.context.project.title] = (byProject[lead.context.project.title] ?? 0) + 1;
    }

    if (lead.qualification.leadScore != null) {
      scoreSum += lead.qualification.leadScore;
      scoreCount += 1;
    }
  }

  return {
    total: realLeads.length,
    newCount: realLeads.filter((l) => l.status === "new").length,
    hotCount: realLeads.filter((l) => l.qualification.readiness === "hot").length,
    warmCount: realLeads.filter((l) => l.qualification.readiness === "warm").length,
    coldCount: realLeads.filter((l) => l.qualification.readiness === "cold").length,
    last7DaysCount: realLeads.filter((l) => new Date(l.meta.createdAt).getTime() >= day7).length,
    last30DaysCount: realLeads.filter((l) => new Date(l.meta.createdAt).getTime() >= day30).length,
    calculatorCount: realLeads.filter((l) => l.source.sourceType === "calculator").length,
    leadMagnetCount: realLeads.filter((l) => l.source.sourceType === "lead-magnet").length,
    averageLeadScore: scoreCount ? Math.round(scoreSum / scoreCount) : 0,
    overdueCount: realLeads.filter((l) => isLeadOverdue(l)).length,
    urgentCount: realLeads.filter((l) => l.automation?.priority === "urgent").length,
    noNextActionCount: realLeads.filter((l) => !l.nextAction?.type && l.status === "new").length,
    bySourceType,
    byStatus,
    byRequestType,
    byLeadMagnet,
    byService,
    byProject,
  };
}

export function topEntries(map: Record<string, number>, limit = 5): { key: string; count: number }[] {
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key, count]) => ({ key, count }));
}

export function sourceTypeLabel(type: LeadSourceType): string {
  const labels: Partial<Record<LeadSourceType, string>> = {
    calculator: "Калькулятор",
    "project-page": "Проекты",
    "lead-magnet": "Лид-магниты",
    "service-page": "Коммерческие",
    "blog-post": "Блог",
    planner: "Планировщик",
    home: "Главная",
    catalog: "Каталог",
    "case-page": "Кейсы",
    "objects-map": "Карта",
  };
  return labels[type] ?? type;
}
