import type { ProgrammaticPageTemplate } from "@/types/programmatic-page-template";

const baseBlocks = {
  required: [
    "breadcrumbs",
    "hero",
    "intro",
    "project-grid",
    "cta",
    "faq",
    "final-form",
    "schema",
  ] as const,
  optional: [
    "filters",
    "cost-factors",
    "who-it-fits",
    "how-to-choose",
    "lead-magnet",
    "related-pages",
    "related-articles",
    "seo-text",
  ] as const,
};

const defaultSeoRules = {
  indexableByDefault: false,
  requiresUniqueIntro: true,
  requiresFAQ: true,
  requiresSEOText: true,
  requiresCanonicalCheck: true,
  requiresHumanReview: true,
};

export const programmaticPageTemplates: ProgrammaticPageTemplate[] = [
  {
    id: "object-category",
    title: "Категория объекта",
    type: "object-category",
    description: "Проекты домов / бань / коттеджей",
    allowedPageTypes: ["project-category"],
    requiredBlocks: [...baseBlocks.required, "filters", "related-pages"],
    optionalBlocks: [...baseBlocks.optional, "lead-magnet"],
    defaultCTA: {
      primary: "Подобрать проект под участок",
      secondary: "Рассчитать стоимость дома",
    },
    defaultLeadMagnet: "project-selection-checklist",
    projectMatchingRules: {
      objectTypeRequired: true,
      minProjectsCount: 1,
      fallbackStrategy: "show-related",
    },
    seoRules: defaultSeoRules,
    analytics: { pageType: "programmatic-category", defaultEventName: "programmatic_page_viewed" },
  },
  {
    id: "material-page",
    title: "Материал",
    type: "material-page",
    description: "Каркас, брус, газобетон и др.",
    allowedPageTypes: ["project-material-page"],
    requiredBlocks: [...baseBlocks.required, "who-it-fits", "cost-factors", "related-pages"],
    optionalBlocks: [...baseBlocks.optional],
    defaultCTA: {
      primary: "Рассчитать стоимость",
      secondary: "Получить сравнение материалов",
    },
    defaultLeadMagnet: "material-comparison",
    projectMatchingRules: {
      objectTypeRequired: true,
      materialRequired: true,
      minProjectsCount: 1,
      fallbackStrategy: "show-broader-category",
    },
    seoRules: defaultSeoRules,
    analytics: { pageType: "programmatic-material", defaultEventName: "programmatic_page_viewed" },
  },
  {
    id: "size-page",
    title: "Типоразмер",
    type: "size-page",
    description: "Дом 8×10, баня 3×3 и др.",
    allowedPageTypes: ["project-size-page"],
    requiredBlocks: [...baseBlocks.required, "how-to-choose", "cost-factors", "related-pages"],
    optionalBlocks: [...baseBlocks.optional],
    defaultCTA: { primary: "Получить расчёт", secondary: "Смотреть похожие проекты" },
    defaultLeadMagnet: "estimate-example",
    projectMatchingRules: {
      objectTypeRequired: true,
      sizeRequired: true,
      minProjectsCount: 1,
      fallbackStrategy: "show-related",
    },
    seoRules: defaultSeoRules,
    analytics: { pageType: "programmatic-size", defaultEventName: "programmatic_page_viewed" },
  },
  {
    id: "area-page",
    title: "Площадь",
    type: "area-page",
    description: "Дома 100–150 м² и др.",
    allowedPageTypes: ["project-size-page"],
    requiredBlocks: [...baseBlocks.required, "who-it-fits", "related-pages"],
    optionalBlocks: [...baseBlocks.optional],
    defaultCTA: { primary: "Подобрать проект по площади", secondary: "Рассчитать стоимость" },
    defaultLeadMagnet: "estimate-example",
    projectMatchingRules: {
      objectTypeRequired: true,
      sizeRequired: true,
      minProjectsCount: 1,
      fallbackStrategy: "show-related",
    },
    seoRules: defaultSeoRules,
    analytics: { pageType: "programmatic-area", defaultEventName: "programmatic_page_viewed" },
  },
  {
    id: "floors-page",
    title: "Этажность",
    type: "floors-page",
    description: "Одно- и двухэтажные дома",
    allowedPageTypes: ["project-size-page"],
    requiredBlocks: [...baseBlocks.required, "how-to-choose", "related-pages"],
    optionalBlocks: [...baseBlocks.optional],
    defaultCTA: { primary: "Подобрать дом по этажности", secondary: "Рассчитать стоимость" },
    projectMatchingRules: {
      objectTypeRequired: true,
      sizeRequired: true,
      minProjectsCount: 1,
      fallbackStrategy: "show-broader-category",
    },
    seoRules: defaultSeoRules,
    analytics: { pageType: "programmatic-floors", defaultEventName: "programmatic_page_viewed" },
  },
  {
    id: "feature-page",
    title: "Особенность",
    type: "feature-page",
    description: "Терраса, гараж, спальни",
    allowedPageTypes: ["project-feature-page"],
    requiredBlocks: [...baseBlocks.required, "who-it-fits", "related-pages"],
    optionalBlocks: [...baseBlocks.optional],
    defaultCTA: { primary: "Подобрать проект с нужной особенностью" },
    defaultLeadMagnet: "land-checklist",
    projectMatchingRules: {
      objectTypeRequired: true,
      featureRequired: true,
      minProjectsCount: 1,
      fallbackStrategy: "show-related",
    },
    seoRules: defaultSeoRules,
    analytics: { pageType: "programmatic-feature", defaultEventName: "programmatic_page_viewed" },
  },
  {
    id: "location-page",
    title: "География",
    type: "location-page",
    description: "Строительство в локации",
    allowedPageTypes: ["project-location-page"],
    requiredBlocks: [...baseBlocks.required, "cost-factors", "lead-magnet", "related-pages"],
    optionalBlocks: [...baseBlocks.optional],
    defaultCTA: {
      primary: "Обсудить строительство в этой локации",
      secondary: "Получить чек-лист участка",
    },
    defaultLeadMagnet: "land-checklist",
    projectMatchingRules: {
      objectTypeRequired: true,
      regionRequired: true,
      minProjectsCount: 0,
      fallbackStrategy: "show-empty-state",
    },
    seoRules: { ...defaultSeoRules, requiresHumanReview: true },
    analytics: { pageType: "programmatic-location", defaultEventName: "programmatic_page_viewed" },
  },
  {
    id: "combination-page",
    title: "Комбинация",
    type: "combination-page",
    description: "Материал + размер + geo",
    allowedPageTypes: ["project-combination-page"],
    requiredBlocks: [...baseBlocks.required, "cost-factors", "related-pages"],
    optionalBlocks: [...baseBlocks.optional],
    defaultCTA: { primary: "Получить расчёт под мой участок", secondary: "Подобрать проект" },
    defaultLeadMagnet: "estimate-example",
    projectMatchingRules: {
      objectTypeRequired: true,
      minProjectsCount: 1,
      fallbackStrategy: "noindex",
    },
    seoRules: {
      ...defaultSeoRules,
      indexableByDefault: false,
      requiresHumanReview: true,
    },
    analytics: { pageType: "programmatic-combination", defaultEventName: "programmatic_page_viewed" },
  },
];

export function getProgrammaticTemplateByType(
  type: ProgrammaticPageTemplate["type"],
): ProgrammaticPageTemplate | undefined {
  return programmaticPageTemplates.find((t) => t.type === type);
}

export function getProgrammaticTemplateById(id: string): ProgrammaticPageTemplate | undefined {
  return programmaticPageTemplates.find((t) => t.id === id);
}
