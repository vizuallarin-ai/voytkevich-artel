import type {
  CalendarSettings,
  ContentCalendarItem,
  ContentCalendarMetrics,
  ContentScheduleMode,
} from "@/types/content-calendar";
import {
  DEFAULT_PUBLICATION_DAYS,
  DEFAULT_PUBLICATION_HOURS,
  DEFAULT_TIMEZONE,
} from "@/data/content-calendar-views";
import { getCapacityRules } from "@/data/content-capacity-rules";

const calendarItems = new Map<string, ContentCalendarItem>();

let settings: CalendarSettings = {
  mode: "cautious",
  timezone: DEFAULT_TIMEZONE,
  maxSitePublicationsPerDay: getCapacityRules("cautious").maxSitePublicationsPerDay,
  maxExternalPublicationsPerDay: getCapacityRules("cautious").maxExternalPublicationsPerDay,
  allowedPublicationDays: [...DEFAULT_PUBLICATION_DAYS],
  preferredPublicationHours: [...DEFAULT_PUBLICATION_HOURS],
  aggressiveModeConfirmed: false,
  manualApprovalRequired: true,
  externalTeaserDelayHours: 2,
  defaultPlatforms: ["telegram", "vk"],
};

export const calendarRepository = {
  async list(): Promise<ContentCalendarItem[]> {
    return [...calendarItems.values()].sort(
      (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    );
  },

  async getById(id: string): Promise<ContentCalendarItem | null> {
    return calendarItems.get(id) ?? null;
  },

  async save(item: ContentCalendarItem): Promise<ContentCalendarItem> {
    calendarItems.set(item.id, { ...item, updatedAt: new Date().toISOString() });
    return calendarItems.get(item.id)!;
  },

  async delete(id: string): Promise<void> {
    calendarItems.delete(id);
  },

  async getByContentItemId(contentItemId: string): Promise<ContentCalendarItem[]> {
    return [...calendarItems.values()].filter((i) => i.contentItemId === contentItemId);
  },

  async getByDateRange(start: string, end: string): Promise<ContentCalendarItem[]> {
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    return [...calendarItems.values()].filter((i) => {
      const t = new Date(i.scheduledAt).getTime();
      return t >= s && t <= e;
    });
  },

  getSettings(): CalendarSettings {
    return { ...settings };
  },

  updateSettings(patch: Partial<CalendarSettings>): CalendarSettings {
    if (patch.mode === "aggressive" && !patch.aggressiveModeConfirmed && !settings.aggressiveModeConfirmed) {
      throw new Error("Агрессивный режим требует подтверждения");
    }
    settings = { ...settings, ...patch };
    if (patch.mode && patch.mode !== "manual") {
      const cap = getCapacityRules(patch.mode);
      settings.maxSitePublicationsPerDay = cap.maxSitePublicationsPerDay;
      settings.maxExternalPublicationsPerDay = cap.maxExternalPublicationsPerDay;
    }
    return { ...settings };
  },

  async getMetrics(): Promise<ContentCalendarMetrics> {
    const all = await this.list();
    const today = new Date().toISOString().slice(0, 10);
    const todayItems = all.filter(
      (i) => i.scheduledAt.slice(0, 10) === today && i.status === "scheduled",
    );
    return {
      totalScheduled: all.filter((i) => i.status === "scheduled").length,
      totalPublished: all.filter((i) => i.status === "published").length,
      unscheduledApproved: 0,
      todaySiteCount: todayItems.filter((i) => i.publicationType === "site-full-article").length,
      todayExternalCount: todayItems.filter((i) => i.publicationType === "external-teaser").length,
      capacityWarning: todayItems.length >= settings.maxSitePublicationsPerDay * 0.8,
      balanceWarnings: 0,
      blockersCount: all.reduce((n, i) => n + i.blockers.length, 0),
    };
  },
};

export function getScheduleMode(): ContentScheduleMode {
  return settings.mode;
}
