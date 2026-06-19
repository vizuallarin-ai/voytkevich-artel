import type { CMSContentItem } from "@/types/content-cms";
import type { ContentCalendarItem } from "@/types/content-calendar";
import type { ScheduleOptions, ScheduleValidationResult } from "@/types/content-scheduling";
import { getContentReadiness } from "@/lib/content-calendar/content-readiness";
import { checkCapacity } from "@/lib/content-calendar/capacity-checker";
import { checkBalance } from "@/lib/content-calendar/balance-checker";
import { contentScheduleRules } from "@/data/content-schedule-rules";
import { calendarRepository } from "@/lib/content-calendar/calendar-repository";

export async function validateSchedule(
  contentItem: CMSContentItem,
  scheduledAt: string,
  options: ScheduleOptions,
  mode: Parameters<typeof checkCapacity>[4],
): Promise<ScheduleValidationResult> {
  const warnings: string[] = [];
  const blockers: string[] = [];

  const readiness = await getContentReadiness(contentItem);
  if (!readiness.canSchedule && !options.forceWithWarnings) {
    blockers.push(...readiness.blockers);
  }
  warnings.push(...readiness.warnings);

  const noDraftScheduled = !contentScheduleRules.blockedStatuses.includes(
    contentItem.status as (typeof contentScheduleRules.blockedStatuses)[number],
  );
  const noAIGeneratedScheduled = contentItem.status !== "ai-generated";

  if (!noDraftScheduled) blockers.push("Draft/review статус нельзя планировать");
  if (!noAIGeneratedScheduled) blockers.push("AI-generated без review");

  const publicationType = options.publicationType ?? "site-full-article";
  const scheduled = await calendarRepository.list();
  const capacity = checkCapacity(scheduled, scheduledAt, contentItem.kind, publicationType, mode);
  if (!capacity.passed) blockers.push(...capacity.blockers);
  warnings.push(...capacity.warnings);

  const balance = checkBalance(scheduled, scheduledAt, contentItem.kind, contentItem.clusterId);
  if (!balance.passed) blockers.push(...balance.blockers);
  warnings.push(...balance.warnings);

  let fullArticleBeforeTeaser = true;
  if (publicationType === "external-teaser") {
    const fullArticle = scheduled.find(
      (i) =>
        i.contentItemId === contentItem.id &&
        i.publicationType === "site-full-article" &&
        i.status === "scheduled",
    );
    const fullPublished = contentItem.status === "published";

    if (fullPublished) {
      fullArticleBeforeTeaser = true;
    } else if (fullArticle) {
      if (new Date(scheduledAt) < new Date(fullArticle.scheduledAt)) {
        blockers.push("Teaser раньше full article");
        fullArticleBeforeTeaser = false;
      }
    } else {
      blockers.push("Teaser нельзя планировать без scheduled/published full article");
      fullArticleBeforeTeaser = false;
    }
  }

  const noMissingVisuals = readiness.visualReady;
  if (!noMissingVisuals) {
    if (contentItem.indexing.indexable) blockers.push("Visual readiness не пройден");
    else warnings.push("Visual assets неполные");
  }

  const noMissingUTM =
    publicationType !== "external-teaser" || readiness.distributionReady;
  if (!noMissingUTM) blockers.push("External teaser без UTM");

  const valid = blockers.length === 0;
  const canSchedule = valid || (options.forceWithWarnings === true && warnings.length > 0);

  return {
    valid,
    warnings,
    blockers,
    flags: {
      readinessPassed: readiness.canSchedule,
      capacityPassed: capacity.passed,
      balancePassed: balance.passed,
      fullArticleBeforeTeaser,
      noDraftScheduled,
      noAIGeneratedScheduled,
      noMissingVisuals,
      noMissingUTM,
    },
    canSchedule,
  };
}

export async function validateReschedule(
  item: ContentCalendarItem,
  newScheduledAt: string,
  contentItem: CMSContentItem,
  mode: Parameters<typeof checkCapacity>[4],
): Promise<ScheduleValidationResult> {
  return validateSchedule(
    contentItem,
    newScheduledAt,
    { publicationType: item.publicationType, platformId: item.platformId },
    mode,
  );
}
