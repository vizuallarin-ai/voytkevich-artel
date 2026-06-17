import type { Project } from "@/types";
import type { TaxonomyCombination } from "@/types/project-taxonomy";
import { getMaterialById } from "@/data/project-materials";
import { getObjectTypeById } from "@/data/project-object-types";
import { getFeatureById } from "@/data/project-feature-taxonomy";
import { getSizeById } from "@/data/project-size-taxonomy";
import { irkutskRegionTaxonomy } from "@/data/irkutsk-region-taxonomy";

const MATERIAL_MAP: Record<string, string[]> = {
  frame: ["каркас"],
  timber: ["брус", "клееный брус"],
  "gas-concrete": ["газобетон"],
  brick: ["кирпич"],
  blocks: ["газобетон", "блок"],
  combined: ["каркас", "брус", "газобетон"],
};

function materialMatches(project: Project, materialId?: string): boolean {
  if (!materialId) return true;
  const m = getMaterialById(materialId);
  if (!m) return true;
  const aliases = MATERIAL_MAP[materialId] ?? [m.title.toLowerCase()];
  const pm = project.specs.material.toLowerCase();
  return aliases.some((a) => pm.includes(a));
}

function objectTypeMatches(project: Project, objectTypeId?: string): boolean {
  if (!objectTypeId) return true;
  const ot = getObjectTypeById(objectTypeId);
  if (!ot) return true;
  if (ot.category === "bathhouse") {
    return project.specs.area < 80 || project.name.toLowerCase().includes("бан");
  }
  if (ot.id === "bathhouses") return project.specs.area < 80;
  return project.specs.area >= 40;
}

function sizeMatches(project: Project, sizeId?: string): boolean {
  if (!sizeId) return true;
  const size = getSizeById(sizeId);
  if (!size) return true;

  if (size.type === "dimensions" && size.dimensions) {
    const { width, length } = size.dimensions;
    const area = project.specs.area;
    const approxFootprint = width * length;
    return Math.abs(area - approxFootprint) <= approxFootprint * 0.35;
  }

  if (size.area) {
    const { min, max } = size.area;
    if (min != null && project.specs.area < min) return false;
    if (max != null && project.specs.area > max) return false;
    return true;
  }

  if (size.type === "floors" && size.floors != null) {
    return project.specs.floors === size.floors;
  }

  return true;
}

function featureMatches(project: Project, featureId?: string): boolean {
  if (!featureId) return true;
  const f = getFeatureById(featureId);
  if (!f) return true;
  switch (featureId) {
    case "terrace":
      return project.specs.hasTerrace;
    case "garage":
      return project.specs.hasGarage;
    case "mansard":
      return project.specs.floors >= 2;
    default:
      return true;
  }
}

export type ProjectMatchResult = {
  matched: Project[];
  related: Project[];
  fallbackUsed: boolean;
  fallbackReason?: string;
};

export function matchProjectsForProgrammaticPage(
  combination: TaxonomyCombination,
  projects: Project[],
): ProjectMatchResult {
  const minCount = combination.requirements.minProjectsCount ?? 1;

  let matched = projects.filter(
    (p) =>
      objectTypeMatches(p, combination.objectTypeId) &&
      materialMatches(p, combination.materialId) &&
      sizeMatches(p, combination.sizeId) &&
      featureMatches(p, combination.featureId),
  );

  if (matched.length >= minCount) {
    return { matched: matched.slice(0, 12), related: [], fallbackUsed: false };
  }

  let fallbackReason = "Точных совпадений мало — показаны близкие проекты.";

  const broader = projects.filter((p) => objectTypeMatches(p, combination.objectTypeId));
  if (combination.materialId) {
    const byMaterial = broader.filter((p) => materialMatches(p, combination.materialId));
    if (byMaterial.length) matched = byMaterial;
    else matched = broader;
    fallbackReason = "Показаны проекты с близкой площадью и логикой планировки.";
  } else {
    matched = broader;
  }

  const related = broader
    .filter((p) => !matched.some((m) => m.id === p.id))
    .slice(0, 6);

  if (matched.length === 0) {
    fallbackReason =
      "Пока нет точных проектов под этот запрос. Мы можем подобрать или адаптировать проект под ваши вводные.";
  }

  return {
    matched: matched.slice(0, 12),
    related,
    fallbackUsed: matched.length < minCount,
    fallbackReason: matched.length < minCount ? fallbackReason : undefined,
  };
}

export function getRelatedProjectsFallback(
  combination: TaxonomyCombination,
  projects: Project[],
  limit = 6,
): Project[] {
  const ot = combination.objectTypeId;
  return projects.filter((p) => objectTypeMatches(p, ot)).slice(0, limit);
}

export function matchByRegion(_combination: TaxonomyCombination, projects: Project[]): Project[] {
  return projects.slice(0, 8);
}

export function getRegionLabel(regionId?: string): string | undefined {
  if (!regionId) return undefined;
  return irkutskRegionTaxonomy.find((r) => r.id === regionId)?.title;
}
