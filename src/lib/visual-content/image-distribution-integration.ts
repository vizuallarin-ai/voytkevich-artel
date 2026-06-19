import type { ExternalPublication } from "@/types/content-distribution";
import type { VisualAspectRatio } from "@/types/visual-content";
import { externalContentPlatforms } from "@/data/external-content-platforms";
import { imageAssetRepository } from "@/lib/visual-content/image-asset-repository";
import { buildFormatPackage } from "@/lib/visual-content/image-format-adapter";
import { validateVisualAsset } from "@/lib/visual-content/image-validation";

export type PlatformImageRequirements = {
  platformId: string;
  required: boolean;
  formats: VisualAspectRatio[];
  warnings: string[];
};

export type PublicationImageValidation = {
  valid: boolean;
  warnings: string[];
  blockers: string[];
  missingFormats: VisualAspectRatio[];
};

export type PlatformImagePackage = {
  platformId: string;
  images: Array<{ imageId: string; aspectRatio: VisualAspectRatio; fileUrl?: string }>;
  warnings: string[];
};

export function getRequiredImagesForPlatform(platformId: string): PlatformImageRequirements {
  const platform = externalContentPlatforms.find((p) => p.id === platformId);
  if (!platform) {
    return { platformId, required: false, formats: [], warnings: ["Площадка не найдена"] };
  }

  if (!platform.supportsImages) {
    return { platformId, required: false, formats: [], warnings: [] };
  }

  const formats: VisualAspectRatio[] =
    platform.id === "telegram" || platform.id === "vk" || platform.id === "ok"
      ? ["1:1"]
      : platform.id === "dzen" || platform.id === "vc"
        ? ["16:9"]
        : ["1:1", "16:9"];

  return {
    platformId,
    required: false,
    formats,
    warnings: formats.includes("9:16") ? [] : ["9:16 vertical — подготовка к future stories"],
  };
}

export async function validatePublicationImageRequirements(
  publication: ExternalPublication,
): Promise<PublicationImageValidation> {
  const reqs = getRequiredImagesForPlatform(publication.platformId);
  const warnings: string[] = [...reqs.warnings];
  const blockers: string[] = [];
  const missingFormats: VisualAspectRatio[] = [];

  if (!reqs.required && !publication.platformId) {
    return { valid: true, warnings, blockers, missingFormats };
  }

  const imageIds = imageAssetRepository.getImagesForPublication(publication.id);
  const assets = (
    await Promise.all(imageIds.map((id) => imageAssetRepository.getById(id)))
  ).filter(Boolean);

  if (reqs.formats.length && assets.length === 0) {
    warnings.push("Изображение для публикации отсутствует");
    missingFormats.push(...reqs.formats);
  }

  for (const format of reqs.formats) {
    const hasFormat = assets.some((a) => a!.format.aspectRatio === format);
    if (!hasFormat) missingFormats.push(format);
  }

  for (const asset of assets) {
    if (!asset) continue;
    const v = validateVisualAsset(asset);
    if (!v.canUseInDistribution) {
      warnings.push(`${asset.title}: не готово для дистрибуции`);
      blockers.push(...v.blockers);
    }
  }

  return {
    valid: blockers.length === 0,
    warnings,
    blockers,
    missingFormats,
  };
}

export async function attachImageToExternalPublication(
  publicationId: string,
  imageId: string,
): Promise<void> {
  const asset = await imageAssetRepository.getById(imageId);
  if (!asset) throw new Error("Visual asset not found");
  asset.related.publicationId = publicationId;
  asset.usage.socialTeaser = true;
  await imageAssetRepository.save(asset);
  imageAssetRepository.linkToPublication(publicationId, imageId);
  imageAssetRepository.appendAudit({
    assetId: imageId,
    action: "attached_publication",
    details: publicationId,
  });
}

export async function buildPlatformImagePackage(
  publication: ExternalPublication,
): Promise<PlatformImagePackage> {
  const reqs = getRequiredImagesForPlatform(publication.platformId);
  const imageIds = imageAssetRepository.getImagesForPublication(publication.id);
  const assets = (
    await Promise.all(imageIds.map((id) => imageAssetRepository.getById(id)))
  ).filter(Boolean);

  const warnings: string[] = [];
  const images: PlatformImagePackage["images"] = [];

  for (const asset of assets) {
    if (!asset) continue;
    const pkg = buildFormatPackage(asset, "distribution");
    for (const variant of pkg) {
      if (reqs.formats.includes(variant.aspectRatio)) {
        images.push({
          imageId: asset.id,
          aspectRatio: variant.aspectRatio,
          fileUrl: variant.fileUrl,
        });
      }
    }
  }

  if (reqs.formats.length && images.length === 0) {
    warnings.push("Нет изображений для площадки — teaser может публиковаться без картинки");
  }

  return {
    platformId: publication.platformId,
    images,
    warnings,
  };
}
