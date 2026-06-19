import { calendarRepository } from "@/lib/content-calendar/calendar-repository";
import { scheduleService } from "@/lib/content-calendar/schedule-service";
import { buildDailyPublicationSlots, buildWeeklyPublicationSlots } from "@/lib/content-calendar/publication-slot-builder";
import { recommendPublicationDates, recommendNextAvailableSlot } from "@/lib/content-calendar/recommended-date-engine";
import { getContentReadiness } from "@/lib/content-calendar/content-readiness";
import { contentRepository } from "@/lib/content-cms/content-repository";
import { checkCapacity } from "@/lib/content-calendar/capacity-checker";
import { checkBalance } from "@/lib/content-calendar/balance-checker";
import { getCapacityRulesForMode } from "@/lib/content-calendar/capacity-checker";
import { getBalanceRules } from "@/lib/content-calendar/balance-checker";

export const calendarService = {
  async getDashboardData(date?: string) {
    const targetDate = date ?? new Date().toISOString().slice(0, 10);
    const settings = calendarRepository.getSettings();
    const metrics = await calendarRepository.getMetrics();
    const scheduled = await scheduleService.getScheduledContent(targetDate, targetDate);
    const slots = buildDailyPublicationSlots(targetDate, settings.mode);
    const unscheduled = await scheduleService.getUnscheduledApprovedContent();

    const unscheduledWithReadiness = await Promise.all(
      unscheduled.slice(0, 20).map(async (item) => ({
        item,
        readiness: await getContentReadiness(item),
        recommended: await recommendNextAvailableSlot(item, settings.mode),
      })),
    );

    metrics.unscheduledApproved = unscheduled.length;

    return {
      settings,
      metrics,
      scheduled,
      slots,
      unscheduled: unscheduledWithReadiness,
      capacity: getCapacityRulesForMode(settings.mode),
      balanceRules: getBalanceRules(),
    };
  },

  async getWeekData(startDate: string) {
    const settings = calendarRepository.getSettings();
    const end = new Date(startDate);
    end.setDate(end.getDate() + 6);
    const scheduled = await scheduleService.getScheduledContent(
      startDate,
      end.toISOString().slice(0, 10),
    );
    const slots = buildWeeklyPublicationSlots(startDate, settings.mode);
    return { settings, scheduled, slots };
  },

  async getMonthData(year: number, month: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);
    const scheduled = await scheduleService.getScheduledContent(
      start.toISOString().slice(0, 10),
      end.toISOString().slice(0, 10),
    );
    return { scheduled };
  },

  async getQueueData() {
    const settings = calendarRepository.getSettings();
    const unscheduled = await scheduleService.getUnscheduledApprovedContent();
    const queue = await Promise.all(
      unscheduled.map(async (item) => {
        const readiness = await getContentReadiness(item);
        const recommended = recommendPublicationDates(item, { mode: settings.mode, count: 1 })[0];
        return { item, readiness, recommended };
      }),
    );
    queue.sort((a, b) => {
      const pa = a.item.seo.priority ?? "P5";
      const pb = b.item.seo.priority ?? "P5";
      return pa.localeCompare(pb);
    });
    return { settings, queue };
  },

  async checkDayCapacity(date: string) {
    const settings = calendarRepository.getSettings();
    const scheduled = await calendarRepository.list();
    return checkCapacity(scheduled, date, "technical-article", "site-full-article", settings.mode);
  },

  async checkDayBalance(date: string, contentKind: string) {
    const scheduled = await calendarRepository.list();
    return checkBalance(scheduled, date, contentKind);
  },

  updateSettings(patch: Parameters<typeof calendarRepository.updateSettings>[0]) {
    return calendarRepository.updateSettings(patch);
  },

  getSettings() {
    return calendarRepository.getSettings();
  },
};
