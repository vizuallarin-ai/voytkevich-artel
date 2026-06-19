import type { VisualAsset, VisualAssetKind, VisualAspectRatio } from "@/types/visual-content";
import type { ImageGenerationMode, ImageGenerationRequest } from "@/types/image-generation";
import { createVisualBrief, visualBriefToText, type VisualBriefInput } from "@/lib/visual-content/image-brief-builder";
import {
  buildImagePrompt,
  buildNegativePrompt,
} from "@/lib/visual-content/image-prompt-builder";
import { validateVisualAsset } from "@/lib/visual-content/image-validation";
import { buildImageAlt } from "@/lib/visual-content/image-alt-builder";
import { imageAssetRepository, seedDemoVisualAssets } from "@/lib/visual-content/image-asset-repository";
import { getActiveImageGenerationProvider } from "@/lib/visual-content/image-generation-provider";
import {
  attachCoverImageToContent,
  attachInlineImageToContent,
  attachOGImageToContent,
  getImagesForContent,
} from "@/lib/visual-content/image-cms-integration";
import { attachImageToExternalPublication } from "@/lib/visual-content/image-distribution-integration";
import {
  trackVisualAssetApproved,
  trackVisualAssetAttachedToContent,
  trackVisualAssetAttachedToPublication,
  trackVisualAssetCreated,
  trackVisualAssetRejected,
  trackVisualGenerationCompleted,
  trackVisualGenerationFailed,
  trackVisualGenerationStarted,
  trackVisualPromptGenerated,
} from "@/lib/visual-content/visual-content-analytics";
import { imageSafetyRules } from "@/data/image-safety-rules";
import { getVisualContentTypeMeta } from "@/data/visual-content-types";

export type CreateVisualBriefInput = VisualBriefInput & {
  title?: string;
  kind?: VisualAssetKind;
};

export type CreateImageGenerationInput = {
  mode: ImageGenerationMode;
  topic: string;
  contentItemId?: string;
  publicationId?: string;
  contentKind?: string;
  clusterId?: string;
  rubricId?: string;
  visualStyleId?: string;
  templateId?: string;
  brandCharacterId?: string;
  aspectRatio: VisualAspectRatio;
  titleText?: string;
  subtitleText?: string;
  ctaText?: string;
  additionalContext?: string;
};

function newId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function defaultConstraints(mode: ImageGenerationMode) {
  const isDiagram = mode === "technical-diagram";
  const isCharacter = mode === "brand-character-scene";
  return {
    noReadableAIText: true,
    textAddedProgrammatically: true,
    avoidRealObjectMisrepresentation: !isDiagram,
    requiresIllustrationNotice: !isDiagram,
    allowBrandCharacter: isCharacter,
    allowPeople: isCharacter,
    allowConstructionSite: false,
    allowPhotorealism: false,
  };
}

function defaultSafety(kind: VisualAssetKind): VisualAsset["safety"] {
  const meta = getVisualContentTypeMeta(kind);
  const isReal = kind === "real-photo";
  return {
    canLookLikeRealObject: !isReal && kind !== "diagram",
    requiresIllustrationNotice: !isReal,
    isRealObjectPhoto: isReal,
    isRealClientPhoto: false,
    fakeCaseRisk: meta?.riskLevel ?? "low",
    misleadingRisk: meta?.riskLevel ?? "low",
  };
}

