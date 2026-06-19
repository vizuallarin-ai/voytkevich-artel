import type { VisualBrief } from "@/types/visual-content";
import { visualStyleGuide } from "@/data/visual-style-guide";
import { imageSafetyRules } from "@/data/image-safety-rules";
import { getVisualTemplate } from "@/data/visual-template-registry";

export type VisualBriefInput = {
  topic: string;
  contentKind?: string;
  visualStyleId?: string;
  templateId?: string;
  aspectRatio: VisualBrief["aspectRatio"];
  goals?: string[];
  requiresIllustrationNotice?: boolean;
};

export function createVisualBrief(input: VisualBriefInput): VisualBrief {
  const template = input.templateId ? getVisualTemplate(input.templateId) : undefined;
  return {
    topic: input.topic,
    contentKind: input.contentKind,
    visualStyleId: input.visualStyleId ?? visualStyleGuide.id,
    templateId: input.templateId,
    aspectRatio: input.aspectRatio,
    goals: input.goals ?? ["обложка материала", "читаемость в превью", "соответствие бренду"],
    composition: template
      ? `Шаблон ${template.title}: ${template.visualRules.join("; ")}`
      : "крупный объект, чистая композиция, контраст",
    palette: [
      visualStyleGuide.palette.charcoal,
      visualStyleGuide.palette.constructionOrange,
      visualStyleGuide.palette.concreteGray,
      visualStyleGuide.palette.offWhite,
    ],
    forbidden: [
      ...visualStyleGuide.forbidden,
      ...(template?.forbidden ?? []),
      ...imageSafetyRules.blockers,
    ],
    requiresIllustrationNotice: input.requiresIllustrationNotice ?? true,
  };
}

export function visualBriefToText(brief: VisualBrief): string {
  return [
    `Тема: ${brief.topic}`,
    brief.contentKind ? `Тип контента: ${brief.contentKind}` : "",
    `Цели: ${brief.goals.join(", ")}`,
    `Композиция: ${brief.composition}`,
    `Палитра: ${brief.palette.join(", ")}`,
    `Формат: ${brief.aspectRatio}`,
    brief.requiresIllustrationNotice ? imageSafetyRules.illustrationNotice : "",
    `Запрещено: ${brief.forbidden.slice(0, 5).join("; ")}`,
  ]
    .filter(Boolean)
    .join("\n");
}
