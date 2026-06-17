import type { Metadata } from "next";
import type { EditorialContentItem, EditorialContentQualityScore } from "@/types/editorial-content";
import { pageMetadata } from "@/lib/seo";
import { passesFactCheck } from "@/data/editorial-fact-check-rules";
import { requiresFictionNotice } from "@/data/editorial-ethics-rules";

const NOINDEX_STATUSES = new Set([
  "planned",
  "draft",
  "ai-generated",
  "review",
  "noindex",
  "needs-source",
  "needs-fact-check",
  "needs-human-review",
  "needs-update",
  "rejected",
]);

export function resolveEditorialIndexing(
  item: EditorialContentItem,
  qualityScore?: EditorialContentQualityScore,
): EditorialContentItem["indexing"] {
  if (NOINDEX_STATUSES.has(item.status)) {
    return {
      indexable: false,
      sitemap: false,
      noindexReason: `status: ${item.status}`,
    };
  }

  if (item.status !== "published" && item.status !== "approved") {
    return { indexable: false, sitemap: false, noindexReason: "not published" };
  }

  if (requiresFictionNotice(item) && !item.storyMeta.fictionNoticeRequired) {
    return { indexable: false, sitemap: false, noindexReason: "fiction notice required" };
  }

  if (item.storyMeta.sourceRequired && !passesFactCheck(item)) {
    return { indexable: false, sitemap: false, noindexReason: "missing source" };
  }

  if (qualityScore && !qualityScore.canPublish) {
    return {
      indexable: false,
      sitemap: false,
      noindexReason: qualityScore.blockers[0] ?? "quality score too low",
    };
  }

  if (qualityScore?.shouldNoindex) {
    return { indexable: false, sitemap: false, noindexReason: "quality should noindex" };
  }

  return {
    indexable: true,
    sitemap: true,
    canonicalUrl: item.indexing.canonicalUrl ?? item.url,
  };
}

export function generateEditorialRobots(item: EditorialContentItem) {
  return {
    index: item.indexing.indexable,
    follow: true,
  };
}

export function generateEditorialCanonical(item: EditorialContentItem): string | undefined {
  return item.indexing.canonicalUrl ?? item.url;
}

export function generateEditorialMetadata(item: EditorialContentItem): Metadata {
  const meta = pageMetadata({
    title: item.seoTitle,
    description: item.seoDescription,
    path: item.url,
    noindex: !item.indexing.indexable,
  });

  return {
    ...meta,
    robots: generateEditorialRobots(item),
    alternates: {
      canonical: generateEditorialCanonical(item),
    },
  };
}
