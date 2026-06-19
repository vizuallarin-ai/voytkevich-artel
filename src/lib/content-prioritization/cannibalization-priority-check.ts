import type { CMSContentItem } from "@/types/content-cms";

export function checkPriorityCannibalization(
  contentItem: CMSContentItem,
  existingItems: CMSContentItem[],
): { risk: "high" | "medium" | "low"; matches: string[] } {
  const matches: string[] = [];
  const targetKw = (contentItem.seo.targetKeyword ?? contentItem.title).toLowerCase();
  const targetSlug = contentItem.slug;

  for (const other of existingItems) {
    if (other.id === contentItem.id) continue;
    const otherKw = (other.seo.targetKeyword ?? other.title).toLowerCase();
    if (otherKw === targetKw) matches.push(other.id);
    if (other.slug === targetSlug) matches.push(other.id);
    if (
      contentItem.clusterId &&
      other.clusterId === contentItem.clusterId &&
      other.kind === contentItem.kind &&
      contentItem.kind === "programmatic-page"
    ) {
      matches.push(other.id);
    }
  }

  const unique = [...new Set(matches)];
  const risk =
    contentItem.seo.cannibalizationRisk ??
    (unique.length >= 2 ? "high" : unique.length === 1 ? "medium" : "low");

  return { risk, matches: unique };
}

export function getCannibalizationPenalty(contentItem: CMSContentItem, existingItems: CMSContentItem[]): number {
  const { risk } = checkPriorityCannibalization(contentItem, existingItems);
  if (risk === "high") return 25;
  if (risk === "medium") return 12;
  return 0;
}

export function shouldLowerPriorityDueToCannibalization(
  contentItem: CMSContentItem,
  existingItems: CMSContentItem[],
): boolean {
  return checkPriorityCannibalization(contentItem, existingItems).risk === "high";
}

export function suggestMergeOrCanonical(contentItem: CMSContentItem, existingItems: CMSContentItem[]): string[] {
  const { matches, risk } = checkPriorityCannibalization(contentItem, existingItems);
  if (risk === "low") return [];
  return matches.map(
    (id) => `Проверить canonical/merge с ${id} — риск каннибализации`,
  );
}
