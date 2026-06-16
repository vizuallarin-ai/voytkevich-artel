import type { TaxonomyCombination } from "@/types/project-taxonomy";
import { SITE_URL } from "@/lib/seo";
import { getObjectTypeById } from "@/data/project-object-types";
import { getMaterialById } from "@/data/project-materials";
import { getSizeById } from "@/data/project-size-taxonomy";
import { catalogCanonicalUrl } from "@/lib/taxonomy/taxonomy-indexing-rules";
import { buildTaxonomyUrl } from "@/lib/taxonomy/taxonomy-slug-builder";

/** Canonical для узких комбинаций → более широкая страница. */
export function resolveTaxonomyCanonical(combination: TaxonomyCombination): string | undefined {
  if (combination.catalogCategorySlug) {
    return catalogCanonicalUrl(combination.catalogCategorySlug);
  }

  const object = combination.objectTypeId
    ? getObjectTypeById(combination.objectTypeId)
    : undefined;
  if (!object) return undefined;

  // L3+ → drop region first
  if (combination.level >= 3 && combination.regionId) {
    const material = combination.materialId
      ? getMaterialById(combination.materialId)
      : undefined;
    const size = combination.sizeId ? getSizeById(combination.sizeId) : undefined;

    if (material && !size) {
      const { url } = buildTaxonomyUrl({
        objectType: object,
        materialSlug: material.slug,
        pageType: "project-material-page",
      });
      return `${SITE_URL}${url}`;
    }
    if (size && !material) {
      const { url } = buildTaxonomyUrl({
        objectType: object,
        sizeSlug: size.slug,
        pageType: "project-size-page",
      });
      return `${SITE_URL}${url}`;
    }
  }

  // L3 object+material+size → material page
  if (combination.materialId && combination.sizeId && combination.level >= 3) {
    const material = getMaterialById(combination.materialId);
    if (material) {
      const { url } = buildTaxonomyUrl({
        objectType: object,
        materialSlug: material.slug,
        pageType: "project-material-page",
      });
      return `${SITE_URL}${url}`;
    }
  }

  if (combination.risks.duplicateRisk === "high" && combination.materialId) {
    const material = getMaterialById(combination.materialId);
    if (material) {
      const { url } = buildTaxonomyUrl({
        objectType: object,
        materialSlug: material.slug,
        pageType: "project-material-page",
      });
      return `${SITE_URL}${url}`;
    }
  }

  return undefined;
}
