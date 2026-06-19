import type { ExternalPublicationStatus } from "@/types/content-distribution";

export const DISTRIBUTION_STATUS_LABELS: Record<ExternalPublicationStatus, string> = {
  draft: "Черновик",
  review: "На проверке",
  approved: "Одобрено",
  scheduled: "Запланировано",
  publishing: "Публикуется",
  published: "Опубликовано",
  failed: "Ошибка",
  "manual-export": "Manual export",
  "needs-api": "Нужен API",
  cancelled: "Отменено",
  archived: "Архив",
};

export const DISTRIBUTION_STATUS_TRANSITIONS: Partial<
  Record<ExternalPublicationStatus, ExternalPublicationStatus[]>
> = {
  draft: ["review", "cancelled", "archived"],
  review: ["approved", "draft", "cancelled"],
  approved: ["scheduled", "publishing", "manual-export", "cancelled"],
  scheduled: ["publishing", "cancelled", "approved"],
  publishing: ["published", "failed"],
  failed: ["review", "draft", "cancelled"],
  "manual-export": ["published", "cancelled"],
  published: ["archived"],
  cancelled: ["archived", "draft"],
  "needs-api": ["draft", "cancelled"],
  archived: [],
};
