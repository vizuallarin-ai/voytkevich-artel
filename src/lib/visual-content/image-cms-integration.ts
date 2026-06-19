import type { CMSContentItem } from "@/types/content-cms";
import { imageAssetRepository } from "@/lib/visual-content/image-asset-repository";
import { getRequiredFormatsForUsage } from "@/lib/visual-content/image-format-adapter";
import { validateVisualAsset } from "@/lib/visual-content/image-validation";

export type ContentVisualRequirements = {
  needsCover: boolean;
  needsOg: boolean;
  needsSocialPackage: boolean;
  requiredFormats: ReturnType<typeof getRequiredFormatsForUsage>;
};

export type ContentVisualCompleteness = {
  complete: boolean;
  hasCover: boolean;
  hasOg: boolean;
  hasSocialTeaser: boolean;
  hasAlt: boolean;
  warnings: string[];
  blockers: string[];
  needsImageReview: boolean;
};

export function getVisualRequirementsForContent(contentItem: CMSContentItem): ContentVisualRequirements {
  const isPublished = contentItem.status === "published" || contentItem.status === "scheduled";
  const needsCover = isPublished || contentItem.indexing.indexable;
  const needsOg = needsCover;
  const needsSocialPackage = contentItem.distribution.allowExternalTeasers && contentItem.distribution.teaserReady;

  return {
    needsCover,
    needsOg,
    needsSocialPackage,
    requiredFormats: needsSocialPackage
      ? getRequiredFormatsForUsage("distribution")
      : getRequiredFormatsForUsage("site"),
  };
}

export async function checkContentVisualCompleteness(
  contentItem: CMSContentItem,
): Promise<ContentVisualCompleteness> {
  const reqs = getVisualRequirementsForContent(contentItem);
  const imageIds = imageAssetRepository.getImagesForContent(contentItem.id);
  const assets = (
    await Promise.all(imageIds.map((id) => imageAssetRepository.getById(id)))
  ).filter(Boolean);

  const coverAsset = assets.find((a) => a!.usage.siteCover);
  const ogAsset = assets.find((a) => a!.usage.openGraph);
  const socialAsset = assets.find((a) => a!.usage.socialTeaser);

  const warnings: string[] = [];
  const blockers: string[] = [];

  if (reqs.needsCover && !coverAsset) blockers.push("Отсутствует cover image");
  if (reqs.needsOg && !ogAsset) warnings.push("Отсутствует OG image");
  if (reqs.needsSocialPackage && !socialAsset) warnings.push("Отсутствует social teaser image");

  let needsImageReview = false;
  for (const asset of assets) {
    if (!asset) continue;
    const v = validateVisualAsset(asset);
    if (!v.valid) {
      needsImageReview = true;
      blockers.push(...v.blockers.map((b) => `${asset.title}: ${b}`));
    }
    warnings.push(...v.warnings.map((w) => `${asset.title}: ${w}`));
  }

  const hasAlt = assets.every((a) => a?.seo.alt?.trim());

  return {
    complete: blockers.length === 0,
    hasCover: Boolean(coverAsset),
    hasOg: Boolean(ogAsset),
    hasSocialTeaser: Boolean(socialAsset),
    hasAlt,
    warnings,
    blockers,
    needsImageReview,
  };
}

export async function attachCoverImageToContent(contentItemId: string, imageId: string): Promise<void> {
  const asset = await imageAssetRepository.getById(imageId);
  if (!asset) throw new Error("Visual asset not found");
  asset.related.contentItemId = contentItemId;
  asset.usage.siteCover = true;
  await imageAssetRepository.save(asset);
  imageAssetRepository.linkToContent(contentItemId, imageId);
  imageAssetRepository.appendAudit({
    assetId: imageId,
    action: "attached_cover",
    details: contentItemId,
  });
}

export async function attachOGImageToContent(contentItemId: string, imageId: string): Promise<void> {
  const asset = await imageAssetRepository.getById(imageId);
  if (!asset) throw new Error("Visual asset not found");
  asset.related.contentItemId = contentItemId;
  asset.usage.openGraph = true;
  await imageAssetRepository.save(asset);
  imageAssetRepository.linkToContent(contentItemId, imageId);
  imageAssetRepository.appendAudit({
    assetId: imageId,
    action: "attached_og",
    details: contentItemId,
  });
}

export async function attachInlineImageToContent(contentItemId: string, imageId: string): Promise<void> {
  const asset = await imageAssetRepository.getById(imageId);
  if (!asset) throw new Error("Visual asset not found");
  asset.related.contentItemId = contentItemId;
  asset.usage.blogInline = true;
  await imageAssetRepository.save(asset);
  imageAssetRepository.linkToContent(contentItemId, imageId);
  imageAssetRepository.appendAudit({
    assetId: imageId,
    action: "attached_inline",
    details: contentItemId,
  });
}

export async function getImagesForContent(contentItemId: string) {
  const ids = imageAssetRepository.getImagesForContent(contentItemId);
  return Promise.all(ids.map((id) => imageAssetRepository.getById(id)));
}
