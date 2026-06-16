import type {
  TaxonomyCombination,
  TaxonomyCombinationStatus,
  TaxonomyRiskLevel,
} from "@/types/project-taxonomy";
import {
  getObjectTypeById,
  getPrimaryProgrammaticObjectTypes,
  getSubtypeCategoryObjectTypes,
} from "@/data/project-object-types";
import { getActiveMaterials, getMaterialById } from "@/data/project-materials";
import { projectSizes, getSizeById } from "@/data/project-size-taxonomy";
import { getSeoFeatures, getFeatureById } from "@/data/project-feature-taxonomy";
import { irkutskRegionTaxonomy } from "@/data/irkutsk-region-taxonomy";
import {
  buildTaxonomyUrl,
  combinationId,
  resolveMaterialSlug,
} from "@/lib/taxonomy/taxonomy-slug-builder";
import {
  buildTaxonomyDescription,
  buildTaxonomyH1,
  buildTaxonomySeoTitle,
} from "@/lib/taxonomy/taxonomy-title-builder";
import { resolveTaxonomyIndexing } from "@/lib/taxonomy/taxonomy-indexing-rules";
import { resolveTaxonomyCanonical } from "@/lib/taxonomy/taxonomy-canonical-rules";
import { calculateTaxonomyCombinationPriority } from "@/lib/taxonomy/taxonomy-priority";

type BuildOpts = {
  objectTypeId: string;
  materialId?: string;
  sizeId?: string;
  featureId?: string;
  regionId?: string;
  level: 1 | 2 | 3 | 4;
  pageType: TaxonomyCombination["pageType"];
  defaultStatus?: TaxonomyCombinationStatus;
};

function assessRisks(opts: BuildOpts): TaxonomyCombination["risks"] {
  let thin: TaxonomyRiskLevel = "low";
  let cannibal: TaxonomyRiskLevel = "low";
  let duplicate: TaxonomyRiskLevel = "low";

  if (opts.level >= 3) {
    thin = "high";
    cannibal = "medium";
    duplicate = "medium";
  } else if (opts.level === 2) {
    thin = "medium";
    cannibal = "medium";
  }

  const size = opts.sizeId ? getSizeById(opts.sizeId) : undefined;
  if (size?.catalogCategorySlug) duplicate = "high";
  const material = opts.materialId ? getMaterialById(opts.materialId) : undefined;
  if (material?.notes?.includes("catalog")) duplicate = "high";

  return {
    thinContentRisk: thin,
    cannibalizationRisk: cannibal,
    duplicateRisk: duplicate,
  };
}

function buildOne(opts: BuildOpts): TaxonomyCombination | null {
  const objectType = getObjectTypeById(opts.objectTypeId);
  if (!objectType || objectType.status === "future") return null;

  if (opts.materialId) {
    const m = getMaterialById(opts.materialId);
    if (!m || m.status === "future" || !m.applicableObjectTypes.includes(opts.objectTypeId))
      return null;
  }
  if (opts.sizeId) {
    const s = getSizeById(opts.sizeId);
    if (!s || !s.applicableObjectTypes.includes(opts.objectTypeId)) return null;
    if (s.type === "rooms" || s.type === "bedrooms") return null;
  }
  if (opts.featureId) {
    const f = getFeatureById(opts.featureId);
    if (!f || f.filterOnly || !f.applicableObjectTypes.includes(opts.objectTypeId)) return null;
  }
  if (opts.regionId) {
    const r = irkutskRegionTaxonomy.find((x) => x.id === opts.regionId);
    if (!r) return null;
  }

  const material = opts.materialId ? getMaterialById(opts.materialId) : undefined;
  const size = opts.sizeId ? getSizeById(opts.sizeId) : undefined;
  const feature = opts.featureId ? getFeatureById(opts.featureId) : undefined;

  const materialSlug = material ? resolveMaterialSlug(material, objectType) : undefined;

  const { slug, url } = buildTaxonomyUrl({
    objectType,
    materialSlug,
    sizeSlug: size?.slug,
    featureSlug: feature?.slug,
    regionSlug: opts.regionId
      ? irkutskRegionTaxonomy.find((r) => r.id === opts.regionId)?.slug
      : undefined,
    pageType: opts.pageType,
  });

  const id = combinationId({
    object: opts.objectTypeId,
    material: opts.materialId,
    size: opts.sizeId,
    feature: opts.featureId,
    region: opts.regionId,
  });

  const partial: TaxonomyCombination = {
    id,
    level: opts.level,
    objectTypeId: opts.objectTypeId,
    materialId: opts.materialId,
    sizeId: opts.sizeId,
    featureId: opts.featureId,
    regionId: opts.regionId,
    pageType: opts.pageType,
    slug,
    url,
    h1: "",
    seoTitle: "",
    seoDescription: "",
    status: opts.defaultStatus ?? "planned",
    indexing: { indexable: false, sitemap: false },
    priority: { publishPriority: "P3", reason: "" },
    requirements: {
      requiresRealProjects: objectType.requiresRealProjects,
      minProjectsCount: objectType.requiresRealProjects ? 1 : 0,
      requiresUniqueIntro: opts.level >= 2,
      requiresFAQ: true,
      requiresCTA: true,
      requiresLeadMagnet: opts.level <= 2,
      requiresHumanReview: opts.level >= 2,
    },
    risks: assessRisks(opts),
    catalogCategorySlug: size?.catalogCategorySlug ?? feature?.catalogCategorySlug,
  };

  partial.h1 = buildTaxonomyH1(partial);
  partial.seoTitle = buildTaxonomySeoTitle(partial);
  partial.seoDescription = buildTaxonomyDescription(partial);
  partial.priority = calculateTaxonomyCombinationPriority(partial);
  partial.indexing = resolveTaxonomyIndexing(partial);
  partial.status = partial.indexing.indexable
    ? partial.status
    : (opts.defaultStatus ?? partial.status);
  const canonical = resolveTaxonomyCanonical(partial);
  if (canonical) partial.indexing.canonicalUrl = canonical;

  if (partial.risks.duplicateRisk === "high" && partial.catalogCategorySlug) {
    partial.notes = `Overlap с /catalog/kategoriya/${partial.catalogCategorySlug}`;
  }

  return partial;
}

