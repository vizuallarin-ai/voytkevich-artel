import type { EditorialStoryTemplate } from "@/types/editorial-content";

export const editorialStoryTemplates: EditorialStoryTemplate[] = [
  {
    id: "scenario-story",
    type: "scenario-story",
    title: "Сценарий",
    description: "Hook → ситуация → конфликт → выводы → CTA",
    requiredBlocks: ["hook", "situation", "conflict", "takeaways", "related", "cta"],
    fictionNoticeRequired: true,
  },
  {
    id: "fictionalized-story",
    type: "fictionalized-story",
    title: "Собирательная история",
    description: "Fiction notice → история → ошибка → выводы",
    requiredBlocks: ["fiction-notice", "story", "mistakes", "takeaways", "cta"],
    fictionNoticeRequired: true,
  },
  {
    id: "construction-diary",
    type: "construction-diary",
    title: "Дневник стройки",
    description: "Этапы и решения (только реальный объект или маркировка)",
    requiredBlocks: ["context", "steps", "decisions", "cta"],
    fictionNoticeRequired: true,
  },
  {
    id: "local-story",
    type: "local-story",
    title: "Локальная история",
    description: "Локация → типовая ситуация → что проверить",
    requiredBlocks: ["fiction-notice", "local-context", "takeaways", "cta"],
    fictionNoticeRequired: true,
  },
];

export function getEditorialStoryTemplate(type: EditorialStoryTemplate["type"]) {
  return editorialStoryTemplates.find((t) => t.type === type);
}
