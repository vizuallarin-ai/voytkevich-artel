import type { CMSContentItem } from "@/types/content-cms";
import type { ContentPreview } from "@/lib/content-cms/content-preview-types";

export function buildContentPreview(item: CMSContentItem): ContentPreview {
  return {
    contentId: item.id,
    title: item.h1 ?? item.title,
    url: item.url,
    kind: item.kind,
    status: item.status,
    seo: {
      title: item.seoTitle ?? item.title,
      description: item.seoDescription ?? "",
      canonical: item.indexing.canonicalUrl ?? item.url,
      robots: item.indexing.robots,
    },
    notices: {
      fictionNotice: item.ethics?.fictionNoticeRequired
        ? item.ethics.fictionNoticePresent
          ? "present"
          : "missing"
        : "not-required",
      sourceRequired: item.quality.requiresSource ?? false,
      disclaimerRequired: item.kind === "technical-article",
    },
    cta: item.related.leadMagnets?.[0] ?? "consultation",
    relatedLinks: [
      ...(item.related.programmaticPages ?? []),
      ...(item.related.technicalArticles ?? []),
      ...(item.related.projectCategories ?? []),
    ],
    qualityLevel: item.quality.level,
    indexable: item.indexing.indexable,
    previewNote:
      "Preview только для dashboard. Материал не публикуется и не индексируется через preview.",
  };
}