/** Генерация кандидатов комбинаций (без публикации страниц). */
export function buildTaxonomyCombinations(): TaxonomyCombination[] {
  const out: TaxonomyCombination[] = [];
  const seen = new Set<string>();

  const push = (c: TaxonomyCombination | null) => {
    if (!c || seen.has(c.id)) return;
    seen.add(c.id);
    out.push(c);
  };

  // Category pages для подтипов (уникальный object slug)
  for (const objectType of getSubtypeCategoryObjectTypes()) {
    push(
      buildOne({
        objectTypeId: objectType.id,
        level: 1,
        pageType: "project-category",
        defaultStatus: "needs-keyword-data",
      }),
    );
  }

  for (const objectType of getPrimaryProgrammaticObjectTypes()) {
    // L1 materials
    for (const material of getActiveMaterials()) {
      if (!material.applicableObjectTypes.includes(objectType.id)) continue;
      push(
        buildOne({
          objectTypeId: objectType.id,
          materialId: material.id,
          level: 1,
          pageType: "project-material-page",
          defaultStatus: "planned",
        }),
      );
    }

    // L1 sizes (indexable candidates only for P1 sizes)
    for (const size of projectSizes) {
      if (!size.applicableObjectTypes.includes(objectType.id)) continue;
      if (size.type === "rooms" || size.type === "bedrooms") continue;
      push(
        buildOne({
          objectTypeId: objectType.id,
          sizeId: size.id,
          level: 1,
          pageType: "project-size-page",
          defaultStatus: size.indexableByDefault ? "planned" : "needs-keyword-data",
        }),
      );
    }

    // L1 features
    for (const feature of getSeoFeatures()) {
      if (!feature.applicableObjectTypes.includes(objectType.id)) continue;
      push(
        buildOne({
          objectTypeId: objectType.id,
          featureId: feature.id,
          level: 1,
          pageType: "project-feature-page",
          defaultStatus: "needs-keyword-data",
        }),
      );
    }

    // L1 regions
    for (const region of irkutskRegionTaxonomy) {
      if (region.type === "snt" || region.type === "future") continue;
      push(
        buildOne({
          objectTypeId: objectType.id,
          regionId: region.id,
          level: 1,
          pageType: "project-location-page",
          defaultStatus: region.indexableByDefault ? "planned" : "needs-keyword-data",
        }),
      );
    }

    // L2 object + material + size (P1 sizes only)
    for (const material of getActiveMaterials().filter((m) => m.commercialIntent === "high")) {
      if (!material.applicableObjectTypes.includes(objectType.id)) continue;
      for (const size of projectSizes.filter((s) => s.priority === "P1" && s.type === "dimensions")) {
        if (!size.applicableObjectTypes.includes(objectType.id)) continue;
        push(
          buildOne({
            objectTypeId: objectType.id,
            materialId: material.id,
            sizeId: size.id,
            level: 2,
            pageType: "project-combination-page",
            defaultStatus: "needs-keyword-data",
          }),
        );
      }
    }

    // L3: object + material + region for P1 geo
    for (const material of getActiveMaterials().filter((m) => m.commercialIntent === "high")) {
      if (!material.applicableObjectTypes.includes(objectType.id)) continue;
      for (const region of irkutskRegionTaxonomy.filter((r) => r.priority === "P1")) {
        push(
          buildOne({
            objectTypeId: objectType.id,
            materialId: material.id,
            regionId: region.id,
            level: 3,
            pageType: "project-combination-page",
            defaultStatus: "draft",
          }),
        );
      }
    }
  }

  return out.sort(
    (a, b) =>
      a.priority.publishPriority.localeCompare(b.priority.publishPriority) ||
      a.url.localeCompare(b.url),
  );
}

let cached: TaxonomyCombination[] | null = null;

export function getTaxonomyCombinations(): TaxonomyCombination[] {
  if (!cached) cached = buildTaxonomyCombinations();
  return cached;
}

export function getTaxonomyCombinationStats() {
  const items = getTaxonomyCombinations();
  const byStatus: Record<string, number> = {};
  const byLevel: Record<number, number> = {};
  const byPriority: Record<string, number> = {};

  for (const c of items) {
    byStatus[c.status] = (byStatus[c.status] ?? 0) + 1;
    byLevel[c.level] = (byLevel[c.level] ?? 0) + 1;
    byPriority[c.priority.publishPriority] = (byPriority[c.priority.publishPriority] ?? 0) + 1;
  }

  return {
    total: items.length,
    indexable: items.filter((c) => c.indexing.indexable).length,
    filterOnly: items.filter((c) => c.pageType === "filter-only" || c.status === "filter-only")
      .length,
    needsKeywordData: items.filter((c) => c.status === "needs-keyword-data").length,
    byStatus,
    byLevel,
    byPriority,
  };
}
