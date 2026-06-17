import type { EditorialContentItem } from "@/types/editorial-content";

export type FactCheckRule = {
  id: string;
  appliesTo: EditorialContentItem["type"][] | "regulation";
  description: string;
  requiredFields: string[];
};

export const editorialFactCheckRules: FactCheckRule[] = [
  {
    id: "news-source",
    appliesTo: ["news", "news-analysis"],
    description: "Новость должна иметь источник",
    requiredFields: ["sourceUrls", "sourceNotes"],
  },
  {
    id: "regulation-verify",
    appliesTo: "regulation",
    description: "Нормативные изменения проверяются по первоисточнику",
    requiredFields: ["sourceUrls", "factCheckStatus"],
  },
  {
    id: "local-facts",
    appliesTo: ["local-story"],
    description: "Локальные факты не выдумываются без проверки",
    requiredFields: [],
  },
  {
    id: "market-claims",
    appliesTo: ["trend-review", "news-analysis"],
    description: "Рыночные утверждения требуют источника или оговорки",
    requiredFields: ["sourceNotes"],
  },
];

export function passesFactCheck(item: EditorialContentItem): boolean {
  if (item.rubricId === "regulation-notes") {
    return item.storyMeta.factCheckStatus === "passed" && Boolean(item.storyMeta.sourceUrls?.length);
  }
  if (item.type === "news" || item.type === "news-analysis") {
    return Boolean(item.storyMeta.sourceUrls?.length || item.storyMeta.sourceNotes);
  }
  return true;
}
