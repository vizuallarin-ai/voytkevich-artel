export type RecommendationExclusionRule = {
  id: string;
  label: string;
  description: string;
  severity: "block" | "warn";
  detect: (input: {
    status?: string;
    indexable?: boolean;
    canonical?: boolean;
    available?: boolean;
    isCurrentPage?: boolean;
    isDismissed?: boolean;
    isRedirect?: boolean;
    isBroken?: boolean;
    locationConflict?: boolean;
    recommendationTypeMismatch?: boolean;
    missingRequiredAttribute?: boolean;
  }) => boolean;
};

export const RECOMMENDATION_EXCLUSION_RULES: RecommendationExclusionRule[] = [
  {
    id: "current-page",
    label: "Текущая страница",
    description: "Не рекомендовать текущую страницу без причины",
    severity: "block",
    detect: (i) => Boolean(i.isCurrentPage),
  },
  {
    id: "draft",
    label: "Черновик",
    description: "Исключить draft-контент",
    severity: "block",
    detect: (i) => i.status === "draft",
  },
  {
    id: "review",
    label: "На проверке",
    description: "Исключить review-контент",
    severity: "block",
    detect: (i) => i.status === "review",
  },
  {
    id: "scheduled",
    label: "Запланирован",
    description: "Исключить неопубликованный scheduled-контент",
    severity: "block",
    detect: (i) => i.status === "scheduled",
  },
  {
    id: "noindex",
    label: "Noindex",
    description: "Исключить noindex-страницы",
    severity: "block",
    detect: (i) => i.indexable === false,
  },
  {
    id: "redirect",
    label: "Redirect source",
    description: "Исключить redirect source",
    severity: "block",
    detect: (i) => Boolean(i.isRedirect),
  },
  {
    id: "noncanonical",
    label: "Non-canonical",
    description: "Исключить non-canonical URL",
    severity: "block",
    detect: (i) => i.canonical === false,
  },
  {
    id: "deleted",
    label: "Удалён",
    description: "Исключить удалённый контент",
    severity: "block",
    detect: (i) => i.status === "archived" || i.status === "rejected",
  },
  {
    id: "broken",
    label: "Broken URL",
    description: "Исключить битые ссылки",
    severity: "block",
    detect: (i) => Boolean(i.isBroken),
  },
  {
    id: "unavailable",
    label: "Недоступен",
    description: "Исключить недоступный проект или услугу",
    severity: "block",
    detect: (i) => i.available === false,
  },
  {
    id: "location-conflict",
    label: "Конфликт локации",
    description: "Исключить контент с неподдерживаемой локацией",
    severity: "block",
    detect: (i) => Boolean(i.locationConflict),
  },
  {
    id: "dismissed",
    label: "Скрыто пользователем",
    description: "Исключить dismissed items",
    severity: "block",
    detect: (i) => Boolean(i.isDismissed),
  },
  {
    id: "type-mismatch",
    label: "Несовместимый тип",
    description: "Исключить несовместимый тип рекомендации",
    severity: "block",
    detect: (i) => Boolean(i.recommendationTypeMismatch),
  },
  {
    id: "missing-attribute",
    label: "Отсутствует атрибут",
    description: "Исключить при отсутствии обязательного атрибута",
    severity: "block",
    detect: (i) => Boolean(i.missingRequiredAttribute),
  },
];

export const RECOMMENDATION_EXCLUSION_RULE_IDS = RECOMMENDATION_EXCLUSION_RULES.map((r) => r.id);
