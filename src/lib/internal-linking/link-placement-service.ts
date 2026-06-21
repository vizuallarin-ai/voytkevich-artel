import type { CMSContentItem } from "@/types/content-cms";
import type { InternalLinkPlacement } from "@/types/internal-link";

export type LinkPlacementCandidate = {
  placement: InternalLinkPlacement;
  score: number;
  contextHint?: string;
};

export function findRelevantLinkPlacements(
  sourceContent: CMSContentItem,
  target: CMSContentItem,
): LinkPlacementCandidate[] {
  const candidates: LinkPlacementCandidate[] = [];

  if (sourceContent.kind === "technical-article" || sourceContent.kind === "editorial-content") {
    candidates.push({ placement: "body", score: 90, contextHint: "Contextual mention in relevant section" });
    candidates.push({ placement: "related-content", score: 75 });
  }

  if (target.url.includes("/calculator") || target.contentType?.includes("service")) {
    candidates.push({ placement: "cta", score: 80, contextHint: "Commercial intent alignment" });
  }

  if (sourceContent.clusterId && sourceContent.clusterId === target.clusterId) {
    candidates.push({ placement: "related-content", score: 85 });
  }

  candidates.push({ placement: "body", score: 70 });
  candidates.push({ placement: "related-content", score: 60 });

  return candidates.sort((a, b) => b.score - a.score);
}

export function scoreLinkPlacement(
  placement: InternalLinkPlacement,
  context: { source: CMSContentItem; target: CMSContentItem },
): number {
  const candidates = findRelevantLinkPlacements(context.source, context.target);
  return candidates.find((c) => c.placement === placement)?.score ?? 40;
}

export function validateSentenceContext(placement: LinkPlacementCandidate, target: CMSContentItem): boolean {
  if (placement.placement === "cta" && !target.url.includes("/calculator") && !target.contentType?.includes("service")) {
    return false;
  }
  return true;
}

export function recommendRelatedContentPlacement(
  source: CMSContentItem,
  target: CMSContentItem,
): LinkPlacementCandidate {
  return {
    placement: "related-content",
    score: source.clusterId === target.clusterId ? 88 : 65,
    contextHint: "Related materials block",
  };
}

export function recommendCommercialCTAPlacement(
  source: CMSContentItem,
  target: CMSContentItem,
): LinkPlacementCandidate | null {
  if (!target.url.includes("/calculator") && !target.contentType?.includes("service")) return null;
  return { placement: "cta", score: 82, contextHint: "Commercial CTA block" };
}

export function avoidDuplicatePlacement(
  source: CMSContentItem,
  target: CMSContentItem,
  existingPlacements: InternalLinkPlacement[],
): LinkPlacementCandidate[] {
  return findRelevantLinkPlacements(source, target).filter(
    (c) => !existingPlacements.includes(c.placement),
  );
}

export const linkPlacementService = {
  findRelevantLinkPlacements,
  scoreLinkPlacement,
  validateSentenceContext,
  recommendRelatedContentPlacement,
  recommendCommercialCTAPlacement,
  avoidDuplicatePlacement,
};
