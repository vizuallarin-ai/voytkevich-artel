import type { CMSContentItem } from "@/types/content-cms";
import { contentRepository } from "@/lib/content-cms/content-repository";
import { contentScheduleRules } from "@/data/content-schedule-rules";

export async function markCMSContentAsScheduled(
  contentItemId: string,
  scheduledAt: string,
): Promise<CMSContentItem | null> {
  const item = await contentRepository.getContentById(contentItemId);
  if (!item) return null;

  const check = preventInvalidCMSStatusSchedule(item);
  if (!check.ok) throw new Error(check.reason);

  return contentRepository.updateContent(contentItemId, {
    status: "scheduled",
    workflow: {
      ...item.workflow,
      scheduledAt,
      updatedAt: new Date().toISOString(),
    },
  });
}

export async function markCMSContentAsPublished(
  contentItemId: string,
  publishedAt: string,
): Promise<CMSContentItem | null> {
  const item = await contentRepository.getContentById(contentItemId);
  if (!item) return null;

  return contentRepository.updateContent(contentItemId, {
    status: "published",
    workflow: {
      ...item.workflow,
      publishedAt,
      updatedAt: new Date().toISOString(),
    },
  });
}

export async function syncCalendarStatusWithCMS(contentItemId: string): Promise<string | null> {
  const item = await contentRepository.getContentById(contentItemId);
  return item?.status ?? null;
}

export function preventInvalidCMSStatusSchedule(item: CMSContentItem): { ok: boolean; reason?: string } {
  if (
    contentScheduleRules.blockedStatuses.includes(
      item.status as (typeof contentScheduleRules.blockedStatuses)[number],
    )
  ) {
    return { ok: false, reason: `Статус ${item.status} нельзя планировать` };
  }

  if (!contentScheduleRules.schedulableStatuses.includes(item.status as "approved" | "scheduled")) {
    return { ok: false, reason: "Материал должен быть approved" };
  }

  if (item.status === "noindex" && item.indexing.indexable) {
    return { ok: false, reason: "Конфликт noindex и indexable" };
  }

  return { ok: true };
}
