import type { ContentStatus } from "@/types/content-workflow";
import type { ProgrammaticPageType } from "@/types/programmatic-seo";
import type { SeoPageType } from "@/types/seo-architecture";
import type { ContentPriorityLevel } from "@/types/content-prioritization";
import type { IndexabilityReason } from "@/types/seo-indexation";
import type { CrawlPriorityLevel } from "@/types/crawl-budget";
import { seoPageTypes } from "@/data/seo-page-types";

export type RobotsDirective = {
  index: boolean;
  follow: boolean;
};

export type CmsStatusIndexationRule = {
  status: ContentStatus;
  indexable: boolean;
  sitemap: boolean;
  reason?: IndexabilityReason;
  message: string;
};

export type PageTypeIndexationRule = {
  pageType: ProgrammaticPageType | SeoPageType;
  indexableByDefault: boolean;
  sitemapByDefault: boolean;
  requiresApproval: boolean;
  requiresKeywordValidation?: boolean;
  reason?: IndexabilityReason;
  message: string;
};

export const defaultRobotsDirectives = {
  indexable: { index: true, follow: true },
  noindex: { index: false, follow: true },
  blocked: { index: false, follow: false },
  draft: { index: false, follow: false },
} as const satisfies Record<string, RobotsDirective>;

export const publishedIndexableStatuses: ContentStatus[] = [
  "approved",
  "scheduled",
  "published",
];

export const sitemapEligibleStatuses: ContentStatus[] = [
  "approved",
  "scheduled",
  "published",
];

export const cmsStatusNoindexRules: CmsStatusIndexationRule[] = [
  {
    status: "idea",
    indexable: false,
    sitemap: false,
    reason: "status-idea",
    message: "Идея не индексируется",
  },
  {
    status: "planned",
    indexable: false,
    sitemap: false,
    reason: "status-planned",
    message: "Запланированный материал не индексируется",
  },
  {
    status: "draft",
    indexable: false,
    sitemap: false,
    reason: "status-draft",
    message: "Черновик не индексируется",
  },
  {
    status: "ai-generated",
    indexable: false,
    sitemap: false,
    reason: "status-ai-generated",
    message: "AI-черновик требует review перед индексацией",
  },
  {
    status: "review",
    indexable: false,
    sitemap: false,
    reason: "status-review",
    message: "Материал на проверке не индексируется",
  },
  {
    status: "needs-source",
    indexable: false,
    sitemap: false,
    reason: "status-needs-source",
    message: "Нужен источник перед индексацией",
  },
  {
    status: "needs-fact-check",
    indexable: false,
    sitemap: false,
    reason: "status-needs-fact-check",
    message: "Нужен fact-check перед индексацией",
  },
  {
    status: "needs-expert-review",
    indexable: false,
    sitemap: false,
    reason: "status-needs-expert-review",
    message: "Нужна экспертная проверка перед индексацией",
  },
  {
    status: "needs-keyword-data",
    indexable: false,
    sitemap: false,
    reason: "status-needs-keyword-data",
    message: "Нужна семантика перед индексацией",
  },
  {
    status: "needs-project-data",
    indexable: false,
    sitemap: false,
    reason: "status-needs-project-data",
    message: "Нужны данные проектов перед индексацией",
  },
  {
    status: "rejected",
    indexable: false,
    sitemap: false,
    reason: "status-rejected",
    message: "Отклонённый материал не индексируется",
  },
  {
    status: "archived",
    indexable: false,
    sitemap: false,
    reason: "status-archived",
    message: "Архивный материал не индексируется",
  },
  {
    status: "noindex",
    indexable: false,
    sitemap: false,
    reason: "status-noindex",
    message: "Явный noindex в CMS",
  },
  {
    status: "needs-update",
    indexable: false,
    sitemap: false,
    reason: "status-needs-update",
    message: "Материал требует обновления перед индексацией",
  },
  {
    status: "approved",
    indexable: true,
    sitemap: true,
    reason: "approved-awaiting-publish",
    message: "Одобрено — может попасть в sitemap после публикации",
  },
  {
    status: "scheduled",
    indexable: true,
    sitemap: true,
    reason: "approved-awaiting-publish",
    message: "Запланировано к публикации — допускается в sitemap",
  },
  {
    status: "published",
    indexable: true,
    sitemap: true,
    reason: "published-ok",
    message: "Опубликовано — индексируется при прохождении quality gates",
  },
];

