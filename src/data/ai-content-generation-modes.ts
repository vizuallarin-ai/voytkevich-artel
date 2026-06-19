import type { AIContentGenerationMode } from "@/types/ai-content-factory";

export type AIContentGenerationModeMeta = {
  id: AIContentGenerationMode;
  label: string;
  description: string;
  requiresSource?: boolean;
  requiresExpertReview?: boolean;
  contentKind:
    | "programmatic-page"
    | "technical-article"
    | "editorial-content"
    | "news"
    | "digest"
    | "partial";
};

export const AI_CONTENT_GENERATION_MODES: AIContentGenerationModeMeta[] = [
  {
    id: "content-brief",
    label: "Content brief",
    description: "Структура, интент, CTA и риски до полного черновика",
    contentKind: "partial",
  },
  {
    id: "programmatic-page-draft",
    label: "Программируемая SEO-страница",
    description: "Черновик комбинационной страницы каталога",
    contentKind: "programmatic-page",
  },
  {
    id: "technical-article-draft",
    label: "Техническая статья",
    description: "How-to / база знаний с дисклеймером",
    contentKind: "technical-article",
  },
  {
    id: "editorial-content-draft",
    label: "Редакционная история",
    description: "История, разбор, выводы — с fiction notice при необходимости",
    contentKind: "editorial-content",
  },
  {
    id: "news-draft",
    label: "Новость",
    description: "Только при наличии source URLs или notes",
    requiresSource: true,
    contentKind: "news",
  },
  {
    id: "digest-draft",
    label: "Дайджест",
    description: "Подборка по источникам — без source не генерируется",
    requiresSource: true,
    contentKind: "digest",
  },
  {
    id: "faq-only",
    label: "Только FAQ",
    description: "Блок вопросов-ответов для существующей темы",
    contentKind: "partial",
  },
  {
    id: "metadata-only",
    label: "Только SEO metadata",
    description: "Title, description, robots — без публикации",
    contentKind: "partial",
  },
  {
    id: "cta-only",
    label: "Только CTA",
    description: "Primary/secondary CTA для страницы",
    contentKind: "partial",
  },
  {
    id: "related-links-only",
    label: "Только related links",
    description: "Перелинковка на проекты, статьи, калькулятор",
    contentKind: "partial",
  },
  {
    id: "teaser-package",
    label: "Teaser-пакет",
    description: "Короткие версии для Telegram, VK, Dzen и др.",
    contentKind: "partial",
  },
];

export function getGenerationModeMeta(
  mode: AIContentGenerationMode,
): AIContentGenerationModeMeta | undefined {
  return AI_CONTENT_GENERATION_MODES.find((m) => m.id === mode);
}
