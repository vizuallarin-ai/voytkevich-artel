export type InternalLinkingPresetId =
  | "conservative"
  | "balanced"
  | "cluster-growth"
  | "orphan-recovery"
  | "commercial-path";

export type LinkDensityLimits = {
  minLinks: number;
  maxLinks: number;
  maxUniqueTargets: number;
  maxExactMatchAnchors: number;
  maxCommercialLinks: number;
  allowSelfLinks: boolean;
};

export type InternalLinkingPreset = {
  id: InternalLinkingPresetId;
  label: string;
  description: string;
  densityMultiplier: number;
  prioritizeCommercial: boolean;
  prioritizeCluster: boolean;
  orphanRecoveryBoost: number;
};

export const DEFAULT_LINKING_PRESET: InternalLinkingPresetId = "balanced";

export const internalLinkingPresets: Record<InternalLinkingPresetId, InternalLinkingPreset> = {
  conservative: {
    id: "conservative",
    label: "Conservative",
    description: "Minimal contextual links; avoid density risk on thin pages.",
    densityMultiplier: 0.7,
    prioritizeCommercial: false,
    prioritizeCluster: false,
    orphanRecoveryBoost: 0,
  },
  balanced: {
    id: "balanced",
    label: "Balanced",
    description: "Default mix of contextual, cluster and commercial links.",
    densityMultiplier: 1,
    prioritizeCommercial: true,
    prioritizeCluster: true,
    orphanRecoveryBoost: 0.2,
  },
  "cluster-growth": {
    id: "cluster-growth",
    label: "Cluster growth",
    description: "Strengthen pillar-cluster connections and supporting content.",
    densityMultiplier: 1.15,
    prioritizeCommercial: false,
    prioritizeCluster: true,
    orphanRecoveryBoost: 0.3,
  },
  "orphan-recovery": {
    id: "orphan-recovery",
    label: "Orphan recovery",
    description: "Focus on linking isolated indexable pages.",
    densityMultiplier: 0.9,
    prioritizeCommercial: false,
    prioritizeCluster: true,
    orphanRecoveryBoost: 1,
  },
  "commercial-path": {
    id: "commercial-path",
    label: "Commercial path",
    description: "Prioritize journeys toward services, calculator and CTA.",
    densityMultiplier: 1,
    prioritizeCommercial: true,
    prioritizeCluster: false,
    orphanRecoveryBoost: 0.1,
  },
};

type ContentTypeKey =
  | "service-page"
  | "technical-article"
  | "editorial-content"
  | "programmatic-page"
  | "landing-page"
  | "news"
  | "digest"
  | "default";

const BASE_DENSITY: Record<ContentTypeKey, LinkDensityLimits> = {
  "service-page": {
    minLinks: 3,
    maxLinks: 12,
    maxUniqueTargets: 8,
    maxExactMatchAnchors: 2,
    maxCommercialLinks: 4,
    allowSelfLinks: false,
  },
  "technical-article": {
    minLinks: 2,
    maxLinks: 10,
    maxUniqueTargets: 7,
    maxExactMatchAnchors: 1,
    maxCommercialLinks: 2,
    allowSelfLinks: false,
  },
  "editorial-content": {
    minLinks: 2,
    maxLinks: 8,
    maxUniqueTargets: 6,
    maxExactMatchAnchors: 1,
    maxCommercialLinks: 2,
    allowSelfLinks: false,
  },
  "programmatic-page": {
    minLinks: 2,
    maxLinks: 10,
    maxUniqueTargets: 7,
    maxExactMatchAnchors: 2,
    maxCommercialLinks: 3,
    allowSelfLinks: false,
  },
  "landing-page": {
    minLinks: 2,
    maxLinks: 6,
    maxUniqueTargets: 5,
    maxExactMatchAnchors: 1,
    maxCommercialLinks: 3,
    allowSelfLinks: false,
  },
  news: {
    minLinks: 1,
    maxLinks: 5,
    maxUniqueTargets: 4,
    maxExactMatchAnchors: 1,
    maxCommercialLinks: 1,
    allowSelfLinks: false,
  },
  digest: {
    minLinks: 2,
    maxLinks: 8,
    maxUniqueTargets: 6,
    maxExactMatchAnchors: 1,
    maxCommercialLinks: 1,
    allowSelfLinks: false,
  },
  default: {
    minLinks: 1,
    maxLinks: 6,
    maxUniqueTargets: 5,
    maxExactMatchAnchors: 1,
    maxCommercialLinks: 2,
    allowSelfLinks: false,
  },
};

function resolveContentTypeKey(contentType?: string): ContentTypeKey {
  if (!contentType) return "default";
  const key = contentType as ContentTypeKey;
  if (key in BASE_DENSITY) return key;
  if (contentType.includes("technical")) return "technical-article";
  if (contentType.includes("service")) return "service-page";
  if (contentType.includes("location")) return "programmatic-page";
  return "default";
}

function scaleByWordCount(limits: LinkDensityLimits, wordCount: number): LinkDensityLimits {
  if (wordCount <= 400) {
    return {
      ...limits,
      maxLinks: Math.max(limits.minLinks, Math.round(limits.maxLinks * 0.5)),
      maxUniqueTargets: Math.max(2, Math.round(limits.maxUniqueTargets * 0.6)),
    };
  }
  if (wordCount <= 800) {
    return {
      ...limits,
      maxLinks: Math.max(limits.minLinks, Math.round(limits.maxLinks * 0.75)),
      maxUniqueTargets: Math.max(3, Math.round(limits.maxUniqueTargets * 0.8)),
    };
  }
  if (wordCount >= 2500) {
    return {
      ...limits,
      maxLinks: Math.round(limits.maxLinks * 1.25),
      maxUniqueTargets: Math.round(limits.maxUniqueTargets * 1.15),
    };
  }
  return limits;
}

export function getLinkDensityLimits(
  contentType: string | undefined,
  wordCount: number,
  presetId: InternalLinkingPresetId = DEFAULT_LINKING_PRESET,
): LinkDensityLimits {
  const base = BASE_DENSITY[resolveContentTypeKey(contentType)];
  const scaled = scaleByWordCount(base, wordCount);
  const preset = internalLinkingPresets[presetId];
  const mult = preset.densityMultiplier;

  return {
    minLinks: scaled.minLinks,
    maxLinks: Math.max(scaled.minLinks, Math.round(scaled.maxLinks * mult)),
    maxUniqueTargets: Math.max(2, Math.round(scaled.maxUniqueTargets * mult)),
    maxExactMatchAnchors: scaled.maxExactMatchAnchors,
    maxCommercialLinks: Math.max(
      1,
      Math.round(scaled.maxCommercialLinks * (preset.prioritizeCommercial ? 1.2 : 1)),
    ),
    allowSelfLinks: scaled.allowSelfLinks,
  };
}

export function getInternalLinkingPreset(
  presetId: InternalLinkingPresetId = DEFAULT_LINKING_PRESET,
): InternalLinkingPreset {
  return internalLinkingPresets[presetId];
}
