import type { VisualAssetKind } from "@/types/visual-content";

export type VisualContentTypeMeta = {
  kind: VisualAssetKind;
  label: string;
  description: string;
  canUseAI: boolean;
  defaultSource: "uploaded" | "ai-generated" | "template-rendered";
  riskLevel: "high" | "medium" | "low";
  requiresReview: boolean;
};

export const visualContentTypes: VisualContentTypeMeta[] = [
  {
    kind: "real-photo",
    label: "Реальное фото",
    description: "Только подтверждённые фото объектов, бригады, материалов.",
    canUseAI: false,
    defaultSource: "uploaded",
    riskLevel: "medium",
    requiresReview: true,
  },
  {
    kind: "ai-illustration",
    label: "AI-иллюстрация",
    description: "Редакционные иллюстрации для статей и teaser.",
    canUseAI: true,
    defaultSource: "ai-generated",
    riskLevel: "medium",
    requiresReview: true,
  },
  {
    kind: "diagram",
    label: "Схема / объяснение",
    description: "Упрощённые схемы без опасных точных инструкций.",
    canUseAI: true,
    defaultSource: "template-rendered",
    riskLevel: "low",
    requiresReview: true,
  },
  {
    kind: "cover",
    label: "Обложка материала",
    description: "Обложка для сайта, блога, программируемых страниц.",
    canUseAI: true,
    defaultSource: "template-rendered",
    riskLevel: "low",
    requiresReview: true,
  },
  {
    kind: "social-teaser-image",
    label: "Teaser для соцсетей",
    description: "Квадратные и портретные изображения для внешних площадок.",
    canUseAI: true,
    defaultSource: "template-rendered",
    riskLevel: "low",
    requiresReview: true,
  },
  {
    kind: "og-image",
    label: "Open Graph",
    description: "16:9 для превью в мессенджерах и соцсетях.",
    canUseAI: true,
    defaultSource: "template-rendered",
    riskLevel: "low",
    requiresReview: true,
  },
  {
    kind: "thumbnail",
    label: "Миниатюра",
    description: "Маленькое превью в списках и карточках.",
    canUseAI: true,
    defaultSource: "template-rendered",
    riskLevel: "low",
    requiresReview: false,
  },
  {
    kind: "brand-character",
    label: "Бренд-персонаж",
    description: "Редакционный визуальный персонаж СтройСтрой Мастер.",
    canUseAI: true,
    defaultSource: "ai-generated",
    riskLevel: "low",
    requiresReview: true,
  },
  {
    kind: "icon",
    label: "Иконка",
    description: "Мелкие графические элементы.",
    canUseAI: false,
    defaultSource: "template-rendered",
    riskLevel: "low",
    requiresReview: false,
  },
];

export function getVisualContentTypeMeta(kind: VisualAssetKind): VisualContentTypeMeta | undefined {
  return visualContentTypes.find((t) => t.kind === kind);
}
