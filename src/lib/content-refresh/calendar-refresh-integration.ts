import type { ContentRefreshCandidate } from "@/types/content-refresh";
import type { ContentVersion } from "@/types/content-version";
import { calendarService } from "@/lib/content-calendar/calendar-service";
import { refreshStore } from "@/lib/content-refresh/refresh-store";

export async function sendRefreshTaskToCalendar(
  candidate: ContentRefreshCandidate,
): Promise<{ queued: boolean; message: string }> {
  refreshStore.logAudit({
    action: "refresh_sent_to_calendar",
    entityType: "candidate",
    entityId: candidate.id,
    contentItemId: candidate.contentItemId,
  });

  return {
    queued: true,
    message: `Refresh task for ${candidate.url} queued for calendar scheduling`,
  };
}

export function recommendRefreshSchedule(candidate: ContentRefreshCandidate): {
  recommendedDate: string;
  rationale: string;
} {
  const daysOut = candidate.priority.level === "critical" ? 3 : candidate.priority.level === "high" ? 7 : 14;
  const date = new Date();
  date.setDate(date.getDate() + daysOut);
  return {
    recommendedDate: date.toISOString().slice(0, 10),
    rationale: `Priority ${candidate.priority.level} — schedule in ${daysOut} days`,
  };
}

export function reserveExpertReviewSlot(candidate: ContentRefreshCandidate): {
  reserved: boolean;
  slotDate: string;
} {
  const schedule = recommendRefreshSchedule(candidate);
  const slotDate = new Date(schedule.recommendedDate);
  slotDate.setDate(slotDate.getDate() - 2);
  return {
    reserved: candidate.reasons.includes("missing-expertise"),
    slotDate: slotDate.toISOString().slice(0, 10),
  };
}

export function reserveEditorialReviewSlot(candidate: ContentRefreshCandidate): {
  reserved: boolean;
  slotDate: string;
} {
  const schedule = recommendRefreshSchedule(candidate);
  return { reserved: true, slotDate: schedule.recommendedDate };
}

export function scheduleRefreshPublication(version: ContentVersion): {
  scheduled: boolean;
  date: string;
} {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return { scheduled: true, date: date.toISOString().slice(0, 10) };
}

export async function balanceNewContentAndRefreshTasks(calendar: {
  newContentCount: number;
  refreshCount: number;
}): Promise<{ balanced: boolean; recommendation: string }> {
  const ratio = calendar.refreshCount / Math.max(calendar.newContentCount, 1);
  if (ratio > 0.5) {
    return {
      balanced: false,
      recommendation: "Refresh tasks exceed 50% of calendar — defer lower priority refreshes",
    };
  }
  await calendarService.getDashboardData();
  return { balanced: true, recommendation: "Calendar balance acceptable" };
}

export const calendarRefreshIntegration = {
  sendRefreshTaskToCalendar,
  recommendRefreshSchedule,
  reserveExpertReviewSlot,
  reserveEditorialReviewSlot,
  scheduleRefreshPublication,
  balanceNewContentAndRefreshTasks,
};
