import type { VisualTemplate, TextOverlayConfig, VisualTemplatePreview } from "@/types/visual-templates";
import type { VisualAsset } from "@/types/visual-content";
import type { CMSContentItem } from "@/types/content-cms";
import { imageSafetyRules } from "@/data/image-safety-rules";
import { visualStyleGuide } from "@/data/visual-style-guide";

export type OverlayText = {
  title: string;
  subtitle?: string;
  cta?: string;
};

export function validateTextOverlay(
  template: VisualTemplate,
  text: OverlayText,
): { valid: boolean; warnings: string[]; blockers: string[] } {
  const warnings: string[] = [];
  const blockers: string[] = [];

  if (!template.supportsTextOverlay) {
    blockers.push("Шаблон не поддерживает text overlay");
    return { valid: false, warnings, blockers };
  }

  const rules = template.textOverlayRules;
  if (!rules) return { valid: true, warnings, blockers };

  if (text.title.length > rules.maxTitleLength) {
    blockers.push(`Заголовок длиннее ${rules.maxTitleLength} символов`);
  }
  if (rules.maxSubtitleLength && text.subtitle && text.subtitle.length > rules.maxSubtitleLength) {
    blockers.push(`Подзаголовок длиннее ${rules.maxSubtitleLength} символов`);
  }
  if (text.title.length < 3) {
    warnings.push("Слишком короткий заголовок для обложки");
  }

  return { valid: blockers.length === 0, warnings, blockers };
}

export function buildTextOverlayConfig(
  template: VisualTemplate,
  contentItem: Pick<CMSContentItem, "title" | "h1" | "seoDescription">,
): TextOverlayConfig {
  const rules = template.textOverlayRules;
  const title = (contentItem.h1 ?? contentItem.title).slice(0, rules?.maxTitleLength ?? 80);
  const subtitle = contentItem.seoDescription?.slice(0, rules?.maxSubtitleLength ?? 120);

  return {
    title,
    subtitle,
    position: rules?.textPosition ?? "bottom",
    safeArea: rules?.safeArea ?? "bottom 30%",
  };
}

export function renderVisualTemplatePreview(
  template: VisualTemplate,
  asset: Pick<VisualAsset, "title" | "fileUrl"> & {
    safety?: Pick<VisualAsset["safety"], "requiresIllustrationNotice">;
  },
  text: OverlayText,
): VisualTemplatePreview {
  const overlay = validateTextOverlay(template, text);
  const illustrationNotice = asset.safety?.requiresIllustrationNotice
    ? imageSafetyRules.illustrationNotice
    : undefined;

  // TODO: production canvas/SVG rendering via sharp or @vercel/og
  return {
    templateId: template.id,
    aspectRatio: template.aspectRatio,
    backgroundPlaceholder: asset.fileUrl ?? `gradient:${visualStyleGuide.palette.charcoal}-${visualStyleGuide.palette.constructionOrange}`,
    overlay: {
      title: text.title,
      subtitle: text.subtitle,
      cta: text.cta,
      position: template.textOverlayRules?.textPosition ?? "bottom",
      safeArea: template.textOverlayRules?.safeArea ?? "bottom 30%",
    },
    illustrationNotice,
  };
}