const staticPageTypeRules: PageTypeIndexationRule[] = [
  {
    pageType: "home",
    indexableByDefault: true,
    sitemapByDefault: true,
    requiresApproval: false,
    message: "Главная — core indexable",
  },
  {
    pageType: "catalog",
    indexableByDefault: true,
    sitemapByDefault: true,
    requiresApproval: false,
    message: "Каталог — core indexable",
  },
  {
    pageType: "service",
    indexableByDefault: true,
    sitemapByDefault: true,
    requiresApproval: false,
    message: "Коммерческие услуги — indexable",
  },
  {
    pageType: "category",
    indexableByDefault: true,
    sitemapByDefault: true,
    requiresApproval: false,
    message: "SEO-категории с контентом — indexable",
  },
  {
    pageType: "project",
    indexableByDefault: true,
    sitemapByDefault: true,
    requiresApproval: false,
    message: "Карточки проектов — indexable",
  },
  {
    pageType: "article",
    indexableByDefault: true,
    sitemapByDefault: true,
    requiresApproval: false,
    message: "Опубликованные статьи блога — indexable",
  },
  {
    pageType: "case",
    indexableByDefault: true,
    sitemapByDefault: true,
    requiresApproval: false,
    message: "Published-кейсы — indexable",
  },
  {
    pageType: "calculator",
    indexableByDefault: true,
    sitemapByDefault: true,
    requiresApproval: false,
    message: "Калькулятор — core indexable",
  },
  {
    pageType: "planner",
    indexableByDefault: true,
    sitemapByDefault: true,
    requiresApproval: false,
    message: "Планировщик — core indexable",
  },
  {
    pageType: "about",
    indexableByDefault: true,
    sitemapByDefault: true,
    requiresApproval: false,
    message: "О компании — indexable",
  },
  {
    pageType: "process",
    indexableByDefault: true,
    sitemapByDefault: true,
    requiresApproval: false,
    message: "Процесс строительства — indexable",
  },
  {
    pageType: "faq",
    indexableByDefault: true,
    sitemapByDefault: true,
    requiresApproval: false,
    message: "FAQ — indexable",
  },
];

const programmaticPageTypeRules: PageTypeIndexationRule[] = seoPageTypes.map((def) => ({
  pageType: def.pageType,
  indexableByDefault: def.indexableByDefault,
  sitemapByDefault: def.sitemapAllowed,
  requiresApproval: !def.indexableByDefault,
  requiresKeywordValidation: def.pageType === "project-location-page",
  reason: def.indexableByDefault ? undefined : "page-type-noindex-default",
  message: def.indexableByDefault
    ? `${def.title} — indexable by default`
    : `${def.title} — noindex until approved/review`,
}));

export const pageTypeIndexationRules: PageTypeIndexationRule[] = [
  ...staticPageTypeRules,
  ...programmaticPageTypeRules,
];

export const crawlPriorityByContentPriority: Record<ContentPriorityLevel, CrawlPriorityLevel> = {
  P1: "critical",
  P2: "high",
  P3: "medium",
  P4: "low",
  P5: "deferred",
};

export const sitemapPriorityByContentPriority: Record<ContentPriorityLevel, number> = {
  P1: 1.0,
  P2: 0.9,
  P3: 0.7,
  P4: 0.5,
  P5: 0.3,
};

export const cannibalizationBlockLevels = ["high"] as const;

export function getCmsStatusIndexationRule(
  status: ContentStatus,
): CmsStatusIndexationRule | undefined {
  return cmsStatusNoindexRules.find((rule) => rule.status === status);
}

export function getPageTypeIndexationRule(
  pageType: string,
): PageTypeIndexationRule | undefined {
  return pageTypeIndexationRules.find((rule) => rule.pageType === pageType);
}

export function getRobotsDirectiveForIndexable(indexable: boolean): RobotsDirective {
  return indexable ? defaultRobotsDirectives.indexable : defaultRobotsDirectives.noindex;
}
