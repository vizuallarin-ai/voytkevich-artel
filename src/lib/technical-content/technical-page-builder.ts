import type { TechnicalArticle, TechnicalContentQueueItem } from "@/types/technical-content";
import { getTechnicalClusterById } from "@/data/technical-content-clusters";
import { getTechnicalTemplateByType } from "@/data/technical-article-templates";
import { resolveDisclaimerForCluster } from "@/data/technical-disclaimers";
import { getDefaultTechnicalAuthor, getTechnicalAuthorById } from "@/data/technical-authors";
import {
  technicalContentInitialQueue,
  getTechnicalQueueItemBySlug,
} from "@/data/technical-content-initial-queue";
import { buildTechnicalCta } from "@/lib/technical-content/technical-cta";
import { buildTechnicalFaq } from "@/lib/technical-content/technical-faq";
import { buildTechnicalRelatedLinks } from "@/lib/technical-content/technical-related-links";
import { resolveTechnicalIndexing } from "@/lib/technical-content/technical-metadata";
import { calculateTechnicalContentQualityScore } from "@/lib/technical-content/technical-quality-rules";
import { buildTechnicalSchema } from "@/lib/technical-content/technical-schema";

function estimateReadTime(text: string): number {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(3, Math.ceil(words / 200));
}

function buildPlaceholderContent(
  item: TechnicalContentQueueItem,
  clusterTitle: string,
): TechnicalArticle["content"] {
  const disclaimer = resolveDisclaimerForCluster(
    getTechnicalClusterById(item.clusterId)?.category ?? "future",
  );

  return {
    shortAnswer: `Краткий ответ по теме «${item.h1}»: решение зависит от проекта, участка, материалов и комплектации. Ниже — принципы и типовые ошибки; финальное решение — после разбора вводных со специалистом.`,
    disclaimerId: disclaimer.id,
    intro: `Вопрос «${item.targetKeyword}» часто возникает на этапе выбора проекта и подготовки строительства. Материал объясняет принципы по теме «${clusterTitle}» без замены проектного и инженерного расчёта.`,
    whereUsed: "Тема актуальна при выборе проекта, согласовании комплектации и подготовке участка к строительству в Иркутской области.",
    howItWorks: "На практике решение складывается из проекта, грунта, климата, материалов и выбранной комплектации. Универсального ответа без вводных не существует.",
    howUsuallyDone: "Обычно сначала собирают вводные по участку и проекту, затем согласуют конструктив и комплектацию, после чего готовят предварительный расчёт.",
    materials: ["Зависят от выбранной технологии и проекта", "Подбираются под климат и режим эксплуатации"],
    steps: [
      "Собрать вводные: проект, участок, бюджет, сроки",
      "Уточнить ограничения и риски",
      "Согласовать комплектацию",
      "Получить предварительный расчёт",
    ],
    mistakes: [
      "Принимать решение без анализа участка и грунта",
      "Сравнивать предложения с разной комплектацией",
      "Ориентироваться только на цену коробки без инженерии и отделки",
    ],
    risks: ["Переделки", "Рост сметы", "Срыв сроков"],
    whenToCallExpert: [
      "Нужен расчёт под конкретный проект и участок",
      "Есть нестандартный рельеф или грунт",
      "Требуется сравнение технологий под ваш бюджет",
    ],
    exampleSituation: "Семья выбрала проект, но участок с уклоном и удалённым подъездом — без разбора этих факторов смета и сроки будут неточными.",
    checklist: [
      "Проект или ориентир по площади",
      "Участок: подъезд, грунт, коммуникации",
      "Желаемая комплектация",
      "Сроки и бюджет",
    ],
    costFactors: ["Участок и логистика", "Фундамент", "Материал", "Кровля", "Инженерия", "Отделка"],
    conclusion: "Следующий шаг — уточнить вводные и получить предварительный разбор под ваш случай.",
  };
}

export function buildTechnicalArticleFromQueue(item: TechnicalContentQueueItem): TechnicalArticle {
  const cluster = getTechnicalClusterById(item.clusterId);
  const template = getTechnicalTemplateByType(item.type);
  if (!cluster || !template) {
    throw new Error(`Invalid technical queue item: ${item.id}`);
  }

  const disclaimer = resolveDisclaimerForCluster(cluster.category);
  const content = buildPlaceholderContent(item, cluster.title);
  content.disclaimerId = template.defaultDisclaimerId === "estimate"
    ? "estimate"
    : template.defaultDisclaimerId === "foundation"
      ? "foundation"
      : disclaimer.id;

  const cta = buildTechnicalCta(item, cluster, template);
  const related = buildTechnicalRelatedLinks(item, cluster);
  const faq = buildTechnicalFaq(item, cluster);
  const author = item.authorId ? getTechnicalAuthorById(item.authorId) : getDefaultTechnicalAuthor();

  const fullText = [
    content.shortAnswer,
    content.intro,
    content.howItWorks,
    ...(content.mistakes ?? []),
    ...(content.whenToCallExpert ?? []),
  ].join(" ");

  const article: TechnicalArticle = {
    id: item.id,
    slug: item.slug,
    url: `/blog/${item.slug}`,
    type: item.type,
    clusterId: item.clusterId,
    title: item.title,
    h1: item.h1,
    seoTitle: `${item.h1} — разбор и чек-лист`,
    seoDescription: `${cluster.description} Материал для подготовки к строительству; не заменяет инженерный расчёт.`,
    targetKeyword: item.targetKeyword,
    secondaryKeywords: item.secondaryKeywords,
    status: item.status,
    authorId: author?.id,
    readTimeMinutes: estimateReadTime(fullText),
    content,
    related,
    cta,
    faq,
    blocks: [...template.requiredBlocks, ...template.optionalBlocks.filter((b) => b !== "schema")],
    indexing: { indexable: false, sitemap: false },
    distribution: {
      teaserReady: false,
      allowExternalTeasers: false,
      platforms: [],
      canonicalFullArticleUrl: `https://stroistroy.ru/blog/${item.slug}`,
      utmCampaignId: `technical-${item.clusterId}`,
    },
    quality: {
      requiresHumanReview: template.seoRules.requiresHumanReview,
      requiresTechnicalReview: cluster.requiresTechnicalReview,
      hasDisclaimer: true,
      hasFAQ: faq.length > 0,
      hasCTA: true,
      hasRelatedLinks: related.articles.length + related.programmaticPages.length > 0,
      dangerousInstructionRisk: cluster.requiresTechnicalReview ? "medium" : "low",
      thinContentRisk: item.status === "planned" ? "high" : "medium",
    },
    createdAt: "2026-06-05",
    updatedAt: "2026-06-05",
  };

  const qualityScore = calculateTechnicalContentQualityScore(article);
  article.indexing = resolveTechnicalIndexing(article, qualityScore);
  article.schema = buildTechnicalSchema(article, author);
  article.distribution.teaserReady = qualityScore.level === "strong" || qualityScore.level === "good";

  return article;
}

export function getTechnicalArticleBySlug(slug: string): TechnicalArticle | null {
  const item = getTechnicalQueueItemBySlug(slug);
  if (!item) return null;
  return buildTechnicalArticleFromQueue(item);
}

export function getAllTechnicalArticleSlugs(): string[] {
  return technicalContentInitialQueue.map((q) => q.slug);
}

export function getAllTechnicalArticles(): TechnicalArticle[] {
  return technicalContentInitialQueue.map(buildTechnicalArticleFromQueue);
}
