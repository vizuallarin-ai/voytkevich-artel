import type { CMSContentItem } from "@/types/content-cms";
import type { InternalLinkRecord } from "@/types/internal-link";

export type AnchorType =
  | "natural-descriptive"
  | "partial-match"
  | "entity-name"
  | "page-title"
  | "brand"
  | "navigational"
  | "neutral"
  | "cta";

export function generateAnchorCandidates(
  source: CMSContentItem,
  target: CMSContentItem,
): string[] {
  const candidates = new Set<string>();
  candidates.add(target.title);
  if (target.h1 && target.h1 !== target.title) candidates.add(target.h1);
  if (target.seo.targetKeyword) candidates.add(target.seo.targetKeyword);

  if (target.url.includes("/calculator")) {
    candidates.add("рассчитать стоимость");
    candidates.add("калькулятор стоимости");
  }
  if (target.contentType?.includes("service")) {
    candidates.add("подробнее об услуге");
  }

  candidates.add("подробнее");
  candidates.add(`материал: ${target.title}`);

  return [...candidates].slice(0, 8);
}

export function classifyAnchorType(anchor: string, target: CMSContentItem): AnchorType {
  const normalized = anchor.toLowerCase().trim();
  if (normalized === target.seo.targetKeyword?.toLowerCase()) return "partial-match";
  if (normalized === target.title.toLowerCase()) return "page-title";
  if (/рассчитать|заявк|консультац|калькулятор/i.test(anchor)) return "cta";
  if (/stroistroy|артел/i.test(anchor)) return "brand";
  if (/подробнее|читать|смотреть/i.test(anchor)) return "navigational";
  if (normalized.length < 15) return "neutral";
  return "natural-descriptive";
}

export function validateAnchorRelevance(anchor: string, target: CMSContentItem): boolean {
  const type = classifyAnchorType(anchor, target);
  if (type === "partial-match" && anchor.length > 60) return false;
  const titleTokens = target.title.toLowerCase().split(/\s+/);
  const anchorTokens = anchor.toLowerCase().split(/\s+/);
  const overlap = anchorTokens.filter((t) => titleTokens.includes(t)).length;
  return overlap > 0 || type === "cta" || type === "navigational" || type === "neutral";
}

export function detectAnchorStuffing(anchor: string, context: { sentence?: string }): boolean {
  const sentence = context.sentence ?? anchor;
  const linkLike = (sentence.match(/\[|\]|href=/g) ?? []).length;
  return linkLike > 2 || (anchor.split(/\s+/).length > 12);
}

export function detectRepeatedExactMatch(
  anchor: string,
  target: CMSContentItem,
  inventory: InternalLinkRecord[],
): boolean {
  const normalized = anchor.toLowerCase().trim();
  const keyword = target.seo.targetKeyword?.toLowerCase();
  if (normalized !== keyword && normalized !== target.title.toLowerCase()) return false;

  const matches = inventory.filter(
    (l) =>
      l.targetUrl === target.url &&
      l.anchorText?.toLowerCase().trim() === normalized &&
      l.status === "active",
  );
  return matches.length >= 2;
}

export function recommendAnchorDiversity(
  target: CMSContentItem,
  inventory: InternalLinkRecord[],
): string[] {
  const warnings: string[] = [];
  const anchors = inventory
    .filter((l) => l.targetUrl === target.url)
    .map((l) => l.anchorText)
    .filter(Boolean) as string[];

  const exactKeyword = target.seo.targetKeyword?.toLowerCase();
  const exactCount = anchors.filter((a) => a.toLowerCase() === exactKeyword).length;
  if (exactCount > 1) {
    warnings.push("Vary exact-match anchors for this target");
  }
  return warnings;
}

export function selectSafestAnchor(
  candidates: string[],
  context: { target: CMSContentItem; inventory: InternalLinkRecord[] },
): string | null {
  for (const anchor of candidates) {
    if (!validateAnchorRelevance(anchor, context.target)) continue;
    if (detectRepeatedExactMatch(anchor, context.target, context.inventory)) continue;
    const type = classifyAnchorType(anchor, context.target);
    if (type === "partial-match" || type === "page-title") continue;
    return anchor;
  }
  return candidates.find((a) => validateAnchorRelevance(a, context.target)) ?? null;
}

export const anchorRecommendationService = {
  generateAnchorCandidates,
  classifyAnchorType,
  validateAnchorRelevance,
  detectAnchorStuffing,
  detectRepeatedExactMatch,
  recommendAnchorDiversity,
  selectSafestAnchor,
};
