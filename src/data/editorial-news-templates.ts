import type { EditorialNewsTemplate } from "@/types/editorial-content";

export const editorialNewsTemplates: EditorialNewsTemplate[] = [
  {
    id: "news",
    type: "news",
    title: "Новость",
    requiresSource: true,
    requiresFactCheck: true,
    requiredBlocks: ["summary", "why-matters", "sources", "cta"],
  },
  {
    id: "news-analysis",
    type: "news-analysis",
    title: "Разбор новости",
    requiresSource: true,
    requiresFactCheck: true,
    requiredBlocks: ["summary", "conclusion", "impact", "sources", "cta"],
  },
  {
    id: "regulation-note",
    type: "news-analysis",
    title: "Нормативная заметка",
    requiresSource: true,
    requiresFactCheck: true,
    requiredBlocks: ["summary", "disclaimer", "sources", "cta"],
  },
];
