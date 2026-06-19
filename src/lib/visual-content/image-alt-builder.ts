import type { VisualAsset } from "@/types/visual-content";
import type { CMSContentItem } from "@/types/content-cms";
import type { ExternalPublication } from "@/types/content-distribution";
import { imageSafetyRules } from "@/data/image-safety-rules";

export function buildImageAlt(asset: VisualAsset): string {
  if (asset.seo.alt?.trim()) return asset.seo.alt.trim();

  switch (asset.kind) {
    case "diagram":
      return `Упрощённая схема: ${asset.title}`;
    case "real-photo":
      return asset.title;
    case "ai-illustration":
    case "cover":
    case "og-image":
    case "social-teaser-image":
      return `Редакционная иллюстрация: ${asset.title}`;
    case "brand-character":
      return `Редакционный визуальный персонаж — ${asset.title}`;
    default:
      return asset.title;
  }
}

export function buildContentCoverAlt(contentItem: CMSContentItem, asset: VisualAsset): string {
  const base = contentItem.h1 ?? contentItem.title;
  if (asset.kind === "real-photo") {
    return `${base} — фото объекта`;
  }
  if (asset.kind === "diagram") {
    return `Схема к материалу «${base}»: ${asset.title}`;
  }
  return `Редакционная иллюстрация к материалу «${base}»: ${asset.description ?? asset.title}`;
}

export function buildTechnicalDiagramAlt(contentItem: CMSContentItem, asset: VisualAsset): string {
  const base = contentItem.h1 ?? contentItem.title;
  return `Упрощённая схема к статье «${base}»: ${asset.title}. Не заменяет инженерный расчёт.`;
}

export function buildSocialTeaserAlt(publication: ExternalPublication, asset: VisualAsset): string {
  const topic = publication.payload?.title ?? asset.title;
  if (asset.kind === "real-photo") {
    return `Изображение к публикации: ${topic}`;
  }
  return `Иллюстрация к teaser «${topic}». ${imageSafetyRules.illustrationNotice}`;
}
