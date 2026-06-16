import type { ProjectMaterial, ProjectObjectType } from "@/types/project-taxonomy";

const BATH_MATERIAL_SLUGS: Record<string, string> = {
  frame: "karkasnye-bani",
  timber: "banya-iz-brusa",
  blocks: "banya-iz-blokov",
  combined: "kombinirovannye-bani",
  log: "banya-iz-brevna",
};

/** Slug материала с учётом типа объекта (дом vs баня). */
export function resolveMaterialSlug(
  material: Pick<ProjectMaterial, "id" | "slug">,
  objectType: ProjectObjectType,
): string {
  if (objectType.category === "bathhouse") {
    return BATH_MATERIAL_SLUGS[material.id] ?? material.slug.replace(/^doma-/, "banya-");
  }
  return material.slug;
}

/** Префикс URL для проектных страниц по типу объекта. */
export function getProjectUrlPrefix(objectType: ProjectObjectType): string {
  return `/proekty-${objectType.urlSegment}`;
}

/** Префикс URL для geo-страниц строительства. */
export function getLocationUrlPrefix(objectType: ProjectObjectType): string {
  return `/stroitelstvo-${objectType.urlSegment}`;
}

export function buildMaterialSlug(materialSlug: string): string {
  return materialSlug.replace(/^doma-/, "").replace(/^karkasnye-/, "karkasnye-doma");
}

export function buildTaxonomySlug(parts: string[]): string {
  return parts
    .filter(Boolean)
    .join("-")
    .replace(/[^a-z0-9-]/gi, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export type SlugBuildInput = {
  objectType?: ProjectObjectType;
  materialSlug?: string;
  sizeSlug?: string;
  featureSlug?: string;
  regionSlug?: string;
  pageType: string;
};

export function buildTaxonomyUrl(input: SlugBuildInput): { slug: string; url: string } {
  const { objectType, materialSlug, sizeSlug, featureSlug, regionSlug, pageType } = input;

  if (!objectType) {
    return { slug: "", url: "/" };
  }

  if (pageType === "project-location-page" && regionSlug) {
    const slug = regionSlug;
    return { slug, url: `${getLocationUrlPrefix(objectType)}/${slug}` };
  }

  const prefix = getProjectUrlPrefix(objectType);
  let slug = "";

  // Составные комбинации — до одиночных измерений
  if (materialSlug && sizeSlug && regionSlug) {
    slug = buildTaxonomySlug([materialSlug, sizeSlug, `v-${regionSlug}`]);
  } else if (materialSlug && sizeSlug) {
    slug = buildTaxonomySlug([materialSlug, sizeSlug]);
  } else if (materialSlug && regionSlug) {
    slug = buildTaxonomySlug([materialSlug, `v-${regionSlug}`]);
  } else if (sizeSlug && regionSlug) {
    slug = buildTaxonomySlug([sizeSlug, `v-${regionSlug}`]);
  } else if (materialSlug && featureSlug) {
    slug = buildTaxonomySlug([materialSlug, featureSlug]);
  } else if (materialSlug && !sizeSlug && !featureSlug && !regionSlug) {
    slug = materialSlug;
  } else if (sizeSlug && !materialSlug && !featureSlug && !regionSlug) {
    slug = sizeSlug;
  } else if (featureSlug && !materialSlug && !sizeSlug && !regionSlug) {
    slug = featureSlug;
  } else if (pageType === "project-category") {
    slug = objectType.slug;
  } else {
    slug = objectType.slug;
  }

  return { slug, url: `${prefix}/${slug}` };
}

export function combinationId(parts: Record<string, string | undefined>): string {
  return Object.entries(parts)
    .filter(([, v]) => v)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join("|");
}
