import type { Lead, LeadPriority, LeadSLA, StoredLead } from "@/types/lead";
import { getLeadPriority } from "./lead-routing";

const SLA_MINUTES: Record<LeadPriority, number> = {
  urgent: 15,
  high: 30,
  normal: 120,
  low: 24 * 60,
};

const ACTIVE_STATUSES = new Set(["new", "qualified"]);

export type BusinessHours = {
  enabled: boolean;
  timezone: string;
  days: number[];
  startHour: number;
  endHour: number;
};

/** Adjust SLA deadline to business hours when LEADS_SLA_BUSINESS_HOURS=true */
export const DEFAULT_BUSINESS_HOURS: BusinessHours = {
  enabled: process.env.LEADS_SLA_BUSINESS_HOURS === "true",
  timezone: "Asia/Irkutsk",
  days: [1, 2, 3, 4, 5],
  startHour: 9,
  endHour: 18,
};

function addBusinessMinutes(start: Date, minutes: number, hours: BusinessHours): Date {
  if (!hours.enabled) return new Date(start.getTime() + minutes * 60_000);

  let remaining = minutes;
  const cursor = new Date(start);

  while (remaining > 0) {
    const day = cursor.getDay();
    const hour = cursor.getHours();

    if (!hours.days.includes(day) || hour >= hours.endHour) {
      cursor.setDate(cursor.getDate() + 1);
      cursor.setHours(hours.startHour, 0, 0, 0);
      continue;
    }

    if (hour < hours.startHour) {
      cursor.setHours(hours.startHour, 0, 0, 0);
      continue;
    }

    const minutesLeftToday = (hours.endHour - hour) * 60 - cursor.getMinutes();
    const step = Math.min(remaining, minutesLeftToday);
    cursor.setMinutes(cursor.getMinutes() + step);
    remaining -= step;

    if (remaining > 0) {
      cursor.setDate(cursor.getDate() + 1);
      cursor.setHours(hours.startHour, 0, 0, 0);
    }
  }

  return cursor;
}

export function calculateLeadSLA(lead: Lead, priority?: LeadPriority): LeadSLA {
  const p = priority ?? getLeadPriority(lead);
  const targetResponseMinutes = SLA_MINUTES[p];
  const createdAt = new Date(lead.meta.createdAt);
  const deadline = addBusinessMinutes(createdAt, targetResponseMinutes, DEFAULT_BUSINESS_HOURS);

  const sla: LeadSLA = {
    priority: p,
    responseDeadlineAt: deadline.toISOString(),
    targetResponseMinutes,
  };

  if (isLeadOverdue(lead, sla)) {
    sla.isOverdue = true;
    sla.overdueMinutes = getOverdueMinutes(lead, sla);
  }

  return sla;
}

export function isLeadOverdue(lead: Lead, sla?: LeadSLA): boolean {
  if (!ACTIVE_STATUSES.has(lead.status)) return false;
  if (lead.status === "spam" || lead.status === "lost" || lead.status === "won") return false;

  const deadline = sla?.responseDeadlineAt ?? lead.automation?.sla?.responseDeadlineAt;
  if (!deadline) return false;

  return new Date(deadline).getTime() < Date.now();
}

export function getOverdueMinutes(lead: Lead, sla?: LeadSLA): number {
  const deadline = sla?.responseDeadlineAt ?? lead.automation?.sla?.responseDeadlineAt;
  if (!deadline) return 0;
  const diff = Date.now() - new Date(deadline).getTime();
  return diff > 0 ? Math.floor(diff / 60000) : 0;
}

export function formatSLAStatus(lead: Lead): string {
  const sla = lead.automation?.sla;
  if (!sla) return "SLA не назначен";

  const deadline = new Date(sla.responseDeadlineAt);
  const formatted = deadline.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isLeadOverdue(lead, sla)) {
    const mins = getOverdueMinutes(lead, sla);
    if (mins >= 60) {
      const hours = Math.floor(mins / 60);
      return `Просрочен на ${hours} ч. (дедлайн ${formatted})`;
    }
    return `Просрочен на ${mins} мин. (дедлайн ${formatted})`;
  }

  return `Связаться до ${formatted} (${sla.targetResponseMinutes} мин.)`;
}

export function getOverdueLeads(leads: StoredLead[]): StoredLead[] {
  return leads.filter((l) => isLeadOverdue(l));
}

export function enrichLeadSLA(lead: StoredLead): StoredLead {
  const sla = lead.automation?.sla ?? calculateLeadSLA(lead, lead.automation?.priority);
  const isOverdue = isLeadOverdue(lead, sla);
  return {
    ...lead,
    automation: {
      ...lead.automation,
      sla: {
        ...sla,
        isOverdue,
        overdueMinutes: isOverdue ? getOverdueMinutes(lead, sla) : undefined,
      },
    },
  };
}