export const imageAssetService = {
  async ensureSeeded(): Promise<void> {
    seedDemoVisualAssets();
  },

  createVisualBrief(input: CreateVisualBriefInput) {
    const brief = createVisualBrief(input);
    return { brief, text: visualBriefToText(brief) };
  },

  createImageGenerationRequest(input: CreateImageGenerationInput): ImageGenerationRequest {
    return {
      id: newId("igen"),
      mode: input.mode,
      input: {
        contentItemId: input.contentItemId,
        publicationId: input.publicationId,
        topic: input.topic,
        contentKind: input.contentKind,
        clusterId: input.clusterId,
        rubricId: input.rubricId,
        visualStyleId: input.visualStyleId,
        templateId: input.templateId,
        brandCharacterId: input.brandCharacterId,
        aspectRatio: input.aspectRatio,
        titleText: input.titleText,
        subtitleText: input.subtitleText,
        ctaText: input.ctaText,
        additionalContext: input.additionalContext,
      },
      constraints: defaultConstraints(input.mode),
      createdAt: new Date().toISOString(),
    };
  },

  generateImagePrompt(request: ImageGenerationRequest) {
    const prompt = buildImagePrompt(request);
    const negativePrompt = buildNegativePrompt(request);
    trackVisualPromptGenerated({
      imageId: request.id,
      kind: request.mode,
      aspectRatio: request.input.aspectRatio,
      templateId: request.input.templateId,
    });
    return { prompt, negativePrompt };
  },

  async saveVisualAsset(asset: VisualAsset): Promise<VisualAsset> {
    const saved = await imageAssetRepository.save(asset);
    trackVisualAssetCreated({
      imageId: saved.id,
      kind: saved.kind,
      source: saved.source,
      aspectRatio: saved.format.aspectRatio,
      status: saved.status,
    });
    imageAssetRepository.appendAudit({ assetId: saved.id, action: "saved" });
    return saved;
  },

  async createAssetFromBrief(input: CreateVisualBriefInput): Promise<VisualAsset> {
    const { brief, text } = this.createVisualBrief(input);
    const kind = input.kind ?? "ai-illustration";
    const asset: VisualAsset = {
      id: newId("visual"),
      kind,
      status: "brief",
      title: input.title ?? input.topic,
      source: "ai-generated",
      related: {},
      format: { aspectRatio: input.aspectRatio },
      usage: {
        siteCover: false,
        openGraph: false,
        socialTeaser: false,
        blogInline: false,
        catalog: false,
        casePage: false,
        dashboardOnly: true,
      },
      rights: { usageAllowed: false, sourceConfirmed: false },
      safety: defaultSafety(kind),
      seo: { alt: "" },
      prompts: { visualBrief: text },
      createdAt: new Date().toISOString(),
    };
    return this.saveVisualAsset(asset);
  },

  async approveVisualAsset(assetId: string): Promise<VisualAsset> {
    const asset = await imageAssetRepository.getById(assetId);
    if (!asset) throw new Error("Asset not found");
    const validation = validateVisualAsset(asset);
    if (!validation.canApprove) {
      throw new Error(`Cannot approve: ${validation.blockers.join("; ")}`);
    }
    asset.status = "approved";
    const saved = await imageAssetRepository.save(asset);
    trackVisualAssetApproved({
      imageId: assetId,
      kind: saved.kind,
      status: saved.status,
      blockerCount: 0,
      warningCount: validation.warnings.length,
    });
    imageAssetRepository.appendAudit({ assetId, action: "approved" });
    return saved;
  },

  async rejectVisualAsset(assetId: string, reason: string): Promise<VisualAsset> {
    const asset = await imageAssetRepository.getById(assetId);
    if (!asset) throw new Error("Asset not found");
    asset.status = "rejected";
    asset.description = [asset.description, `Rejected: ${reason}`].filter(Boolean).join("\n");
    const saved = await imageAssetRepository.save(asset);
    trackVisualAssetRejected({ imageId: assetId, kind: saved.kind, status: saved.status });
    imageAssetRepository.appendAudit({ assetId, action: "rejected", details: reason });
    return saved;
  },

  async attachImageToContent(contentItemId: string, imageId: string, role: "cover" | "og" | "inline" = "cover") {
    if (role === "cover") await attachCoverImageToContent(contentItemId, imageId);
    else if (role === "og") await attachOGImageToContent(contentItemId, imageId);
    else await attachInlineImageToContent(contentItemId, imageId);
    trackVisualAssetAttachedToContent({ imageId, contentItemId });
  },

  async attachImageToPublication(publicationId: string, imageId: string) {
    await attachImageToExternalPublication(publicationId, imageId);
    trackVisualAssetAttachedToPublication({ imageId, publicationId });
  },

  getImagesForContent,
  getImagesForPublication(publicationId: string) {
    const ids = imageAssetRepository.getImagesForPublication(publicationId);
    return Promise.all(ids.map((id) => imageAssetRepository.getById(id)));
  },

  validateVisualAsset,
  buildImageAlt,

  async generateAndSavePromptOnly(request: ImageGenerationRequest): Promise<{
    asset: VisualAsset;
    prompt: string;
    negativePrompt: string;
  }> {
    const { prompt, negativePrompt } = this.generateImagePrompt(request);
    const asset: VisualAsset = {
      id: newId("visual"),
      kind: request.mode === "technical-diagram" ? "diagram" : "ai-illustration",
      status: "generated",
      title: request.input.topic,
      source: "ai-generated",
      related: {
        contentItemId: request.input.contentItemId,
        publicationId: request.input.publicationId,
      },
      format: { aspectRatio: request.input.aspectRatio },
      usage: {
        siteCover: request.mode === "content-cover" || request.mode === "og-image",
        openGraph: request.mode === "og-image",
        socialTeaser: request.mode === "social-teaser",
        blogInline: false,
        catalog: false,
        casePage: false,
        dashboardOnly: false,
      },
      rights: { usageAllowed: true, sourceConfirmed: true },
      safety: defaultSafety("ai-illustration"),
      seo: {
        alt: buildImageAlt({
          id: "",
          kind: "ai-illustration",
          status: "generated",
          title: request.input.topic,
          source: "ai-generated",
          related: {},
          format: { aspectRatio: request.input.aspectRatio },
          usage: {
            siteCover: false,
            openGraph: false,
            socialTeaser: false,
            blogInline: false,
            catalog: false,
            casePage: false,
            dashboardOnly: false,
          },
          rights: { usageAllowed: true, sourceConfirmed: true },
          safety: defaultSafety("ai-illustration"),
          seo: { alt: "" },
          createdAt: "",
        }),
        caption: imageSafetyRules.illustrationNotice,
      },
      prompts: { generationPrompt: prompt, negativePrompt, visualBrief: request.input.additionalContext },
      createdAt: new Date().toISOString(),
    };
    asset.seo.alt = buildImageAlt(asset);
    const saved = await this.saveVisualAsset(asset);
    asset.status = "review";
    await imageAssetRepository.save(saved);

    imageAssetRepository.appendGeneration({
      id: newId("igen-rec"),
      requestId: request.id,
      mode: request.mode,
      topic: request.input.topic,
      status: "prompt-only",
      prompt,
      negativePrompt,
      createdAt: new Date().toISOString(),
    });

    return { asset: saved, prompt, negativePrompt };
  },

  async runImageGeneration(request: ImageGenerationRequest): Promise<VisualAsset> {
    const provider = getActiveImageGenerationProvider();
    const { prompt, negativePrompt } = this.generateImagePrompt(request);

    trackVisualGenerationStarted({
      imageId: request.id,
      kind: request.mode,
      aspectRatio: request.input.aspectRatio,
      templateId: request.input.templateId,
    });

    const result = await provider.generateImage({
      prompt,
      negativePrompt,
      aspectRatio: request.input.aspectRatio,
      styleId: request.input.visualStyleId,
    });

    if (!result.success) {
      trackVisualGenerationFailed({
        imageId: request.id,
        kind: request.mode,
        error: result.error?.message,
      });
      throw new Error(result.error?.message ?? "Generation failed");
    }

    const { asset } = await this.generateAndSavePromptOnly(request);
    asset.fileUrl = result.imageUrl;
    asset.thumbnailUrl = result.imageUrl;
    asset.status = "review";
    const saved = await imageAssetRepository.save(asset);

    trackVisualGenerationCompleted({
      imageId: saved.id,
      kind: request.mode,
      source: saved.source,
      aspectRatio: saved.format.aspectRatio,
      status: saved.status,
    });

    return saved;
  },

  async listAssets() {
    await this.ensureSeeded();
    return imageAssetRepository.list();
  },

  async getMetrics() {
    await this.ensureSeeded();
    return imageAssetRepository.getMetrics();
  },

  async getAssetById(id: string) {
    await this.ensureSeeded();
    return imageAssetRepository.getById(id);
  },
};
