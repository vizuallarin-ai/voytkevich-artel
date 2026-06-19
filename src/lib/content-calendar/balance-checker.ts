import type { ContentCalendarItem } from "@/types/content-calendar";
import type { ContentBalanceRule } from "@/types/content-scheduling";
import { contentBalanceRules } from "@/data/content-balance-rules";

export type BalanceCheckResult = {
  passed: boolean;
  warnings: string[];
  blockers: string[];
  triggeredRules: string[];
};

function filterByPeriod(items: ContentCalendarItem[], date: string, period: "day" | "week" | "month") {
  const target = new Date(date);
  return items.filter((i) => {
    const d = new Date(i.scheduledAt);
    if (period === "day") return d.toDateString() === target.toDateString();
    if (period === "week") {
      const diff = Math.abs(d.getTime() - target.getTime());
      return diff < 7 * 86400000;
    }
    return d.getMonth() === target.getMonth() && d.getFullYear() === target.getFullYear();
  });
}

export function checkBalance(
  scheduledItems: ContentCalendarItem[],
  targetDate: string,
  contentKind: string,
  clusterId?: string,
): BalanceCheckResult {
  const warnings: string[] = [];
  const blockers: string[] = [];
  const triggeredRules: string[] = [];

  for (const rule of contentBalanceRules) {
    const periodItems = filterByPeriod(
      scheduledItems.filter((i) => i.status === "scheduled"),
      targetDate,
      rule.period,
    );

    if (rule.id === "news-requires-source" && contentKind === "news") {
      triggeredRules.push(rule.id);
      continue;
    }

    if (rule.id === "no-cluster-streak" && clusterId) {
      const streak = countClusterStreak(scheduledItems, clusterId);
      if (streak >= 5) {
        triggeredRules.push(rule.id);
        if (rule.severity === "blocker") blockers.push(rule.title);
        else warnings.push(rule.title);
      }
      continue;
    }

    for (const limit of rule.limits) {
      if (limit.contentKind.startsWith("cluster")) continue;

      const kindCount = periodItems.filter((i) => i.contentKind === limit.contentKind).length;
      const total = periodItems.length || 1;

      if (limit.max !== undefined && limit.max < 1) {
        const ratio = kindCount / total;
        if (ratio > limit.max) {
          triggeredRules.push(rule.id);
          if (rule.severity === "blocker") blockers.push(rule.title);
          else warnings.push(rule.title);
        }
      }

      if (limit.max !== undefined && limit.max >= 1 && contentKind === limit.contentKind) {
        if (kindCount >= limit.max) {
          triggeredRules.push(rule.id);
          if (rule.severity === "blocker") blockers.push(rule.title);
          else warnings.push(rule.title);
        }
      }

      if (limit.min !== undefined && limit.min < 1) {
        const ratio = kindCount / total;
        if (ratio < limit.min && rule.period === "week") {
          triggeredRules.push(rule.id);
          warnings.push(rule.title);
        }
      }

      if (limit.min !== undefined && limit.min >= 1) {
        if (kindCount < limit.min && rule.period === "week") {
          triggeredRules.push(rule.id);
          warnings.push(rule.title);
        }
      }
    }
  }

  return { passed: blockers.length === 0, warnings, blockers, triggeredRules };
}

function countClusterStreak(items: ContentCalendarItem[], clusterId: string): number {
  const sorted = [...items]
    .filter((i) => i.status === "scheduled")
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  let streak = 0;
  for (const item of sorted.reverse()) {
    if (item.readiness.details.status === clusterId) streak++;
    else break;
  }
  return streak;
}

export function getBalanceRules(): ContentBalanceRule[] {
  return contentBalanceRules;
}
