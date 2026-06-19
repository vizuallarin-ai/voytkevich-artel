import type {
  AIContentGenerationMode,
  AIContentGenerationOutput,
  AIContentGenerationRequest,
  AIContentTeaser,
} from "@/types/ai-content-factory";
import type { AIContentValidationResult } from "@/types/ai-content-validation";
import {
  AI_FORBIDDEN_PHRASES,
  AI_REQUIRED_DISCLAIMER_MARKERS,
} from "@/data/ai-content-safety-rules";
import { getGenerationModeMeta } from "@/data/ai-content-generation-modes";
import { modeRequiresSource } from "@/lib/ai-content-factory/ai-provider";

const EMPTY_FLAGS: AIContentValidationResult["flags"] = {
  hasCTA: false,
  hasFAQ: false,
  hasRelatedLinks: false,
  hasMetadata: false,
  hasDisclaimer: false,
  hasSources: false,
  hasFictionNotice: false,
  hasTeasers: false,
  possibleFakeClaim: false,
  possibleFakeReview: false,
  possibleFakeCase: false,
  possibleFakeSource: false,
  possibleDangerousInstruction: false,
  possibleUnsupportedLegalClaim: false,
  possibleExactPricePromise: false,
  possibleThinContent: false,
  possibleDuplicateIntent: false,
  possibleDeceptiveClickbait: false,
};

export function validateAIContentOutput(
  output: AIContentGenerationOutput,
  request?: AIContentGenerationRequest,
): AIContentValidationResult {
  const warnings: string[] = [];
  const blockers: string[] = [];
  const requiredActions: string[] = [];
  const flags = { ...EMPTY_FLAGS };
  const text = collectText(output);

  if (!output.result.title?.trim()) blockers.push("Отсутствует title");

  if (output.result.cta?.primary) flags.hasCTA = true;
  else if (!isPartialMode(request?.mode)) blockers.push("Отсутствует CTA");

  if (output.result.faq?.length) flags.hasFAQ = true;
  else if (requiresFaq(request?.mode)) warnings.push("Рекомендуется добавить FAQ");

  if (output.result.relatedLinks?.length) flags.hasRelatedLinks = true;
  else if (!isPartialOnlyLinks(request?.mode)) warnings.push("Нет related links");

  if (output.result.metadata?.title) flags.hasMetadata = true;

  flags.hasDisclaimer = AI_REQUIRED_DISCLAIMER_MARKERS.some((m) =>
    text.toLowerCase().includes(m.toLowerCase()),
  );
  if (request?.constraints.requiresDisclaimer && !flags.hasDisclaimer) {
    warnings.push("Требуется дисклеймер");
    requiredActions.push("add-disclaimer");
  }

  const hasSources =
    (request?.input.sourceUrls?.length ?? 0) > 0 || Boolean(request?.input.sourceNotes?.trim());
  flags.hasSources = hasSources;

  if (modeRequiresSource(request?.mode ?? "content-brief") && !hasSources) {
    blockers.push("needs-source");
    requiredActions.push("needs-source");
  }

  if (request?.constraints.requiresFactCheck) {
    requiredActions.push("needs-fact-check");
    warnings.push("Требуется fact-check");
  }
  if (request?.constraints.requiresExpertReview) {
    requiredActions.push("needs-expert-review");
    warnings.push("Требуется expert review");
  }

  flags.hasFictionNotice =
    text.toLowerCase().includes("вымышлен") ||
    Boolean(output.result.notes?.some((n) => n.toLowerCase().includes("вымышлен")));
  if (
    request?.constraints.allowFictionalizedStory &&
    !flags.hasFictionNotice &&
    request.mode === "editorial-content-draft"
  ) {
    warnings.push("Добавьте fiction notice для вымышленной истории");
  }

  if (output.result.teasers?.length) {
    flags.hasTeasers = true;
    validateTeasers(output.result.teasers, warnings, blockers, flags);
  }

  scanForbiddenPhrases(text, flags, warnings, blockers);

  const bodyLen = text.length;
  if (bodyLen < 200 && !isPartialMode(request?.mode)) {
    flags.possibleThinContent = true;
    warnings.push("Возможно thin content");
  }

  if (output.result.metadata?.robots?.index === true) {
    blockers.push("AI metadata не должна быть indexable");
  }

  const qualityLevel = scoreQuality(blockers, warnings, flags);
  const canSaveToCMS = blockers.length === 0 || blockers.every((b) => b === "needs-source");
  const canSendToReview = blockers.length === 0;

  return {
    valid: blockers.length === 0,
    qualityLevel,
    warnings: [...warnings, ...(output.result.warnings ?? [])],
    blockers,
    flags,
    requiredActions,
    canSaveToCMS,
    canSendToReview,
    canApprove: false,
    canPublish: false,
  };
}

