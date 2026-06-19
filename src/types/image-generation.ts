import type { VisualAspectRatio } from "@/types/visual-content";

export type ImageGenerationMode =
  | "content-cover"
  | "technical-diagram"
  | "editorial-illustration"
  | "social-teaser"
  | "brand-character-scene"
  | "og-image"
  | "favicon"
  | "custom";

export type ImageGenerationRequest = {
  id: string;
  mode: ImageGenerationMode;
  input: {
    contentItemId?: string;
    publicationId?: string;
    teaserId?: string;
    topic: string;
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
  constraints: {
    noReadableAIText: boolean;
    textAddedProgrammatically: boolean;
    avoidRealObjectMisrepresentation: boolean;
    requiresIllustrationNotice: boolean;
    allowBrandCharacter: boolean;
    allowPeople: boolean;
    allowConstructionSite: boolean;
    allowPhotorealism: boolean;
  };
  createdAt: string;
};

export type ImageGenerationProviderRequest = {
  prompt: string;
  negativePrompt?: string;
  aspectRatio: VisualAspectRatio;
  styleId?: string;
};

export type ImageGenerationProviderResponse = {
  success: boolean;
  imageUrl?: string;
  localPath?: string;
  error?: {
    code?: string;
    message: string;
    raw?: unknown;
  };
};

export type ImageGenerationProvider = {
  id: string;
  label: string;
  isConfigured: boolean;
  generateImage(request: ImageGenerationProviderRequest): Promise<ImageGenerationProviderResponse>;
};

export type ImageValidationResult = {
  valid: boolean;
  warnings: string[];
  blockers: string[];
  flags: {
    hasAlt: boolean;
    hasSource: boolean;
    rightsConfirmed: boolean;
    formatValid: boolean;
    safeForUsage: boolean;
    noMisleadingRealObject: boolean;
    noFakeClient: boolean;
    noFakeDocument: boolean;
    requiresIllustrationNotice: boolean;
    hasIllustrationNotice: boolean;
    textOverlaySafe: boolean;
  };
  canApprove: boolean;
  canUseOnSite: boolean;
  canUseInDistribution: boolean;
};

export type ImageGenerationRecord = {
  id: string;
  requestId: string;
  mode: ImageGenerationMode;
  topic: string;
  status: "completed" | "failed" | "prompt-only";
  prompt?: string;
  negativePrompt?: string;
  createdAt: string;
};
