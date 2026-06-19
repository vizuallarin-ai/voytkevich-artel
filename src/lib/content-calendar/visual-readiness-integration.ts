import type { CMSContentItem } from "@/types/content-cms";
import { checkContentVisualCompleteness } from "@/lib/visual-content/image-cms-integration";

export async function getVisualReadinessForSchedule(contentItem: CMSContentItem) {
  const completeness = await checkContentVisualCompleteness(contentItem);
  const needsCover = contentItem.indexing.indexable || contentItem.status === "approved";

  const blockers = [...completeness.blockers];
  const warnings = [...completeness.warnings];

  if (needsCover && !completeness.hasCover) {
    blockers.push("Отсутствует approved cover");
  }
  if (!completeness.hasOg) {
    warnings.push("Отсутствует OG image");
  }
  if (contentItem.distribution.teaserReady && !completeness.hasSocialTeaser) {
    warnings.push("Отсутствует social teaser image");
  }
  if (!completeness.hasAlt && completeness.hasCover) {
    blockers.push("Cover без alt");
  }

  return {
    ready: blockers.length === 0,
    blockers,
    warnings,
    details: {
      hasCover: completeness.hasCover,
      hasOGImage: completeness.hasOg,
      hasSocialTeaser: completeness.hasSocialTeaser,
      hasAlt: completeness.hasAlt,
    },
  };
}

export async function getMissingVisualsForSchedule(contentItem: CMSContentItem): Promise<string[]> {
  const r = await getVisualReadinessForSchedule(contentItem);
  const missing: string[] = [];
  if (!r.details.hasCover) missing.push("cover");
  if (!r.details.hasOGImage) missing.push("og-image");
  if (contentItem.distribution.teaserReady && !r.details.hasSocialTeaser) missing.push("social-teaser");
  if (!r.details.hasAlt) missing.push("alt-text");
  return missing;
}

export async function validateVisualsBeforeSchedule(contentItem: CMSContentItem) {
  return getVisualReadinessForSchedule(contentItem);
}

export function suggestVisualTasks(contentItem: CMSContentItem): string[] {
  const tasks: string[] = [];
  if (contentItem.indexing.indexable) {
    tasks.push("Создать/approve cover 16:9");
    tasks.push("Добавить OG image");
  }
  if (contentItem.distribution.allowExternalTeasers) {
    tasks.push("Подготовить social teaser 1:1");
  }
  if (contentItem.kind === "technical-article") {
    tasks.push("Рассмотреть diagram/схему");
  }
  return tasks;
}