function validateTeasers(
  teasers: AIContentTeaser[],
  warnings: string[],
  blockers: string[],
  flags: AIContentValidationResult["flags"],
) {
  for (const t of teasers) {
    if (!t.utmUrl.includes("utm_")) {
      warnings.push(`Teaser ${t.platformId}: нет UTM`);
    }
    if (!t.readMoreCTA) warnings.push(`Teaser ${t.platformId}: нет CTA`);
    if (!t.validation?.linksToFullArticle && !t.fullArticleUrl) {
      blockers.push(`Teaser ${t.platformId}: нет ссылки на статью`);
    }
    if (t.validation?.noDeceptiveClickbait === false) {
      flags.possibleDeceptiveClickbait = true;
      warnings.push(`Teaser ${t.platformId}: возможный кликбейт`);
    }
  }
}

function scanForbiddenPhrases(
  text: string,
  flags: AIContentValidationResult["flags"],
  warnings: string[],
  blockers: string[],
) {
  const lower = text.toLowerCase();
  if (lower.includes("клиент сказал") || lower.includes("реальный отзыв")) {
    flags.possibleFakeReview = true;
    blockers.push("Возможный фейковый отзыв");
  }
  if (lower.includes("мы построили этот") || lower.includes("наш объект в")) {
    flags.possibleFakeCase = true;
    warnings.push("Возможный фейковый кейс — проверьте источник");
  }
  if (/\d+\s*₽|от\s*\d+\s*руб/i.test(text)) {
    flags.possibleExactPricePromise = true;
    blockers.push("Возможное обещание точной цены");
  }
  if (lower.includes("точная смета онлайн")) {
    flags.possibleExactPricePromise = true;
    blockers.push("Обещание точной сметы");
  }
  if (lower.includes("согласно новому закону") && !lower.includes("источник")) {
    flags.possibleUnsupportedLegalClaim = true;
    warnings.push("Нормативное утверждение без источника");
  }
  for (const phrase of AI_FORBIDDEN_PHRASES) {
    if (phrase.startsWith("от \\")) continue;
    if (lower.includes(phrase.toLowerCase())) {
      flags.possibleFakeClaim = true;
      warnings.push(`Подозрительная фраза: ${phrase}`);
    }
  }
}

function collectText(output: AIContentGenerationOutput): string {
  const parts = [
    output.result.title,
    output.result.article?.intro,
    output.result.article?.body,
    output.result.article?.conclusion,
    ...(output.result.article?.blocks?.map((b) => b.content) ?? []),
    ...(output.result.faq?.map((f) => `${f.question} ${f.answer}`) ?? []),
    output.result.cta?.primary,
    ...(output.result.notes ?? []),
  ];
  return parts.filter(Boolean).join(" ");
}

function isPartialMode(mode?: AIContentGenerationMode): boolean {
  return (
    mode === "content-brief" ||
    mode === "faq-only" ||
    mode === "metadata-only" ||
    mode === "cta-only" ||
    mode === "related-links-only" ||
    mode === "teaser-package"
  );
}

function isPartialOnlyLinks(mode?: AIContentGenerationMode): boolean {
  return mode === "related-links-only" || mode === "cta-only" || mode === "metadata-only";
}

function requiresFaq(mode?: AIContentGenerationMode): boolean {
  const meta = mode ? getGenerationModeMeta(mode) : undefined;
  return (
    meta?.contentKind === "programmatic-page" ||
    meta?.contentKind === "technical-article" ||
    mode === "programmatic-page-draft"
  );
}

function scoreQuality(
  blockers: string[],
  warnings: string[],
  flags: AIContentValidationResult["flags"],
): AIContentValidationResult["qualityLevel"] {
  if (blockers.length > 1 || flags.possibleFakeReview) return "poor";
  if (blockers.length === 1) return "acceptable";
  if (warnings.length > 3) return "acceptable";
  if (flags.hasCTA && flags.hasFAQ && flags.hasRelatedLinks) return "strong";
  if (flags.hasCTA) return "good";
  return "acceptable";
}
