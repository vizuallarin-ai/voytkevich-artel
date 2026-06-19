import type { ExternalPublication } from "@/types/content-distribution";
import { getExternalPlatform } from "@/data/external-content-platforms";

export type ManualExportPayload = {
  platformTitle: string;
  platformId: string;
  title: string;
  text: string;
  hashtags: string[];
  utmUrl: string;
  fullArticleUrl: string;
  checklist: string[];
  copyableText: string;
};

export function buildManualExportPayload(publication: ExternalPublication): ManualExportPayload {
  const platform = getExternalPlatform(publication.platformId);
  return {
    platformTitle: platform?.title ?? publication.platformId,
    platformId: publication.platformId,
    title: publication.payload.title,
    text: publication.payload.text,
    hashtags: publication.payload.hashtags ?? [],
    utmUrl: publication.payload.utmUrl,
    fullArticleUrl: publication.payload.fullArticleUrl,
    checklist: buildManualExportChecklist(publication),
    copyableText: copyableTextForPlatform(publication),
  };
}

export function copyableTextForPlatform(publication: ExternalPublication): string {
  const tags = publication.payload.hashtags?.length
    ? `\n\n${publication.payload.hashtags.map((h) => (h.startsWith("#") ? h : `#${h}`)).join(" ")}`
    : "";
  return [
    publication.payload.title,
    "",
    publication.payload.text,
    "",
    publication.payload.utmUrl,
    tags,
  ]
    .join("\n")
    .trim();
}

export function buildManualExportChecklist(publication: ExternalPublication): string[] {
  const platform = getExternalPlatform(publication.platformId);
  return [
    `Площадка: ${platform?.title ?? publication.platformId}`,
    "1. Скопируйте текст teaser",
    "2. Вставьте на площадку",
    publication.payload.imageIds?.length
      ? "3. Добавьте изображение из CMS"
      : "3. Добавьте обложку при необходимости",
    "4. Вставьте UTM-ссылку в CTA",
    "5. Опубликуйте вручную",
    "6. Вернитесь в CMS и укажите publishedUrl",
  ];
}

export function markPublicationAsManualExport(
  publication: ExternalPublication,
): ExternalPublication {
  return {
    ...publication,
    status: "manual-export",
    updatedAt: new Date().toISOString(),
  };
}

export function markManualPublicationAsPublished(
  publication: ExternalPublication,
  publishedUrl: string,
): ExternalPublication {
  return {
    ...publication,
    status: "published",
    publishedUrl,
    publishedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
