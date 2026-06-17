import type { EditorialDigestTemplate } from "@/types/editorial-content";

export const editorialDigestTemplates: EditorialDigestTemplate[] = [
  {
    id: "weekly-digest",
    type: "weekly-digest",
    title: "Дайджест недели",
    minItems: 3,
    maxItems: 7,
    requiredBlocks: ["intro", "digest-items", "related", "cta"],
  },
  {
    id: "monthly-digest",
    type: "monthly-digest",
    title: "Дайджест месяца",
    minItems: 5,
    maxItems: 10,
    requiredBlocks: ["intro", "digest-items", "seasonal", "cta"],
  },
  {
    id: "question-roundup",
    type: "question-roundup",
    title: "Вопросы недели",
    minItems: 3,
    maxItems: 5,
    requiredBlocks: ["question", "short-answer", "related", "cta"],
  },
  {
    id: "trend-review",
    type: "trend-review",
    title: "Обзор тренда",
    minItems: 2,
    maxItems: 5,
    requiredBlocks: ["trend", "local-context", "related", "cta"],
  },
];
