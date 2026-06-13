import type { CRMPerformanceReport } from "@/types/analytics";
import type { StoredLead } from "@/types/lead";
import { isLeadOverdue } from "@/lib/leads/lead-sla";
import type { DateRange } from "@/types/analytics";
import { isInDateRange } from "./date-range";

export function computeCRMPerformance(leads: StoredLead[], range: DateRange): CRMPerformanceReport {
  const ld = leads.filter((l) => !l.isDemo && isInDateRange(l.meta.createdAt, range));

  const byStatus: Record<string, number> = {};
  for (const l of ld) {
    byStatus[l.status] = (byStatus[l.status] ?? 0) + 1;
  }

  const responseTimes: number[] = [];
  for (const lead of ld) {
    const created = new Date(lead.meta.createdAt).getTime();
    const contactedEvent = lead.timeline?.find(
      (e) => e.type === "status_changed" && e.title.includes("Связались"),
    );
    const firstComment = lead.comments?.[0];
    const firstAction = lead.nextAction?.createdAt;

    const times = [
      contactedEvent ? new Date(contactedEvent.createdAt).getTime() : null,
      firstComment ? new Date(firstComment.createdAt).getTime() : null,
      firstAction ? new Date(firstAction).getTime() : null,
    ].filter((t): t is number => t !== null && t > created);

    if (times.length) {
      responseTimes.push(Math.min(...times) - created);
    }
  }

  const responseMinutes = responseTimes.map((ms) => Math.round(ms / 60000));
  responseMinutes.sort((a, b) => a - b);

  const overdue = ld.filter((l) => isLeadOverdue(l)).length;
  const withSla = ld.filter((l) => l.automation?.sla);
  const slaHit = withSla.filter((l) => !isLeadOverdue(l) && l.status !== "new").length;

  return {
    total: ld.length,
    byStatus,
    hot: ld.filter((l) => l.qualification.readiness === "hot").length,
    warm: ld.filter((l) => l.qualification.readiness === "warm").length,
    cold: ld.filter((l) => l.qualification.readiness === "cold").length,
    overdue,
    avgResponseMinutes: responseMinutes.length
      ? Math.round(responseMinutes.reduce((a, b) => a + b, 0) / responseMinutes.length)
      : null,
    medianResponseMinutes: responseMinutes.length ? responseMinutes[Math.floor(responseMinutes.length / 2)] : null,
    slaHitRate: withSla.length ? slaHit / withSla.length : null,
    withoutNextAction: ld.filter((l) => l.status === "new" && !l.nextAction?.type).length,
    won: byStatus.won ?? 0,
    lost: byStatus.lost ?? 0,
  };
}
