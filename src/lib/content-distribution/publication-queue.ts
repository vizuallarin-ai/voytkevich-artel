import type { CMSContentItem } from "@/types/content-cms";
import type {
  ExternalPublication,
  PublicationQueueItem,
  PublicationValidationResult,
} from "@/types/content-distribution";
import { validatePublication } from "@/lib/content-distribution/publication-validator";

export function publicationToQueueItem(
  publication: ExternalPublication,
  content: CMSContentItem | null,
): PublicationQueueItem {
  const validation = validatePublication(publication, content);
  return {
    id: publication.id,
    contentItemId: publication.contentItemId,
    contentTitle: content?.title ?? publication.payload.title,
    contentKind: content?.kind ?? publication.attribution.contentKind ?? "unknown",
    contentUrl: content?.url ?? publication.payload.fullArticleUrl,
    teaserVersionId: publication.teaserVersionId,
    platformId: publication.platformId,
    status: publication.status,
    priority: (content?.seo.priority as PublicationQueueItem["priority"]) ?? "P3",
    scheduledAt: publication.scheduledAt,
    blockers: validation.blockers,
    warnings: validation.warnings,
    canPublish: validation.canPublish,
    requiresManualExport: validation.requiresManualExport,
    requiresAPI: validation.requiresAPI,
    requiresReview: publication.status === "draft" || publication.status === "review",
    createdAt: publication.createdAt,
  };
}

export function sortQueue(items: PublicationQueueItem[]): PublicationQueueItem[] {
  const rank: Record<string, number> = { P1: 1, P2: 2, P3: 3, P4: 4, P5: 5 };
  return [...items].sort((a, b) => {
    const pr = (rank[a.priority] ?? 9) - (rank[b.priority] ?? 9);
    if (pr !== 0) return pr;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function summarizeQueueValidation(items: PublicationQueueItem[]) {
  return {
    withBlockers: items.filter((i) => i.blockers.length > 0).length,
    manualExport: items.filter((i) => i.requiresManualExport).length,
    readyToPublish: items.filter((i) => i.canPublish && i.status === "approved").length,
  };
}

export type { PublicationValidationResult };
