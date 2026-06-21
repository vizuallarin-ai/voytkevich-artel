import type { InternalLinkRecord } from "@/types/internal-link";
import type { AnchorType } from "@/lib/internal-linking/anchor-recommendation-service";
import { anchorRecommendationService } from "@/lib/internal-linking/anchor-recommendation-service";
import type { CMSContentItem } from "@/types/content-cms";
import { contentRepository } from "@/lib/content-cms/content-repository";

export type AnchorDistribution = Record<AnchorType, number>;

export function calculateAnchorDistribution(
  targetUrl: string,
  links: InternalLinkRecord[],
): AnchorDistribution {
  const distribution: AnchorDistribution = {
    "natural-descriptive": 0,
    "partial-match": 0,
    "entity-name": 0,
    "page-title": 0,
    brand: 0,
    navigational: 0,
    neutral: 0,
    cta: 0,
  };

  const targetLinks = links.filter((l) => l.targetUrl === targetUrl && l.anchorText);
  for (const link of targetLinks) {
    const slug = link.targetUrl.split("/").pop() ?? "";
    const target = { title: slug, seo: {}, url: link.targetUrl } as CMSContentItem;
    const type = anchorRecommendationService.classifyAnchorType(link.anchorText!, target);
    distribution[type]++;
  }
  return distribution;
}

export function detectAnchorOveroptimization(
  targetUrl: string,
  links: InternalLinkRecord[],
): { overoptimized: boolean; reasons: string[] } {
  const distribution = calculateAnchorDistribution(targetUrl, links);
  const total = Object.values(distribution).reduce((a, b) => a + b, 0);
  const reasons: string[] = [];

  if (total === 0) return { overoptimized: false, reasons };

  const exactRatio = (distribution["partial-match"] + distribution["page-title"]) / total;
  if (exactRatio > 0.5) {
    reasons.push("Exact-match anchors exceed recommended diversity");
  }
  if (distribution.cta / total > 0.4) {
    reasons.push("Too many CTA-style anchors to single target");
  }

  return { overoptimized: reasons.length > 0, reasons };
}

export function detectAnchorMonotony(targetUrl: string, links: InternalLinkRecord[]): boolean {
  const anchors = links
    .filter((l) => l.targetUrl === targetUrl && l.anchorText)
    .map((l) => l.anchorText!.toLowerCase().trim());
  if (anchors.length < 3) return false;
  const unique = new Set(anchors);
  return unique.size <= 1;
}

export function recommendAnchorDistribution(
  targetUrl: string,
  links: InternalLinkRecord[],
): string[] {
  const recommendations: string[] = [];
  const { overoptimized, reasons } = detectAnchorOveroptimization(targetUrl, links);
  if (overoptimized) recommendations.push(...reasons);
  if (detectAnchorMonotony(targetUrl, links)) {
    recommendations.push("Introduce varied descriptive anchors");
  }
  return recommendations;
}

export async function getAnchorDiversityWarnings(
  targetUrl: string,
  links: InternalLinkRecord[],
): Promise<string[]> {
  const warnings = recommendAnchorDistribution(targetUrl, links);
  const slug = targetUrl.split("/").pop();
  if (slug) {
    const item = await contentRepository.getContentBySlug(slug);
    if (item) {
      warnings.push(...anchorRecommendationService.recommendAnchorDiversity(item, links));
    }
  }
  return [...new Set(warnings)];
}

export const anchorDiversityService = {
  calculateAnchorDistribution,
  detectAnchorOveroptimization,
  detectAnchorMonotony,
  recommendAnchorDistribution,
  getAnchorDiversityWarnings,
};
