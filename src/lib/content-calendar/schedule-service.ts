import type { ContentCalendarItem } from "@/types/content-calendar";
import type { ScheduleOptions, SchedulePlan } from "@/types/content-scheduling";
import { contentRepository } from "@/lib/content-cms/content-repository";
import { calendarRepository } from "@/lib/content-calendar/calendar-repository";
import { getContentReadiness } from "@/lib/content-calendar/content-readiness";
import { validateSchedule } from "@/lib/content-calendar/schedule-validator";
import { markCMSContentAsScheduled } from "@/lib/content-calendar/cms-schedule-integration";
import { createPublicationPackageSchedule } from "@/lib/content-calendar/distribution-schedule-integration";
import { calendarAuditLog } from "@/lib/content-calendar/calendar-audit-log";
import {
  trackContentScheduled,
  trackContentRescheduled,
  trackContentScheduleCancelled,
  trackContentPackageScheduled,
  trackScheduleValidationFailed,
} from "@/lib/content-calendar/calendar-analytics";

function newId(): string {
  return `cal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const scheduleService = {
  async scheduleContent(
    contentItemId: string,
    scheduledAt: string,
    options: ScheduleOptions = {},
  ): Promise<ContentCalendarItem> {
    const contentItem = await contentRepository.getContentById(contentItemId);
    if (!contentItem) throw new Error("Content not found");

    const settings = calendarRepository.getSettings();
    const validation = await validateSchedule(contentItem, scheduledAt, options, settings.mode);

    if (!validation.canSchedule) {
      trackScheduleValidationFailed({
        contentItemId,
        blockersCount: validation.blockers.length,
        warningsCount: validation.warnings.length,
        scheduleMode: settings.mode,
      });
      throw new Error(validation.blockers.join("; "));
    }

    const readiness = await getContentReadiness(contentItem);
    const item: ContentCalendarItem = {
      id: newId(),
      contentItemId,
      contentTitle: contentItem.title,
      contentKind: contentItem.kind,
      contentUrl: contentItem.url,
      status: "scheduled",
      scheduledAt,
      publicationType: options.publicationType ?? "site-full-article",
      platformId: options.platformId,
      publicationId: options.publicationId,
      priority: options.priority ?? contentItem.seo.priority ?? "P3",
      readiness,
      warnings: validation.warnings,
      blockers: [],
      createdAt: new Date().toISOString(),
    };

    if (item.publicationType === "site-full-article") {
      await markCMSContentAsScheduled(contentItemId, scheduledAt);
    }

    const saved = await calendarRepository.save(item);
    calendarAuditLog.append({
      calendarItemId: saved.id,
      contentItemId,
      action: "scheduled",
      details: scheduledAt,
    });

    trackContentScheduled({
      calendarItemId: saved.id,
      contentItemId,
      contentKind: contentItem.kind,
      scheduledAt,
      platformId: options.platformId,
      priority: saved.priority,
      warningsCount: validation.warnings.length,
      scheduleMode: settings.mode,
    });

    return saved;
  },

  async rescheduleContent(calendarItemId: string, newScheduledAt: string): Promise<ContentCalendarItem> {
    const existing = await calendarRepository.getById(calendarItemId);
    if (!existing) throw new Error("Calendar item not found");

    const contentItem = await contentRepository.getContentById(existing.contentItemId);
    if (!contentItem) throw new Error("Content not found");

    const settings = calendarRepository.getSettings();
    const validation = await validateSchedule(
      contentItem,
      newScheduledAt,
      { publicationType: existing.publicationType, platformId: existing.platformId },
      settings.mode,
    );

    if (!validation.canSchedule) {
      throw new Error(validation.blockers.join("; "));
    }

    existing.scheduledAt = newScheduledAt;
    existing.status = "rescheduled";
    existing.warnings = validation.warnings;
    const saved = await calendarRepository.save(existing);

    calendarAuditLog.append({
      calendarItemId,
      contentItemId: existing.contentItemId,
      action: "rescheduled",
      details: newScheduledAt,
    });

    trackContentRescheduled({
      calendarItemId,
      contentItemId: existing.contentItemId,
      scheduledAt: newScheduledAt,
    });

    return saved;
  },

  async cancelScheduledContent(calendarItemId: string): Promise<ContentCalendarItem> {
    const existing = await calendarRepository.getById(calendarItemId);
    if (!existing) throw new Error("Calendar item not found");

    existing.status = "cancelled";
    const saved = await calendarRepository.save(existing);

    calendarAuditLog.append({
      calendarItemId,
      contentItemId: existing.contentItemId,
      action: "cancelled",
    });

    trackContentScheduleCancelled({
      calendarItemId,
      contentItemId: existing.contentItemId,
    });

    return saved;
  },

  async scheduleExternalTeaser(
    publicationId: string,
    contentItemId: string,
    scheduledAt: string,
    platformId: string,
  ): Promise<ContentCalendarItem> {
    return this.scheduleContent(contentItemId, scheduledAt, {
      publicationType: "external-teaser",
      platformId,
      publicationId,
    });
  },

  async schedulePublicationPackage(contentItemId: string, plan: SchedulePlan): Promise<ContentCalendarItem[]> {
    const settings = calendarRepository.getSettings();
    const full = await this.scheduleContent(contentItemId, plan.fullArticleAt, {
      publicationType: "site-full-article",
    });

    const teasers: ContentCalendarItem[] = [];
    for (const t of plan.teasers ?? []) {
      const teaser = await this.scheduleExternalTeaser(
        t.publicationId ?? `pub-${t.platformId}`,
        contentItemId,
        t.scheduledAt,
        t.platformId,
      );
      teasers.push(teaser);
    }

    trackContentPackageScheduled({
      contentItemId,
      scheduledAt: plan.fullArticleAt,
      scheduleMode: settings.mode,
    });

    return [full, ...teasers];
  },

  async getScheduledContent(startDate: string, endDate: string): Promise<ContentCalendarItem[]> {
    return calendarRepository.getByDateRange(startDate, endDate);
  },

  async getUnscheduledApprovedContent() {
    const approved = await contentRepository.listContent({ status: ["approved"] });
    const scheduled = await calendarRepository.list();
    const scheduledIds = new Set(
      scheduled.filter((i) => i.status === "scheduled").map((i) => i.contentItemId),
    );
    return approved.filter((item) => !scheduledIds.has(item.id));
  },

  async getContentSchedulePlan(contentItemId: string) {
    const settings = calendarRepository.getSettings();
    const contentItem = await contentRepository.getContentById(contentItemId);
    if (!contentItem) throw new Error("Content not found");

    const fullArticleAt = new Date().toISOString();
    const pkg = createPublicationPackageSchedule(
      contentItemId,
      fullArticleAt,
      settings.externalTeaserDelayHours,
    );

    return {
      contentItemId,
      fullArticleAt: pkg.fullArticleAt,
      teasers: pkg.teasers,
    };
  },
};
