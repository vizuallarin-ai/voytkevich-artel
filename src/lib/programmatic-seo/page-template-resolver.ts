import type { TaxonomyCombination } from "@/types/project-taxonomy";
import type { ProgrammaticPageTemplateType } from "@/types/programmatic-page-template";
import { getSizeById } from "@/data/project-size-taxonomy";
import {
  getProgrammaticTemplateByType,
  programmaticPageTemplates,
} from "@/data/programmatic-page-templates";
import { getTaxonomyCombinations } from "@/lib/taxonomy/taxonomy-combination-builder";

export function mapCombinationToTemplateType(
  combination: TaxonomyCombination,
): ProgrammaticPageTemplateType {
  if (combination.pageType === "project-combination-page") return "combination-page";
  if (combination.pageType === "project-location-page") return "location-page";
  if (combination.pageType === "project-feature-page") return "feature-page";
  if (combination.pageType === "project-material-page") return "material-page";
  if (combination.pageType === "project-category") return "object-category";

  if (combination.pageType === "project-size-page" && combination.sizeId) {
    const size = getSizeById(combination.sizeId);
    if (size?.type === "area-range" || size?.type === "exact-area") return "area-page";
    if (size?.type === "floors") return "floors-page";
    return "size-page";
  }

  return "combination-page";
}

export function resolveTemplateForCombination(combination: TaxonomyCombination) {
  const type = mapCombinationToTemplateType(combination);
  return getProgrammaticTemplateByType(type);
}

export function findCombinationByPath(pathPrefix: string, slug: string): TaxonomyCombination | null {
  const url = `${pathPrefix.replace(/\/$/, "")}/${slug}`;
  return getTaxonomyCombinations().find((c) => c.url === url) ?? null;
}

export function getCombinationsForPathPrefix(pathPrefix: string): TaxonomyCombination[] {
  const prefix = pathPrefix.replace(/\/$/, "");
  return getTaxonomyCombinations().filter((c) => c.url.startsWith(`${prefix}/`));
}

export function listAllTemplates() {
  return programmaticPageTemplates;
}

export function countCombinationsByTemplate(): Record<ProgrammaticPageTemplateType, number> {
  const counts = Object.fromEntries(
    programmaticPageTemplates.map((t) => [t.type, 0]),
  ) as Record<ProgrammaticPageTemplateType, number>;

  for (const c of getTaxonomyCombinations()) {
    const type = mapCombinationToTemplateType(c);
    counts[type] = (counts[type] ?? 0) + 1;
  }
  return counts;
}
