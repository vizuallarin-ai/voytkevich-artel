import type { VisualAsset } from "@/types/visual-content";
import type { ImageValidationResult } from "@/types/image-generation";
import { imageSafetyRules } from "@/data/image-safety-rules";
import { getFormatSpec } from "@/data/visual-formats";

export function validateVisualAsset(asset: VisualAsset): ImageValidationResult {
  const warnings: string[] = [];
  const blockers: string[] = [];

  const hasAlt = Boolean(asset.seo.alt?.trim());
  const hasSource = asset.source !== "future";
  const rightsConfirmed = asset.rights.usageAllowed && asset.rights.sourceConfirmed;
  const formatValid = Boolean(getFormatSpec(asset.format.aspectRatio));

  if (!hasAlt) blockers.push("Отсутствует alt-текст");
  if (!rightsConfirmed) blockers.push("Права на использование не подтверждены");
  if (!formatValid) blockers.push("Некорректный формат изображения");

  const requiresIllustrationNotice = asset.safety.requiresIllustrationNotice;
  const hasIllustrationNotice =
    !requiresIllustrationNotice ||
    Boolean(
      asset.seo.caption?.includes("иллюстрация") ||
        asset.seo.caption?.includes(imageSafetyRules.illustrationNotice) ||
        asset.description?.includes("иллюстрация"),
    );

  if (requiresIllustrationNotice && !hasIllustrationNotice) {
    blockers.push("AI-иллюстрация без маркировки «иллюстрация»");
  }

  if (asset.safety.isRealClientPhoto && asset.source === "ai-generated") {
    blockers.push("Фейковое фото клиента");
  }

  if (asset.kind === "real-photo" && !asset.rights.sourceConfirmed) {
    blockers.push("Реальное фото без подтверждения источника");
  }

  if (asset.safety.fakeCaseRisk === "high" && asset.safety.canLookLikeRealObject) {
    blockers.push("Высокий риск фейкового кейса");
  }

  if (asset.safety.misleadingRisk === "high") {
    blockers.push("Изображение может вводить в заблуждение");
  }

  if (!asset.fileUrl && !asset.sourceUrl && asset.status !== "planned" && asset.status !== "brief") {
    warnings.push("Нет URL файла изображения");
  }

  if (asset.safety.misleadingRisk === "medium") {
    warnings.push("Средний риск misleading — требуется review");
  }

  if (!asset.rights.sourceConfirmed) {
    warnings.push("Источник не подтверждён");
  }

  const noMisleadingRealObject =
    !asset.safety.canLookLikeRealObject || hasIllustrationNotice || asset.safety.isRealObjectPhoto;
  const noFakeClient = !(asset.safety.isRealClientPhoto && asset.source === "ai-generated");
  const noFakeDocument = asset.kind !== "icon" || asset.source !== "ai-generated";
  const textOverlaySafe = true;
  const safeForUsage = blockers.length === 0;

  const valid = blockers.length === 0;
  const canApprove = valid && asset.status !== "rejected";
  const canUseOnSite = canApprove && asset.status === "approved";
  const canUseInDistribution =
    canApprove && (asset.usage.socialTeaser || asset.usage.openGraph) && asset.status === "approved";

  return {
    valid,
    warnings,
    blockers,
    flags: {
      hasAlt,
      hasSource,
      rightsConfirmed,
      formatValid,
      safeForUsage,
      noMisleadingRealObject,
      noFakeClient,
      noFakeDocument,
      requiresIllustrationNotice,
      hasIllustrationNotice,
      textOverlaySafe,
    },
    canApprove,
    canUseOnSite,
    canUseInDistribution,
  };
}

export function validateImageBrief(brief: { topic?: string; aspectRatio?: string }): ImageValidationResult {
  const blockers: string[] = [];
  if (!brief.topic?.trim()) blockers.push("Не указана тема visual brief");
  if (!brief.aspectRatio) blockers.push("Не указан формат");
  return {
    valid: blockers.length === 0,
    warnings: [],
    blockers,
    flags: {
      hasAlt: false,
      hasSource: false,
      rightsConfirmed: false,
      formatValid: Boolean(brief.aspectRatio),
      safeForUsage: blockers.length === 0,
      noMisleadingRealObject: true,
      noFakeClient: true,
      noFakeDocument: true,
      requiresIllustrationNotice: false,
      hasIllustrationNotice: false,
      textOverlaySafe: true,
    },
    canApprove: false,
    canUseOnSite: false,
    canUseInDistribution: false,
  };
}
