import type { TaxonomyCombination } from "@/types/project-taxonomy";
import { getObjectTypeById } from "@/data/project-object-types";
import { getMaterialById } from "@/data/project-materials";
import { getSizeById } from "@/data/project-size-taxonomy";
import { getFeatureById } from "@/data/project-feature-taxonomy";
import { getRegionById } from "@/data/irkutsk-region-taxonomy";

const DEFAULT_REGION = "Иркутске и Иркутской области";

export function buildTaxonomyH1(combination: Pick<
  TaxonomyCombination,
  "objectTypeId" | "materialId" | "sizeId" | "featureId" | "regionId" | "pageType"
>): string {
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

  if (combination.pageType === "project-location-page" && object && region) {
    return `Строительство ${object.pluralTitle.toLowerCase()} в ${region.title}`;
  }

  if (material && size && object && !feature) {
    const materialTitle =
      object.category === "bathhouse"
        ? material.title.replace(/^Дома/, "Бани").replace(/^Каркасные дома/, "Каркасные бани")
        : material.title;
    return `${materialTitle} ${size.title}${region ? ` в ${region.title}` : ""}`.trim();
  }

  if (material && object && !size && !feature) {
    const materialTitle =
      object.category === "bathhouse"
        ? material.title.replace(/^Дома/, "Бани").replace(/^Каркасные дома/, "Каркасные бани")
        : material.title;
    return `${materialTitle}${region ? ` в ${region.title}` : ""}`.trim();
  }

  if (size && object && !material) {
    return `${object.pluralTitle} ${size.title}${region ? ` в ${region.title}` : ""}`;
  }

  if (feature && object) {
    return `${object.pluralTitle} ${feature.title}${region ? ` в ${region.title}` : ""}`;
  }

  if (object) {
    return `${object.pluralTitle} под ключ${region ? ` в ${region.title}` : ""}`;
  }

  return "Проекты строительства";
}

export function buildTaxonomySeoTitle(
  combination: Pick<
    TaxonomyCombination,
    "h1" | "objectTypeId" | "materialId" | "regionId" | "pageType"
  >,
): string {
  const h1 = combination.h1 || buildTaxonomyH1(combination);
  const region = combination.regionId
    ? getRegionById(combination.regionId)
    : undefined;
  const suffix = region ? "" : ` — ${DEFAULT_REGION}`;
  const base = h1.length > 45 ? h1.slice(0, 42) + "…" : h1;
  return `${base}${suffix} — проекты и расчёт`.slice(0, 60);
}

export function buildTaxonomyDescription(
  combination: Pick<
    TaxonomyCombination,
    "objectTypeId" | "materialId" | "sizeId" | "featureId" | "regionId" | "pageType"
  >,
): string {
  const object = combination.objectTypeId
    ? getObjectTypeById(combination.objectTypeId)
    : undefined;
  const material = combination.materialId
    ? getMaterialById(combination.materialId)
    : undefined;
  const region = combination.regionId
    ? getRegionById(combination.regionId)
    : undefined;

  const where = region ? ` в ${region.title}` : ` в ${DEFAULT_REGION}`;
  const what = material
    ? material.title.toLowerCase()
    : object
      ? object.pluralTitle.toLowerCase()
      : "загородное строительство";

  return (
    `Подбор ${what}${where}: проекты, ориентиры по бюджету и этапность работ. ` +
    `Предварительный расчёт без обещания точной цены онлайн.`
  ).slice(0, 160);
}

export function buildTaxonomyIntro(
  combination: Pick<
    TaxonomyCombination,
    "objectTypeId" | "materialId" | "sizeId" | "featureId" | "regionId"
  >,
): string {
  const object = combination.objectTypeId
    ? getObjectTypeById(combination.objectTypeId)
    : undefined;
  const material = combination.materialId
    ? getMaterialById(combination.materialId)
    : undefined;
  const size = combination.sizeId ? getSizeById(combination.sizeId) : undefined;

  const parts: string[] = [];
  if (object) parts.push(object.description);
  if (material) parts.push(material.description);
  if (size) parts.push(`Типоразмер ${size.title} — ориентир для подбора проекта и сметы.`);

  return parts.join(" ") || "Подбор проекта под участок, бюджет и сценарий жизни.";
}
