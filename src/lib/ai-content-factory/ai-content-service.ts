import type {
  AIContentBrief,
  AIContentGenerationMode,
  AIContentGenerationOutput,
  AIContentGenerationRequest,
  AIContentGenerationStatus,
  AIContentTeaser,
} from "@/types/ai-content-factory";
import { getGenerationModeMeta } from "@/data/ai-content-generation-modes";
import { buildAIProviderRequest } from "@/lib/ai-content-factory/ai-prompt-builder";
import { getActiveAIProvider, getProviderModelLabel } from "@/lib/ai-content-factory/ai-provider";
import { parseAIResponse } from "@/lib/ai-content-factory/ai-output-parser";
import { validateAIContentOutput } from "@/lib/ai-content-factory/ai-output-validator";
import { estimateGenerationCost } from "@/lib/ai-content-factory/ai-generation-costs";
import {
  createAuditLogForAIGeneration,
  saveGenerationOutput,
  updateGenerationOutput,
} from "@/lib/ai-content-factory/ai-generation-audit-log";
import {
  saveAIOutputAsGeneratedDraft,
  sendGeneratedContentToReview,
} from "@/lib/ai-content-factory/ai-cms-integration";
import {
  trackAIContentGenerationCompleted,
  trackAIContentGenerationFailed,
  trackAIContentSavedToCMS,
  trackAIContentSentToReview,
  trackAIContentValidationFailed,
  trackAITeaserPackageGenerated,
} from "@/lib/ai-content-factory/ai-content-analytics";

