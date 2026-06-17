import type { WorkflowAction } from "@/types/content-workflow";

export type BulkActionDef = {
  id: string;
  action: WorkflowAction | "export_csv" | "assign_priority" | "assign_author";
  label: string;
  description: string;
  enabled: boolean;
  disabledReason?: string;
};

export const contentBulkActions: BulkActionDef[] = [
  {
    id: "bulk-send-review",
    action: "send_to_review",
    label: "Отправить на review",
    description: "Перевести выбранные материалы в review",
    enabled: true,
  },
  {
    id: "bulk-noindex",
    action: "set_noindex",
    label: "Установить noindex",
    description: "Закрыть от индексации",
    enabled: true,
  },
  {
    id: "bulk-archive",
    action: "archive",
    label: "В архив",
    description: "Архивировать материалы",
    enabled: true,
  },
  {
    id: "bulk-request-source",
    action: "request_source",
    label: "Запросить источник",
    description: "Перевести в needs-source",
    enabled: true,
  },
  {
    id: "bulk-request-fact-check",
    action: "request_fact_check",
    label: "Запросить fact-check",
    description: "Перевести в needs-fact-check",
    enabled: true,
  },
  {
    id: "bulk-request-expert",
    action: "request_expert_review",
    label: "Запросить экспертизу",
    description: "Перевести в needs-expert-review",
    enabled: true,
  },
  {
    id: "bulk-export",
    action: "export_csv",
    label: "Экспорт CSV",
    description: "Выгрузить список материалов",
    enabled: true,
  },
  {
    id: "bulk-publish",
    action: "publish",
    label: "Опубликовать",
    description: "Массовая публикация",
    enabled: false,
    disabledReason: "Массовая публикация запрещена. Требуется индивидуальный review.",
  },
];
