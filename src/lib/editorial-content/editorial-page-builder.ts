import type { EditorialContentItem, EditorialContentQueueItem } from "@/types/editorial-content";
import { getEditorialAuthorById } from "@/data/editorial-authors";
import { getEditorialRubricById } from "@/data/editorial-rubrics";
import {
  editorialContentInitialQueue,
  getEditorialQueueItemBySlug,
} from "@/data/editorial-content-initial-queue";
import {
  requiresFactCheck,
  requiresFictionNotice,
} from "@/data/editorial-ethics-rules";
import { buildEditorialCta } from "@/lib/editorial-content/editorial-cta";
import { resolveEditorialIndexing } from "@/lib/editorial-content/editorial-metadata";
import { buildEditorialRelatedLinks } from "@/lib/editorial-content/editorial-related-links";
import { calculateEditorialContentQualityScore } from "@/lib/editorial-content/editorial-quality-rules";
import { buildEditorialSchema } from "@/lib/editorial-content/editorial-schema";
import { isEditorialContentTeaserReady, suggestTeaserStyle } from "@/lib/editorial-content/editorial-teaser-readiness";

function estimateReadTime(text: string): number {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(3, Math.ceil(words / 200));
}

function buildPlaceholderContent(
  item: EditorialContentQueueItem,
  rubricTitle: string,
): EditorialContentItem["content"] {
  return {
    intro: `Материал «${item.h1}» — редакционный сценарий по теме «${rubricTitle}». Это черновик для будущей публикации после ручной проверки.`,
    hook: `Представьте типичную ситуацию: семья выбирает дом и сталкивается с вопросом «${item.targetKeyword ?? item.title}». Ниже — разбор без выдачи за реальный кейс.`,
    situation: "Семья планирует загородное строительство в Иркутской области и собирает вводные по участку, бюджету и проекту.",
    conflict: "На бумаге всё выглядит просто, но при сравнении вариантов появляются скрытые расхождения в смете, логистике и комплектации.",
    turningPoint: "Когда сравнили проект, участок и предварительный расчёт в одной таблице, стало ясно, что решение нужно принимать комплексно.",
    takeaways: [
      "Сначала соберите вводные по участку и семье",
      "Сравнивайте сметы с одинаковой комплектацией",
      "Проверьте логистику и сезонность стройки",
    ],
    practicalAdvice: [
      "Зафиксируйте приоритеты: площадь, этажность, бюджет",
      "Свяжите проект с реальными ограничениями участка",
    ],
    conclusion: "Следующий шаг — уточнить вводные и получить предварительный разбор под ваш случай.",
  };
}

export function buildEditorialContentFromQueue(
  item: EditorialContentQueueItem,
): EditorialContentItem {
  const rubric = getEditorialRubricById(item.rubricId);
  const author = getEditorialAuthorById(item.authorId);
  if (!rubric) throw new Error(`Invalid editorial queue item: ${item.id}`);

  const content = buildPlaceholderContent(item, rubric.title);
  const cta = buildEditorialCta(item);
  const related = buildEditorialRelatedLinks(item);

  const fictionRequired = requiresFictionNotice(item);
  const sourceRequired =
    item.sourceRequired ?? rubric.indexingPolicy.requiresSource ?? false;

  const fullText = [
    content.intro,
    content.hook,
    content.situation,
    content.conflict,
    ...(content.takeaways ?? []),
  ].join(" ");

  const editorialItem: EditorialContentItem = {
    id: item.id,
    slug: item.slug,
    url: `/blog/${item.slug}`,
    type: item.type,
    rubricId: item.rubricId,
    authorId: item.authorId,
    title: item.title,
    h1: item.h1,
    seoTitle: `${item.h1} — редакция СтройСтрой`,
    seoDescription: `${rubric.description} Материал для подготовки к строительству; не является отзывом клиента.`,
    targetKeyword: item.targetKeyword,
    status: item.status,
    readTimeMinutes: estimateReadTime(fullText),
    storyMeta: {
      isFictionalized: fictionRequired,
      isBasedOnRealClient: false,
      hasClientPermission: false,
      isCompositeScenario: item.isCompositeScenario ?? fictionRequired,
      fictionNoticeRequired: fictionRequired,
      sourceRequired,
      factCheckStatus: sourceRequired ? "pending" : undefined,
    },
    content,
    related,
    cta,
    faq: [
      {
        question: `Это реальная история клиента?`,
        answer:
          "Нет. Материал является редакционным сценарием по мотивам типовых вопросов и не описывает конкретного клиента или построенный объект.",
      },
    ],
    blocks: [
      "breadcrumbs",
      "hero",
      "fiction-notice",
      "hook",
      "story",
      "takeaways",
      "related-technical",
      "related-projects",
      "lead-magnet",
      "cta",
      "faq",
      "lead-form",
    ],
    indexing: { indexable: false, sitemap: false },
    distribution: {
      teaserReady: false,
      allowExternalTeasers: false,
      platforms: [],
      canonicalFullArticleUrl: `https://stroistroy.ru/blog/${item.slug}`,
      utmCampaignId: `editorial-${item.rubricId}`,
      teaserStyle: suggestTeaserStyle({
        type: item.type,
        rubricId: item.rubricId,
        authorId: item.authorId,
      } as EditorialContentItem),
    },
    quality: {
      requiresHumanReview: rubric.indexingPolicy.requiresHumanReview,
      requiresFactCheck: requiresFactCheck({
        type: item.type,
        rubricId: item.rubricId,
        storyMeta: {
          isFictionalized: fictionRequired,
          isBasedOnRealClient: false,
          hasClientPermission: false,
          isCompositeScenario: item.isCompositeScenario ?? fictionRequired,
          fictionNoticeRequired: fictionRequired,
          sourceRequired,
        },
      }),
      requiresFictionNotice: fictionRequired,
      hasClearCTA: true,
      hasRelatedLinks: related.technicalArticles.length + related.projectCategories.length > 0,
      fakeClaimRisk: fictionRequired ? "low" : "medium",
      thinContentRisk: item.status === "planned" ? "high" : "medium",
      clickbaitRisk: "low",
    },
    createdAt: "2026-06-05",
    updatedAt: "2026-06-05",
  };

  const qualityScore = calculateEditorialContentQualityScore(editorialItem);
  editorialItem.indexing = resolveEditorialIndexing(editorialItem, qualityScore);
  editorialItem.schema = buildEditorialSchema(editorialItem, author);
  editorialItem.distribution.teaserReady = isEditorialContentTeaserReady(editorialItem);

  return editorialItem;
}

export function getEditorialContentBySlug(slug: string): EditorialContentItem | null {
  const item = getEditorialQueueItemBySlug(slug);
  if (!item) return null;
  return buildEditorialContentFromQueue(item);
}

export function getAllEditorialContentSlugs(): string[] {
  return editorialContentInitialQueue.map((q) => q.slug);
}

export function getAllEditorialContent(): EditorialContentItem[] {
  return editorialContentInitialQueue.map(buildEditorialContentFromQueue);
}
