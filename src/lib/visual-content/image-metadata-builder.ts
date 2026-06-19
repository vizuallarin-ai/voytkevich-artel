import type { VisualAsset } from "@/types/visual-content";
import { buildImageAlt } from "@/lib/visual-content/image-alt-builder";
import { imageSafetyRules } from "@/data/image-safety-rules";

export type ImageMetadata = {
  alt: string;
  title?: string;
  caption?: string;
  ogImage?: string;
  width?: number;
  height?: number;
  illustrationNotice?: string;
  isAiGenerated: boolean;
  isRealPhoto: boolean;
};

export function buildImageMetadata(asset: VisualAsset): ImageMetadata {
  const alt = buildImageAlt(asset);
  const isAiGenerated = asset.source === "ai-generated";
  const isRealPhoto = asset.kind === "real-photo";

  return {
    alt,
    title: asset.seo.title ?? asset.title,
    caption:
      asset.seo.caption ??
      (asset.safety.requiresIllustrationNotice ? imageSafetyRules.illustrationNotice : undefined),
    ogImage: asset.usage.openGraph ? asset.fileUrl : undefined,
    width: asset.format.width,
    height: asset.format.height,
    illustrationNotice: asset.safety.requiresIllustrationNotice
      ? imageSafetyRules.illustrationNotice
      : undefined,
    isAiGenerated,
    isRealPhoto,
  };
}

export function buildOgMetadata(asset: VisualAsset, pageTitle: string) {
  return {
    title: pageTitle,
    description: asset.seo.caption,
    images: asset.fileUrl
      ? [{ url: asset.fileUrl, width: asset.format.width, height: asset.format.height, alt: buildImageAlt(asset) }]
      : [],
  };
}
