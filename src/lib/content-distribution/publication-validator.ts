import type { CMSContentItem } from "@/types/content-cms";
import type {
  ExternalPublication,
  PublicationValidationResult,
} from "@/types/content-distribution";
import { getExternalPlatform } from "@/data/external-content-platforms";
import {
  CLICKBAIT_PATTERNS,
  FULL_DUPLICATE_THRESHOLD,
  SITE_HOST,
} from "@/data/distribution-rules";

export function isFullArticlePublished(item: CMSContentItem | null): boolean {
  if (!item) return false;
  return item.status === "published" && item.indexing.indexable;
}

export function validatePublication(
  publication: ExternalPublication,
  contentItem?: CMSContentItem | null,
  fullArticleBody?: string,
): PublicationValidationResult {
  const warnings: string[] = [];
  const blockers: string[] = [];
  const platform = getExternalPlatform(publication.platformId);

  const flags: PublicationValidationResult["flags"] = {
    hasUTM: false,
    hasCTA: false,
    linksToFullArticle: false,
    fullArticlePublished: false,
    noFakeClaim: true,
    noDeceptiveClickbait: true,
    notFullDuplicate: true,
    platformExists: Boolean(platform),
    adapterAvailable: false,
    manualExportRequired: false,
  };

  if (!platform) {
    blockers.push("Платформа не найдена в registry");
  } else if (platform.adapterStatus === "disabled") {
    blockers.push("Платформа отключена");
  } else if (platform.adapterStatus === "future") {
    blockers.push("Платформа в статусе future");
  }

  if (!publication.payload.text?.trim()) blockers.push("Нет текста teaser");
  if (!publication.payload.title?.trim()) warnings.push("Нет title");

  if (publication.payload.utmUrl?.includes("utm_medium=content_teaser")) {
    flags.hasUTM = true;
  } else {
    blockers.push("Нет UTM-ссылки");
  }

  flags.hasCTA =
    publication.validation.hasCTA ||
    publication.payload.text.toLowerCase().includes("stroistroy") ||
    Boolean(publication.payload.utmUrl);
  if (!flags.hasCTA) warnings.push("Рекомендуется явный CTA");

  try {
    const full = new URL(publication.payload.fullArticleUrl);
    const utm = new URL(publication.payload.utmUrl);
    flags.linksToFullArticle =
      full.hostname.includes(SITE_HOST) && full.pathname === utm.pathname;
    if (!flags.linksToFullArticle) blockers.push("UTM не ведёт на fullArticleUrl");
  } catch {
    blockers.push("Некорректный fullArticleUrl или utmUrl");
  }

  flags.fullArticlePublished = publication.validation.fullArticlePublished;
  if (contentItem) {
    flags.fullArticlePublished = isFullArticlePublished(contentItem);
  }
  if (!flags.fullArticlePublished) {
    blockers.push("Полная статья не опубликована на сайте (published + indexable)");
  }

  const text = `${publication.payload.title} ${publication.payload.text}`;
  if (CLICKBAIT_PATTERNS.some((re) => re.test(text))) {
    flags.noDeceptiveClickbait = false;
    blockers.push("Возможный deceptive clickbait");
  }

  if (/мы построили|клиент сказал|реальный отзыв/i.test(text)) {
    flags.noFakeClaim = false;
    blockers.push("Возможный fake claim");
  }

  if (fullArticleBody && publication.payload.text.length > 100) {
    const ratio = similarityRatio(publication.payload.text, fullArticleBody);
    if (ratio >= FULL_DUPLICATE_THRESHOLD) {
      flags.notFullDuplicate = false;
      blockers.push("Teaser слишком похож на полную статью (дубль)");
    }
  }

  if (platform) {
    flags.manualExportRequired =
      platform.adapterStatus === "manual" || platform.id === "manual-export";
    flags.adapterAvailable =
      platform.adapterStatus === "active" || flags.manualExportRequired;
    if (platform.adapterStatus === "needs-api") {
      warnings.push("Платформа требует API — используйте manual export или n8n");
    }
  }

  const requiresManualExport = flags.manualExportRequired;
  const requiresAPI = platform?.adapterStatus === "needs-api" && !requiresManualExport;

  const canApprove = blockers.length === 0;
  const canSchedule = canApprove && publication.status === "approved";
  const canPublish =
    canApprove &&
    platform?.adapterStatus === "active" &&
    !requiresManualExport &&
    !requiresAPI;

  return {
    valid: blockers.length === 0,
    warnings,
    blockers,
    flags,
    canApprove,
    canSchedule,
    canPublish,
    requiresManualExport,
    requiresAPI,
  };
}

function similarityRatio(a: string, b: string): number {
  const sa = a.toLowerCase().slice(0, 2000);
  const sb = b.toLowerCase().slice(0, 2000);
  if (!sa || !sb) return 0;
  const shorter = sa.length < sb.length ? sa : sb;
  const longer = sa.length < sb.length ? sb : sa;
  return shorter.length / longer.length > 0.5 && longer.includes(shorter.slice(0, 200))
    ? 0.9
    : 0.3;
}
