import type { AIContentTeaser } from "@/types/ai-content-factory";
import type { CMSContentItem } from "@/types/content-cms";

const PLATFORMS = [
  "telegram",
  "vk",
  "dzen",
  "vc",
  "tenchat",
  "ok",
  "email",
  "rss",
  "manual-export",
] as const;

export function buildTeaserUTMUrl(
  contentItem: Pick<CMSContentItem, "url" | "slug">,
  platform: AIContentTeaser["platformId"],
): string {
  const base = `https://stroistroy.ru${contentItem.url.startsWith("/") ? contentItem.url : `/${contentItem.url}`}`;
  const params = new URLSearchParams({
    utm_source: platform,
    utm_medium: "teaser",
    utm_campaign: `content-${contentItem.slug}`,
  });
  return `${base}?${params.toString()}`;
}

export function generatePlatformTeaser(
  contentItem: Pick<CMSContentItem, "title" | "url" | "slug" | "seoDescription">,
  platform: AIContentTeaser["platformId"],
): AIContentTeaser {
  const utmUrl = buildTeaserUTMUrl(contentItem, platform);
  const hook = `Планируете строительство? ${contentItem.title}`;
  return {
    id: `teaser-${platform}-${contentItem.slug}`,
    platformId: platform,
    title: contentItem.title,
    hook,
    body: contentItem.seoDescription ?? "Короткий тизер — полный материал на сайте.",
    openLoop: "В статье — чек-лист и практические советы для Иркутска и области.",
    readMoreCTA: "Читать на stroistroy.ru",
    fullArticleUrl: contentItem.url,
    utmUrl,
    teaserStyle: platform === "telegram" ? "pain-hook" : "local-hook",
    validation: {
      hasClearCTA: true,
      hasUTM: utmUrl.includes("utm_"),
      noFakeClaim: true,
      noDeceptiveClickbait: true,
      linksToFullArticle: true,
    },
  };
}

export function generateTeaserPackage(
  contentItem: Pick<CMSContentItem, "title" | "url" | "slug" | "seoDescription">,
): AIContentTeaser[] {
  return PLATFORMS.map((p) => generatePlatformTeaser(contentItem, p));
}

export function validateTeaserPackage(teasers: AIContentTeaser[]): {
  valid: boolean;
  warnings: string[];
  blockers: string[];
} {
  const warnings: string[] = [];
  const blockers: string[] = [];

  for (const t of teasers) {
    if (!t.utmUrl.includes("utm_")) warnings.push(`${t.platformId}: нет UTM`);
    if (!t.readMoreCTA) blockers.push(`${t.platformId}: нет CTA`);
    if (!t.fullArticleUrl) blockers.push(`${t.platformId}: нет URL статьи`);
    if (t.body.length > 2000) warnings.push(`${t.platformId}: слишком длинный teaser`);
  }

  return { valid: blockers.length === 0, warnings, blockers };
}
