import type { ContentStatus } from "@/types/content-workflow";

export const CONTENT_STATUS_LABELS: Record<ContentStatus, string> = {
  idea: "Идея",
  planned: "Запланировано",
  draft: "Черновик",
  "ai-generated": "AI-черновик",
  review: "На проверке",
  "needs-source": "Нужен источник",
  "needs-fact-check": "Нужен fact-check",
  "needs-expert-review": "Нужна экспертиза",
  "needs-keyword-data": "Нужна семантика",
  "needs-project-data": "Нужны данные проектов",
  approved: "Одобрено",
  scheduled: "Запланировано к публикации",
  published: "Опубликовано",
  noindex: "Noindex",
  "needs-update": "Требует обновления",
  archived: "Архив",
  rejected: "Отклонено",
};

export const NON_INDEXABLE_STATUSES: ContentStatus[] = [
  "idea",
  "planned",
  "draft",
  "ai-generated",
  "review",
  "needs-source",
  "needs-fact-check",
  "needs-expert-review",
  "needs-keyword-data",
  "needs-project-data",
  "rejected",
  "archived",
];

export const DIRECT_PUBLISH_FORBIDDEN: ContentStatus[] = [
  "idea",
  "planned",
  "draft",
  "ai-generated",
  "review",
  "needs-source",
  "needs-fact-check",
  "needs-expert-review",
  "rejected",
];

/** Allowed status transitions (from → to[]) */
export const CONTENT_STATUS_TRANSITIONS: Partial<Record<ContentStatus, ContentStatus[]>> = {
  idea: ["planned", "archived"],
  planned: ["draft", "archived"],
  draft: ["review", "ai-generated", "archived", "rejected"],
  "ai-generated": ["review", "rejected", "archived"],
  review: [
    "approved",
    "needs-source",
    "needs-fact-check",
    "needs-expert-review",
    "rejected",
    "noindex",
    "draft",
  ],
  "needs-source": ["review", "rejected", "archived"],
  "needs-fact-check": ["review", "rejected", "archived"],
  "needs-expert-review": ["review", "rejected", "archived"],
  "needs-keyword-data": ["review", "draft", "archived"],
  "needs-project-data": ["review", "draft", "archived"],
  approved: ["scheduled", "published", "noindex", "review", "archived"],
  scheduled: ["published", "approved", "noindex", "archived"],
  published: ["needs-update", "noindex", "archived"],
  noindex: ["review", "approved", "archived"],
  "needs-update": ["review", "draft", "archived"],
  rejected: ["draft", "review", "archived"],
  archived: ["draft", "planned"],
};

export function isStatusIndexable(status: ContentStatus): boolean {
  return !NON_INDEXABLE_STATUSES.includes(status) && status !== "noindex";
}
