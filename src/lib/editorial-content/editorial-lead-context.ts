import type { EditorialContentItem, EditorialLeadContext } from "@/types/editorial-content";
import { getEditorialRubricById } from "@/data/editorial-rubrics";

export function buildEditorialLeadContext(
  item: EditorialContentItem,
  sourceCTA: string,
  sourceSection?: string,
): EditorialLeadContext {
  const rubric = getEditorialRubricById(item.rubricId);

  return {
    pageType: "editorial-content",
    contentSlug: item.slug,
    contentTitle: item.h1,
    contentType: item.type,
    rubricId: item.rubricId,
    authorId: item.authorId,
    currentUrl: item.url,
    isFictionalized: item.storyMeta.isFictionalized,
    isCompositeScenario: item.storyMeta.isCompositeScenario,
    sourceCTA,
    sourceSection,
    leadMagnetId: item.cta.leadMagnetId,
    relatedProjectCategory: item.related.projectCategories[0],
    relatedTechnicalCluster: rubric?.relatedTechnicalClusters[0],
    utm: {
      source: "editorial-blog",
      medium: "organic",
      campaign: item.distribution.utmCampaignId,
      content: item.slug,
    },
  };
}

export function formatEditorialLeadSummary(ctx: EditorialLeadContext): string {
  const rubric = getEditorialRubricById(ctx.rubricId);
  const interest = rubric?.title ?? ctx.rubricId;

  const lines = [
    `Лид пришёл из редакционной истории «${ctx.contentTitle}».`,
    `Интерес: ${interest}.`,
    `CTA: «${ctx.sourceCTA}».`,
  ];

  if (ctx.isFictionalized || ctx.isCompositeScenario) {
    lines.push("Материал: собирательный редакционный сценарий (не реальный кейс).");
  }

  if (ctx.leadMagnetId) {
    lines.push(`Лид-магнит: ${ctx.leadMagnetId}.`);
  }

  lines.push(
    "Следующий шаг: уточнить участок, состав семьи, бюджет и желаемую планировку.",
  );

  return lines.join("\n");
}
