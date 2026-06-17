import type { EditorialContentQueueItem } from "@/types/editorial-content";
import { getEditorialRubricById } from "@/data/editorial-rubrics";

const CTA_MAP: Record<
  string,
  { primary: string; secondary?: string; leadMagnetId?: string }
> = {
  "project-selection": {
    primary: "Подобрать проект под мою семью",
    secondary: "Смотреть проекты домов",
    leadMagnetId: "budget-project-selection",
  },
  "land-checklist": {
    primary: "Получить чек-лист участка",
    secondary: "Подобрать проект под участок",
    leadMagnetId: "land-checklist",
  },
  "estimate-example": {
    primary: "Получить пример сметы",
    secondary: "Рассчитать стоимость дома",
    leadMagnetId: "estimate-example",
  },
  "bathhouse-selection": {
    primary: "Подобрать баню под участок",
    secondary: "Рассчитать баню",
    leadMagnetId: "estimate-example",
  },
  "local-build": {
    primary: "Обсудить строительство в этой локации",
    secondary: "Получить чек-лист участка",
    leadMagnetId: "land-checklist",
  },
  consultation: {
    primary: "Получить консультацию по проекту",
    secondary: "Смотреть полезные материалы",
    leadMagnetId: "mistakes-checklist",
  },
  "mistakes-checklist": {
    primary: "Получить чек-лист ошибок",
    secondary: "Обсудить мой проект",
    leadMagnetId: "mistakes-checklist",
  },
  "construction-start-checklist": {
    primary: "Получить консультацию по проекту",
    secondary: "Смотреть полезные материалы",
    leadMagnetId: "mistakes-checklist",
  },
};

export function buildEditorialCta(item: EditorialContentQueueItem) {
  const rubric = getEditorialRubricById(item.rubricId);
  const ctaKey = rubric?.defaultCTA ?? "consultation";
  const mapped = CTA_MAP[ctaKey] ?? CTA_MAP.consultation;
  const leadMagnetId = mapped.leadMagnetId ?? rubric?.defaultLeadMagnet;

  return {
    primary: mapped.primary,
    secondary: mapped.secondary,
    sourceCTA: mapped.primary,
    leadMagnetId,
  };
}

export function resolveEditorialCtaKey(rubricId: string): string {
  return getEditorialRubricById(rubricId)?.defaultCTA ?? "consultation";
}
