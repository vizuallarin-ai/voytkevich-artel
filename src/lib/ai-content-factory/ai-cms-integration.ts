import type { AIContentGenerationOutput } from "@/types/ai-content-factory";
import type { CMSContentItem, CMSContentKind } from "@/types/content-cms";
import { contentRepository } from "@/lib/content-cms/content-repository";
import { canTransitionContentStatus } from "@/lib/content-cms/content-workflow";
import {
  createAuditLogForAIGeneration,
  updateGenerationOutput,
} from "@/lib/ai-content-factory/ai-generation-audit-log";
import type { AIContentGenerationRequest } from "@/types/ai-content-factory";

export function mapAIOutputToCMSContentItem(
  output: AIContentGenerationOutput,
): Partial<CMSContentItem> {
  const slug = output.result.slug ?? slugify(output.result.title);
  const kind = mapContentKind(output.result.contentKind);
  const url = urlForKind(kind, slug);

  return {
    kind,
    slug,
    url,
    title: output.result.title,
    h1: output.result.h1 ?? output.result.title,
    seoTitle: output.result.seoTitle ?? output.result.metadata?.title,
    seoDescription: output.result.seoDescription ?? output.result.metadata?.description,
    status: "ai-generated",
    source: {
      origin: "ai",
      originId: output.id,
      createdBy: "ai-content-factory",
    },
    indexing: {
      indexable: false,
      sitemap: false,
      canonicalUrl: output.result.metadata?.canonicalUrl,
      noindexReason: "AI-generated — требуется review",
      robots: { index: false, follow: true },
    },
    quality: {
      score: qualityScoreFromLevel(output.validation.qualityLevel),
      level: output.validation.qualityLevel === "strong" ? "good" : output.validation.qualityLevel,
      warnings: output.validation.warnings,
      blockers: output.validation.blockers,
      canPublish: false,
      shouldNoindex: true,
      requiresHumanReview: true,
      requiresExpertReview: output.validation.requiredActions.includes("needs-expert-review"),
      requiresFactCheck: output.validation.requiredActions.includes("needs-fact-check"),
      requiresSource: output.validation.requiredActions.includes("needs-source"),
      requiresFictionNotice: output.validation.flags.hasFictionNotice === false &&
        output.result.notes?.some((n) => n.includes("вымышлен")),
    },
    seo: {
      targetKeyword: output.result.brief?.targetKeyword,
      secondaryKeywords: output.result.brief?.secondaryKeywords,
      thinContentRisk: output.validation.flags.possibleThinContent ? "medium" : "low",
    },
    distribution: {
      teaserReady: Boolean(output.result.teasers?.length),
      allowExternalTeasers: false,
      platforms: output.result.teasers?.map((t) => t.platformId) ?? [],
      canonicalFullArticleUrl: output.result.teasers?.[0]?.fullArticleUrl,
      utmCampaignId: `ai-${output.id.slice(0, 8)}`,
    },
    related: mapRelated(output),
    ethics: {
      isFictionalized: output.result.notes?.some((n) => n.toLowerCase().includes("вымышлен")),
      fictionNoticePresent: output.validation.flags.hasFictionNotice,
      fakeClaimRisk: output.validation.flags.possibleFakeClaim ? "medium" : "low",
    },
    factCheck: {
      status: output.validation.requiredActions.includes("needs-fact-check")
        ? "pending"
        : output.validation.flags.hasSources
          ? "not-required"
          : "not-required",
    },
    workflow: {
      reviewNotes: `AI generation ${output.id}. ${output.validation.blockers.length} blockers.`,
      updatedAt: new Date().toISOString(),
    },
  };
}

