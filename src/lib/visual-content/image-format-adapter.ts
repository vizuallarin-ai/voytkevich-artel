import type { VisualAsset, VisualAspectRatio } from "@/types/visual-content";
import { faviconSizes, getFormatSpec, visualFormats } from "@/data/visual-formats";

export type FormatVariant = {
  aspectRatio: VisualAspectRatio;
  width?: number;
  height?: number;
  status: "planned" | "ready" | "missing";
  fileUrl?: string;
  note?: string;
};

export type UsageContext = "site" | "social" | "og" | "distribution" | "favicon";

export function getRequiredFormatsForUsage(usage: UsageContext): VisualAspectRatio[] {
  switch (usage) {
    case "site":
      return ["16:9"];
    case "og":
      return ["16:9"];
    case "social":
      return ["1:1", "4:5", "9:16"];
    case "distribution":
      return ["1:1", "16:9"];
    case "favicon":
      return ["favicon"];
    default:
      return ["16:9"];
  }
}

export function buildFormatVariant(asset: VisualAsset, aspectRatio: VisualAspectRatio): FormatVariant {
  const spec = getFormatSpec(aspectRatio);
  const isPrimary = asset.format.aspectRatio === aspectRatio;

  // TODO: production resize/crop pipeline (sharp, imgix, or CDN transforms)
  return {
    aspectRatio,
    width: spec?.recommendedWidth,
    height: spec?.recommendedHeight,
    status: isPrimary && asset.fileUrl ? "ready" : "planned",
    fileUrl: isPrimary ? asset.fileUrl : undefined,
    note: isPrimary
      ? undefined
      : "Вариант будет создан через format adapter (resize/crop) — не реализовано на Этапе 26",
  };
}

export function validateFormatVariant(asset: VisualAsset, aspectRatio: VisualAspectRatio): boolean {
  const spec = getFormatSpec(aspectRatio);
  if (!spec) return false;
  if (asset.format.aspectRatio === aspectRatio) {
    return Boolean(asset.fileUrl || asset.sourceUrl);
  }
  return true;
}

export function getSocialImageFormats(): VisualAspectRatio[] {
  return ["1:1", "4:5", "9:16"];
}

export function getSiteImageFormats(): VisualAspectRatio[] {
  return ["16:9", "favicon"];
}

export function getAllFormatSpecs() {
  return visualFormats;
}

export function getFaviconSizes() {
  return faviconSizes;
}

export function buildFormatPackage(asset: VisualAsset, usage: UsageContext): FormatVariant[] {
  return getRequiredFormatsForUsage(usage).map((ratio) => buildFormatVariant(asset, ratio));
}
