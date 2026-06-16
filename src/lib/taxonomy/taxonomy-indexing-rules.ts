import type { TaxonomyCombination } from "@/types/project-taxonomy";
import { getObjectTypeById } from "@/data/project-object-types";
import { getMaterialById } from "@/data/project-materials";
import { getSizeById } from "@/data/project-size-taxonomy";
import { getFeatureById } from "@/data/project-feature-taxonomy";
import { getRegionById } from "@/data/irkutsk-region-taxonomy";
import { SITE_URL } from "@/lib/seo";

export function resolveTaxonomyIndexing(
  combination: TaxonomyCombination,
): TaxonomyCombination["indexing"] {
  const object = combination.objectTypeId
    ? getObjectTypeById(combination.objectTypeId)
    : undefined;
  const material = combination.materialId
    ? getMaterialById(combination.materialId)
    : undefined;
  const size = combination.sizeId ? getSizeById(combination.sizeId) : undefined;
  const feature = combination.featureId
    ? getFeatureById(combination.featureId)
    : undefined;
  const region = combination.regionId
    ? getRegionById(combination.regionId)
    : undefined;

  if (combination.pageType === "filter-only" || combination.status === "rejected") {
    return {
      indexable: false,
      sitemap: false,
      noindexReason: "filter-only или rejected",
    };
  }

  if (
    combination.status === "planned" ||
    combination.status === "needs-keyword-data" ||
    combination.status === "needs-project-data" ||
    combination.status === "draft" ||
    combination.status === "candidate"
  ) {
    return {
      indexable: false,
      sitemap: false,
      noindexReason: `status: ${combination.status}`,
    };
  }

  if (region?.needsKeywordValidation && combination.status !== "approved") {
    return {
      indexable: false,
      sitemap: false,
      noindexReason: "region needs keyword validation",
    };
  }

  if (size?.needsKeywordValidation && !size.indexableByDefault) {
    return {
      indexable: false,
      sitemap: false,
      noindexReason: "size needs keyword validation",
    };
  }

  if (feature?.filterOnly) {
    return {
      indexable: false,
      sitemap: false,
      noindexReason: "feature is filter-only",
    };
  }

  if (object && !object.indexableByDefault && combination.status !== "approved") {
    return {
      indexable: false,
      sitemap: false,
      noindexReason: "object not indexable by default",
    };
  }

  if (material && !material.indexableByDefault && combination.status !== "approved") {
    return {
      indexable: false,
      sitemap: false,
      noindexReason: "material not indexable by default",
    };
  }

  if (combination.risks.thinContentRisk === "high" && combination.level >= 3) {
    return {
      indexable: false,
      sitemap: false,
      noindexReason: "thin content risk on level 3+",
    };
  }

  if (combination.status === "approved" || combination.status === "published") {
    return { indexable: true, sitemap: true };
  }

  return { indexable: false, sitemap: false, noindexReason: "awaiting approval" };
}

export function catalogCanonicalUrl(catalogCategorySlug: string): string {
  return `${SITE_URL}/catalog/kategoriya/${catalogCategorySlug}`;
}