export async function saveAIOutputAsGeneratedDraft(
  output: AIContentGenerationOutput,
  request?: AIContentGenerationRequest,
): Promise<CMSContentItem> {
  if (!output.cms.canSaveToCMS && output.validation.blockers.some((b) => b !== "needs-source")) {
    throw new Error("Нельзя сохранить: есть blockers");
  }

  const mapped = mapAIOutputToCMSContentItem(output);
  const item = await contentRepository.createContent(mapped);

  const updated = updateGenerationOutput(output.id, {
    status: "saved-to-cms",
    cms: {
      ...output.cms,
      canSaveToCMS: true,
      savedContentId: item.id,
      targetStatus: "ai-generated",
      reviewRequired: true,
    },
  });

  if (request && updated) {
    createAuditLogForAIGeneration(updated, request, "saved-to-cms");
  }

  return item;
}

export function attachAIValidationToCMSItem(
  output: AIContentGenerationOutput,
): Partial<CMSContentItem> {
  return {
    quality: {
      score: qualityScoreFromLevel(output.validation.qualityLevel),
      level: output.validation.qualityLevel === "strong" ? "good" : output.validation.qualityLevel,
      warnings: output.validation.warnings,
      blockers: output.validation.blockers,
      canPublish: false,
      shouldNoindex: true,
      requiresHumanReview: true,
    },
  };
}

export function attachAITeasersToCMSItem(
  output: AIContentGenerationOutput,
): Partial<CMSContentItem> {
  return {
    distribution: {
      teaserReady: Boolean(output.result.teasers?.length),
      allowExternalTeasers: false,
      platforms: output.result.teasers?.map((t) => t.platformId) ?? [],
      canonicalFullArticleUrl: output.result.teasers?.[0]?.fullArticleUrl,
    },
  };
}

export async function sendGeneratedContentToReview(
  contentId: string,
  output: AIContentGenerationOutput,
  request?: AIContentGenerationRequest,
): Promise<CMSContentItem> {
  const item = await contentRepository.getContentById(contentId);
  if (!item) throw new Error("CMS item not found");

  if (item.status !== "ai-generated" && item.status !== "draft") {
    throw new Error(`Отправка на review из статуса ${item.status} недоступна`);
  }

  const transition = canTransitionContentStatus(item, "review");
  if (!transition.ok) throw new Error(transition.reason ?? "Transition blocked");

  if (!output.validation.canSendToReview) {
    throw new Error("Validation blockers — нельзя отправить на review");
  }

  const updated = await contentRepository.updateContent(contentId, {
    status: "review",
    workflow: {
      reviewNotes: `Отправлено из AI factory (${output.id})`,
      updatedAt: new Date().toISOString(),
    },
  });

  updateGenerationOutput(output.id, { status: "saved-to-cms" });
  if (request) createAuditLogForAIGeneration(output, request, "sent-to-review");

  return updated;
}

function mapContentKind(
  kind: AIContentGenerationOutput["result"]["contentKind"],
): CMSContentKind {
  switch (kind) {
    case "programmatic-page":
      return "programmatic-page";
    case "technical-article":
      return "technical-article";
    case "editorial-content":
      return "editorial-content";
    case "news":
      return "news";
    case "digest":
      return "digest";
    default:
      return "future-ai-draft";
  }
}

function urlForKind(kind: CMSContentKind, slug: string): string {
  if (kind === "programmatic-page") return `/catalog/${slug}`;
  if (kind === "technical-article") return `/knowledge/${slug}`;
  return `/blog/${slug}`;
}

function mapRelated(output: AIContentGenerationOutput): CMSContentItem["related"] {
  const links = output.result.relatedLinks ?? [];
  return {
    leadMagnets: links.filter((l) => l.type === "lead-magnet").map((l) => l.url),
    programmaticPages: links.filter((l) => l.type === "programmatic").map((l) => l.url),
    technicalArticles: links.filter((l) => l.type === "technical").map((l) => l.url),
    editorialContent: links.filter((l) => l.type === "editorial").map((l) => l.url),
    projectCategories: links.filter((l) => l.type === "category").map((l) => l.url),
  };
}

function qualityScoreFromLevel(level: string): number {
  switch (level) {
    case "strong":
      return 85;
    case "good":
      return 72;
    case "acceptable":
      return 55;
    default:
      return 35;
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-zа-яё0-9\s-]/gi, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

export { createAuditLogForAIGeneration };
