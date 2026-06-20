import type { ContentVersion } from "@/types/content-version";
import type { CMSContentItem } from "@/types/content-cms";
import { contentRepository } from "@/lib/content-cms/content-repository";
import { cmsIndexationIntegration } from "@/lib/seo-indexation/cms-indexation-integration";
import { refreshStore } from "@/lib/content-refresh/refresh-store";

export async function validateRefreshIndexability(
  version: ContentVersion,
): Promise<{ valid: boolean; indexable: boolean; message: string }> {
  const content = version.content as CMSContentItem;
  const decision = await cmsIndexationIntegration.recalculateCMSIndexability(version.contentItemId);

  return {
    valid: decision?.indexable ?? false,
    indexable: decision?.indexable ?? false,
    message: decision?.message ?? "Indexability check pending",
  };
}

export async function recalculateIndexabilityAfterRefresh(
  contentItemId: string,
): Promise<{ recalculated: boolean; indexable: boolean | null }> {
  const decision = await cmsIndexationIntegration.recalculateCMSIndexability(contentItemId);
  if (decision) {
    await cmsIndexationIntegration.attachIndexabilityDecision(contentItemId, decision);
  }

  refreshStore.logAudit({
    action: "indexability_recalculated_after_refresh",
    entityType: "content",
    entityId: contentItemId,
    contentItemId,
  });

  return {
    recalculated: Boolean(decision),
    indexable: decision?.indexable ?? null,
  };
}

export async function updateSitemapAfterRefresh(contentItemId: string): Promise<{
  updated: boolean;
  inSitemap: boolean | null;
}> {
  const item = await contentRepository.getContentById(contentItemId);
  if (!item) return { updated: false, inSitemap: null };

  const decision = await cmsIndexationIntegration.recalculateCMSIndexability(contentItemId);
  const inSitemap = decision?.sitemap ?? item.indexing.sitemap;

  refreshStore.logAudit({
    action: "sitemap_updated_after_refresh",
    entityType: "content",
    entityId: contentItemId,
    contentItemId,
    newValue: String(inSitemap),
  });

  return { updated: true, inSitemap };
}

export async function monitorIndexationAfterRefresh(contentItemId: string): Promise<{
  indexable: boolean | null;
  canonicalOk: boolean;
  message: string;
}> {
  const item = await contentRepository.getContentById(contentItemId);
  if (!item) return { indexable: null, canonicalOk: false, message: "Content not found" };

  const decision = cmsIndexationIntegration.getCachedDecision(contentItemId);
  const canonicalOk = (item.indexing.canonicalUrl ?? item.url) === item.url ||
    Boolean(item.indexing.canonicalUrl);

  return {
    indexable: decision?.indexable ?? item.indexing.indexable,
    canonicalOk,
    message: decision?.message ?? cmsIndexationIntegration.explainForCMSItem(item),
  };
}

export const indexationRefreshIntegration = {
  validateRefreshIndexability,
  recalculateIndexabilityAfterRefresh,
  updateSitemapAfterRefresh,
  monitorIndexationAfterRefresh,
};
