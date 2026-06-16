import type { PriorityTier } from "@/types/programmatic-seo";
import type { TaxonomyCombination } from "@/types/project-taxonomy";
import { getObjectTypeById } from "@/data/project-object-types";
import { getMaterialById } from "@/data/project-materials";
import { getSizeById } from "@/data/project-size-taxonomy";
import { getRegionById } from "@/data/irkutsk-region-taxonomy";

const P1_IDS = new Set([
  "houses",
  "bathhouses",
  "frame",
  "timber",
  "gas-concrete",
  "dom-8-na-10",
  "banya-3-na-3",
  "area-100-120",
  "area-120-150",
  "floors-1",
  "floors-2",
  "irkutsk",
  "irkutskaya-oblast",
]);

export function calculateTaxonomyCombinationPriority(
  combination: Pick<
    TaxonomyCombination,
    | "objectTypeId"
    | "materialId"
    | "sizeId"
    | "featureId"
    | "regionId"
    | "level"
    | "risks"
  >,
): TaxonomyCombination["priority"] {
  let score = 0;
  const reasons: string[] = [];

  const object = combination.objectTypeId
    ? getObjectTypeById(combination.objectTypeId)
    : undefined;
  const material = combination.materialId
    ? getMaterialById(combination.materialId)
    : undefined;
  const size = combination.sizeId ? getSizeById(combination.sizeId) : undefined;
  const region = combination.regionId
    ? getRegionById(combination.regionId)
    : undefined;

  if (object?.priority === "P1") {
    score += 30;
    reasons.push("P1 object");
  } else if (object?.priority === "P2") score += 20;

  if (material?.commercialIntent === "high") {
    score += 20;
    reasons.push("high commercial material");
  }

  if (size?.priority === "P1") {
    score += 25;
    reasons.push("P1 size");
  }

  if (region?.priority === "P1") {
    score += 25;
    reasons.push("P1 region");
  } else if (region?.priority === "P2") score += 15;

  if (combination.level === 1) score += 10;
  if (combination.level >= 3) score -= 15;

  if (combination.risks.cannibalizationRisk === "high") score -= 20;
  if (combination.risks.duplicateRisk === "high") score -= 15;

  const ids = [
    combination.objectTypeId,
    combination.materialId,
    combination.sizeId,
    combination.regionId,
  ].filter(Boolean);
  if (ids.some((id) => id && P1_IDS.has(id))) {
    score += 15;
    reasons.push("P1 taxonomy id match");
  }

  let publishPriority: PriorityTier = "P4";
  if (score >= 70) publishPriority = "P1";
  else if (score >= 50) publishPriority = "P2";
  else if (score >= 35) publishPriority = "P3";
  else if (score >= 20) publishPriority = "P4";
  else publishPriority = "P5";

  return {
    publishPriority,
    reason: reasons.length ? reasons.join("; ") : `score=${score}`,
  };
}