export function createGenerationRequest(
  partial: Omit<AIContentGenerationRequest, "id" | "createdAt" | "constraints"> & {
    constraints?: Partial<AIContentGenerationRequest["constraints"]>;
  },
): AIContentGenerationRequest {
  return {
    ...partial,
    id: `req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    constraints: {
      language: "ru",
      region: "irkutsk",
      toneOfVoice: "экспертный, дружелюбный",
      requiresDisclaimer: true,
      requiresFactCheck: false,
      requiresExpertReview: false,
      allowFictionalizedStory: false,
      allowExternalTeasers: true,
      autoPublish: false,
      ...partial.constraints,
    },
    createdAt: new Date().toISOString(),
  };
}

async function runGeneration(
  request: AIContentGenerationRequest,
): Promise<AIContentGenerationOutput> {
  const outputId = `gen-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  let status: AIContentGenerationStatus = "generating";

  try {
    if (parsedBlockerFromSource(request)) {
      const failed = buildOutput(outputId, request, status, { blocker: "needs-source" }, undefined);
      failed.status = "failed";
      failed.validation = validateAIContentOutput(failed, request);
      saveGenerationOutput(failed);
      trackAIContentValidationFailed(analyticsPayload(failed, request));
      return failed;
    }

    const { provider, isProduction } = await getActiveAIProvider();
    const providerRequest = buildAIProviderRequest(request);
    status = "generating";
    const response = await provider.generate(providerRequest);
    status = "validating";

    const parsed = parseAIResponse(response.parsed, response.text);
    if (parsed.blocker === "needs-source") {
      const failed = buildOutput(outputId, request, "failed", parsed, {
        provider: provider.id,
        model: getProviderModelLabel(provider),
        inputTokens: response.usage?.inputTokens,
        outputTokens: response.usage?.outputTokens,
        estimatedCost: estimateGenerationCost(
          response.usage?.inputTokens,
          response.usage?.outputTokens,
          provider.id,
        ),
      });
      failed.validation = validateAIContentOutput(failed, request);
      saveGenerationOutput(failed);
      createAuditLogForAIGeneration(failed, request, "needs-source");
      return failed;
    }

    const output = buildOutput(outputId, request, "completed", parsed, {
      provider: provider.id,
      model: getProviderModelLabel(provider),
      inputTokens: response.usage?.inputTokens,
      outputTokens: response.usage?.outputTokens,
      estimatedCost: estimateGenerationCost(
        response.usage?.inputTokens,
        response.usage?.outputTokens,
        provider.id,
      ),
      isProduction,
    });

    output.validation = validateAIContentOutput(output, request);
    output.cms.canSaveToCMS = output.validation.canSaveToCMS;

    if (!output.validation.valid) {
      trackAIContentValidationFailed(analyticsPayload(output, request));
    }

    saveGenerationOutput(output);
    createAuditLogForAIGeneration(output, request, "completed");
    trackAIContentGenerationCompleted(analyticsPayload(output, request));
    return output;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const failed = buildEmptyFailed(outputId, request, message);
    saveGenerationOutput(failed);
    createAuditLogForAIGeneration(failed, request, "failed");
    trackAIContentGenerationFailed({ ...analyticsPayload(failed, request), error: message });
    return failed;
  }
}

function parsedBlockerFromSource(request: AIContentGenerationRequest): boolean {
  const meta = getGenerationModeMeta(request.mode);
  if (!meta?.requiresSource) return false;
  return (
    (request.input.sourceUrls?.length ?? 0) === 0 && !request.input.sourceNotes?.trim()
  );
}

function buildOutput(
  id: string,
  request: AIContentGenerationRequest,
  status: AIContentGenerationStatus,
  parsed: Record<string, unknown>,
  usage?: AIContentGenerationOutput["usage"] & { isProduction?: boolean },
): AIContentGenerationOutput {
  const modeMeta = getGenerationModeMeta(request.mode);
  const contentKind = modeMeta?.contentKind ?? "partial";

  const brief = request.mode === "content-brief" ? mapBrief(parsed) : undefined;
  const teasers =
    request.mode === "teaser-package"
      ? mapTeasers(parsed)
      : undefined;

  const title =
    (parsed.title as string) ??
    (parsed.topic as string) ??
    request.input.topic;

  return {
    id,
    requestId: request.id,
    status,
    result: {
      title,
      h1: (parsed.h1 as string) ?? title,
      slug: (parsed.slug as string) ?? slugify(title),
      seoTitle: (parsed.seoTitle as string) ?? (parsed.metadata as { title?: string })?.title,
      seoDescription:
        (parsed.seoDescription as string) ??
        (parsed.metadata as { description?: string })?.description,
      contentKind: contentKind === "partial" ? inferPartialKind(request.mode) : contentKind,
      brief,
      article: mapArticle(parsed),
      faq: (parsed.faq as AIContentGenerationOutput["result"]["faq"]) ?? undefined,
      cta: (parsed.cta as AIContentGenerationOutput["result"]["cta"]) ?? defaultCta(),
      relatedLinks:
        (parsed.relatedLinks as AIContentGenerationOutput["result"]["relatedLinks"]) ?? [],
      metadata: mapMetadata(parsed),
      teasers,
      warnings: (parsed.warnings as string[]) ?? [],
      notes: (parsed.notes as string[]) ?? [],
    },
    validation: {
      valid: false,
      qualityLevel: "poor",
      warnings: [],
      blockers: parsed.blocker ? [String(parsed.blocker)] : [],
      flags: {
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
      },
      requiredActions: [],
      canSaveToCMS: false,
      canSendToReview: false,
      canApprove: false,
      canPublish: false,
    },
    cms: {
      canSaveToCMS: false,
      targetStatus: "ai-generated",
      reviewRequired: true,
    },
    usage: usage
      ? {
          provider: usage.provider,
          model: usage.model,
          inputTokens: usage.inputTokens,
          outputTokens: usage.outputTokens,
          estimatedCost: usage.estimatedCost,
        }
      : undefined,
    createdAt: new Date().toISOString(),
  };
}

function buildEmptyFailed(
  id: string,
  request: AIContentGenerationRequest,
  error: string,
): AIContentGenerationOutput {
  const output = buildOutput(id, request, "failed", {}, undefined);
  output.result.warnings = [error];
  output.validation = validateAIContentOutput(output, request);
  return output;
}

function mapBrief(parsed: Record<string, unknown>): AIContentBrief {
  return {
    topic: String(parsed.topic ?? ""),
    targetKeyword: parsed.targetKeyword as string | undefined,
    secondaryKeywords: parsed.secondaryKeywords as string[] | undefined,
    contentGoal: (parsed.contentGoal as AIContentBrief["contentGoal"]) ?? "lead-generation",
    audience: String(parsed.audience ?? ""),
    searchIntent: (parsed.searchIntent as AIContentBrief["searchIntent"]) ?? "commercial",
    recommendedStructure:
      (parsed.recommendedStructure as AIContentBrief["recommendedStructure"]) ?? [],
    requiredBlocks: (parsed.requiredBlocks as string[]) ?? [],
    requiredCTA: String(parsed.requiredCTA ?? ""),
    requiredLeadMagnet: parsed.requiredLeadMagnet as string | undefined,
    requiredDisclaimers: parsed.requiredDisclaimers as string[] | undefined,
    relatedPages: (parsed.relatedPages as string[]) ?? [],
    relatedArticles: (parsed.relatedArticles as string[]) ?? [],
    relatedProjects: (parsed.relatedProjects as string[]) ?? [],
    qualityRequirements: (parsed.qualityRequirements as string[]) ?? [],
    risksToAvoid: (parsed.risksToAvoid as string[]) ?? [],
  };
}

function mapArticle(parsed: Record<string, unknown>) {
  if (!parsed.intro && !parsed.body && !parsed.blocks) return undefined;
  const blocks = Array.isArray(parsed.blocks)
    ? (parsed.blocks as { id: string; type: string; title?: string; content: string }[])
    : [];
  return {
    intro: String(parsed.intro ?? ""),
    body: String(parsed.body ?? ""),
    blocks,
    conclusion: parsed.conclusion as string | undefined,
  };
}

function mapMetadata(parsed: Record<string, unknown>) {
  const meta = parsed.metadata as AIContentGenerationOutput["result"]["metadata"];
  if (meta) return { ...meta, robots: meta.robots ?? { index: false, follow: true } };
  return undefined;
}

function mapTeasers(parsed: Record<string, unknown>): AIContentTeaser[] | undefined {
  const raw = parsed.teasers as AIContentTeaser[] | undefined;
  if (!raw?.length) return undefined;
  return raw.map((t) => ({
    ...t,
    validation: t.validation ?? {
      hasClearCTA: Boolean(t.readMoreCTA),
      hasUTM: t.utmUrl?.includes("utm_") ?? false,
      noFakeClaim: true,
      noDeceptiveClickbait: true,
      linksToFullArticle: Boolean(t.fullArticleUrl),
    },
  }));
}

function inferPartialKind(
  mode: AIContentGenerationMode,
): AIContentGenerationOutput["result"]["contentKind"] {
  if (mode === "news-draft") return "news";
  if (mode === "digest-draft") return "digest";
  return "partial";
}

function defaultCta() {
  return {
    primary: "Получить консультацию",
    secondary: "Рассчитать бюджет",
    sourceCTA: "Оставить заявку",
  };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-zа-яё0-9\s-]/gi, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

function analyticsPayload(
  output: AIContentGenerationOutput,
  request: AIContentGenerationRequest,
) {
  return {
    generationId: output.id,
    mode: request.mode,
    contentKind: output.result.contentKind,
    topic: request.input.topic,
    clusterId: request.input.clusterId,
    rubricId: request.input.rubricId,
    authorId: request.input.authorId,
    validationLevel: output.validation.qualityLevel,
    blockersCount: output.validation.blockers.length,
    warningsCount: output.validation.warnings.length,
    savedContentId: output.cms.savedContentId,
    provider: output.usage?.provider,
    model: output.usage?.model,
    usage: output.usage,
  };
}

export async function generateContentBrief(request: AIContentGenerationRequest) {
  return runGeneration({ ...request, mode: "content-brief" });
}

export async function generateProgrammaticPageDraft(request: AIContentGenerationRequest) {
  return runGeneration({ ...request, mode: "programmatic-page-draft" });
}

export async function generateTechnicalArticleDraft(request: AIContentGenerationRequest) {
  return runGeneration({ ...request, mode: "technical-article-draft" });
}

export async function generateEditorialContentDraft(request: AIContentGenerationRequest) {
  return runGeneration({ ...request, mode: "editorial-content-draft" });
}

export async function generateNewsDraft(request: AIContentGenerationRequest) {
  return runGeneration({ ...request, mode: "news-draft" });
}

export async function generateDigestDraft(request: AIContentGenerationRequest) {
  return runGeneration({ ...request, mode: "digest-draft" });
}

export async function generateFAQOnly(request: AIContentGenerationRequest) {
  return runGeneration({ ...request, mode: "faq-only" });
}

export async function generateMetadataOnly(request: AIContentGenerationRequest) {
  return runGeneration({ ...request, mode: "metadata-only" });
}

export async function generateCTAOnly(request: AIContentGenerationRequest) {
  return runGeneration({ ...request, mode: "cta-only" });
}

export async function generateRelatedLinksOnly(request: AIContentGenerationRequest) {
  return runGeneration({ ...request, mode: "related-links-only" });
}

export async function generateTeaserPackage(request: AIContentGenerationRequest) {
  const output = await runGeneration({ ...request, mode: "teaser-package" });
  if (output.status === "completed") {
    trackAITeaserPackageGenerated(analyticsPayload(output, request));
  }
  return output;
}

export { validateAIContentOutput };

export async function saveAIOutputToCMS(
  output: AIContentGenerationOutput,
  request?: AIContentGenerationRequest,
) {
  const item = await saveAIOutputAsGeneratedDraft(output, request);
  trackAIContentSavedToCMS({
    generationId: output.id,
    savedContentId: item.id,
    mode: request?.mode,
  });
  return item;
}

export async function sendAIOutputToReview(
  output: AIContentGenerationOutput,
  request?: AIContentGenerationRequest,
) {
  let contentId = output.cms.savedContentId;
  if (!contentId) {
    const item = await saveAIOutputToCMS(output, request);
    contentId = item.id;
  }
  const updated = await sendGeneratedContentToReview(contentId, output, request);
  trackAIContentSentToReview({
    generationId: output.id,
    savedContentId: contentId,
  });
  return updated;
}

export function discardAIOutput(outputId: string) {
  return updateGenerationOutput(outputId, { status: "rejected" });
}

const MODE_HANDLERS: Record<
  AIContentGenerationMode,
  (r: AIContentGenerationRequest) => Promise<AIContentGenerationOutput>
> = {
  "content-brief": generateContentBrief,
  "programmatic-page-draft": generateProgrammaticPageDraft,
  "technical-article-draft": generateTechnicalArticleDraft,
  "editorial-content-draft": generateEditorialContentDraft,
  "news-draft": generateNewsDraft,
  "digest-draft": generateDigestDraft,
  "faq-only": generateFAQOnly,
  "metadata-only": generateMetadataOnly,
  "cta-only": generateCTAOnly,
  "related-links-only": generateRelatedLinksOnly,
  "teaser-package": generateTeaserPackage,
};

export async function generateByMode(request: AIContentGenerationRequest) {
  const handler = MODE_HANDLERS[request.mode];
  return handler(request);
}
