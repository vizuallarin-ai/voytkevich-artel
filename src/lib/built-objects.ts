import type {
  BuiltObject,
  BuiltObjectArea,
  BuiltObjectImage,
  BuiltObjectListFilters,
  BuiltObjectMapCoordinates,
  BuiltObjectStatus,
} from "@/types/built-object";
import { getServicePageBySlug } from "@/data/service-pages";
import { getBuiltObjectAreaBySlug } from "@/data/built-object-areas";
import { trackEvent } from "@/lib/analytics";

const AREA_PRESETS: Record<
  NonNullable<BuiltObjectListFilters["areaPreset"]>,
  { min?: number; max?: number }
> = {
  "do-100": { max: 100 },
  "100-150": { min: 100, max: 150 },
  "150-200": { min: 150, max: 200 },
  "200-plus": { min: 200 },
};

export function isBuiltObjectPublic(item: BuiltObject): boolean {
  return item.status === "published";
}

export function isBuiltObjectIndexable(item: BuiltObject): boolean {
  return item.status === "published";
}

export function getPublishedBuiltObjects(objects: BuiltObject[]): BuiltObject[] {
  return objects.filter(isBuiltObjectPublic);
}

function normalizeMaterial(m?: string): string {
  return (m ?? "").toLowerCase();
}

export function getPublicMapCoordinates(
  item: BuiltObject,
): BuiltObjectMapCoordinates | null {
  if (!item.allowedPublicFields.location) return null;

  if (item.location.showExactCoordinates && item.location.coordinates) {
    return {
      lat: item.location.coordinates.lat,
      lng: item.location.coordinates.lng,
      approximate: false,
    };
  }

  if (item.location.approximateCoordinates) {
    return {
      lat: item.location.approximateCoordinates.lat,
      lng: item.location.approximateCoordinates.lng,
      approximate: true,
    };
  }

  const areaSlug = item.location.areaSlug;
  if (areaSlug) {
    const area = getBuiltObjectAreaBySlug(areaSlug);
    if (area?.center) {
      return { lat: area.center.lat, lng: area.center.lng, approximate: true };
    }
  }

  return null;
}

export function getPublicCoverImage(item: BuiltObject): BuiltObjectImage | undefined {
  if (!item.allowedPublicFields.photos || !item.images?.length) return undefined;
  return item.images.find((img) => img.allowedForPublicUse !== false);
}

export function filterBuiltObjectsList(
  objects: BuiltObject[],
  filters: BuiltObjectListFilters,
): BuiltObject[] {
  let result = getPublishedBuiltObjects(objects);

  if (filters.material?.length) {
    result = result.filter((o) =>
      filters.material!.some((m) => normalizeMaterial(o.house.material).includes(m.toLowerCase())),
    );
  }
  if (filters.floors?.length) {
    result = result.filter(
      (o) => o.house.floors != null && filters.floors!.includes(o.house.floors),
    );
  }
  if (filters.areaPreset) {
    const preset = AREA_PRESETS[filters.areaPreset];
    if (preset.min != null) {
      result = result.filter((o) => (o.house.area ?? 0) >= preset.min!);
    }
    if (preset.max != null) {
      result = result.filter((o) => (o.house.area ?? 0) <= preset.max!);
    }
  }
  if (filters.year) {
    result = result.filter((o) => o.timeline?.year === filters.year);
  }
  if (filters.purpose?.length) {
    result = result.filter((o) =>
      filters.purpose!.some((p) => o.house.purpose?.includes(p)),
    );
  }
  if (filters.objectType?.length) {
    result = result.filter((o) => filters.objectType!.includes(o.objectType));
  }
  if (filters.areaSlug) {
    result = result.filter((o) => o.location.areaSlug === filters.areaSlug);
  }
  if (filters.hasCase) {
    result = result.filter(
      (o) => Boolean(o.caseSlug) && o.allowedPublicFields.caseLink,
    );
  }

  return result;
}

export function getBuiltObjectsForArea(
  objects: BuiltObject[],
  area: BuiltObjectArea,
): BuiltObject[] {
  return getPublishedBuiltObjects(objects).filter((o) => {
    if (o.location.areaSlug === area.slug) return true;
    if (area.city && o.location.city === area.city) return true;
    if (area.district && o.location.district === area.district) return true;
    if (area.settlement && o.location.settlement === area.settlement) return true;
    if (area.region && o.location.region === area.region && !area.city && !area.district) {
      return o.location.areaSlug === area.slug;
    }
    return false;
  });
}

export function countObjectsByArea(
  objects: BuiltObject[],
): Record<string, number> {
  const published = getPublishedBuiltObjects(objects);
  const counts: Record<string, number> = {};
  for (const obj of published) {
    const slug = obj.location.areaSlug;
    if (slug) counts[slug] = (counts[slug] ?? 0) + 1;
  }
  return counts;
}

export type BuiltObjectsStats = {
  total: number;
  materials: string[];
  areaRange: { min?: number; max?: number };
  floors: number[];
  areas: string[];
  withCases: number;
};

export function computeBuiltObjectsStats(objects: BuiltObject[]): BuiltObjectsStats | null {
  const published = getPublishedBuiltObjects(objects);
  if (!published.length) return null;

  const materials = [...new Set(published.map((o) => o.house.material).filter(Boolean))] as string[];
  const areas = [...new Set(published.map((o) => o.location.areaSlug).filter(Boolean))] as string[];
  const floors = [...new Set(published.map((o) => o.house.floors).filter((f): f is number => f != null))];
  const houseAreas = published.map((o) => o.house.area).filter((a): a is number => a != null);
  const withCases = published.filter(
    (o) => o.caseSlug && o.allowedPublicFields.caseLink,
  ).length;

  return {
    total: published.length,
    materials,
    areaRange: {
      min: houseAreas.length ? Math.min(...houseAreas) : undefined,
      max: houseAreas.length ? Math.max(...houseAreas) : undefined,
    },
    floors,
    areas,
    withCases,
  };
}

export function getBuiltObjectsForProject(
  objects: BuiltObject[],
  projectSlug: string,
  limit = 3,
): BuiltObject[] {
  return getPublishedBuiltObjects(objects)
    .filter((o) => o.project?.projectSlug === projectSlug)
    .slice(0, limit);
}

export function getBuiltObjectsForService(
  objects: BuiltObject[],
  serviceSlug: string,
  limit = 3,
): BuiltObject[] {
  const page = getServicePageBySlug(serviceSlug);
  if (!page) return [];

  return getPublishedBuiltObjects(objects)
    .filter((o) => {
      const mat = page.calculatorParams?.material?.toLowerCase();
      if (mat && o.house.material?.toLowerCase().includes(mat)) return true;
      const floors = page.calculatorParams?.floors;
      if (floors && o.house.floors === floors) return true;
      if (serviceSlug.includes("irkutskoy-oblasti") && o.location.region?.includes("Иркутская")) {
        return true;
      }
      return false;
    })
    .slice(0, limit);
}

export function getBuiltObjectByCaseSlug(
  objects: BuiltObject[],
  caseSlug: string,
): BuiltObject | undefined {
  return getPublishedBuiltObjects(objects).find(
    (o) => o.caseSlug === caseSlug && o.allowedPublicFields.caseLink,
  );
}

export function buildBuiltObjectLeadComment(
  opts: {
    objectSlug?: string;
    areaSlug?: string;
    material?: string;
    floors?: number;
    areaRange?: string;
    caseSlug?: string;
    projectSlugs?: string[];
    ctaId?: string;
  } = {},
): string {
  const lines = ["source: objects-map", "URL: /objects-map"];
  if (opts.objectSlug) lines.push(`selectedObjectSlug: ${opts.objectSlug}`);
  if (opts.areaSlug) lines.push(`selectedAreaSlug: ${opts.areaSlug}`);
  if (opts.material) lines.push(`selectedMaterial: ${opts.material}`);
  if (opts.floors) lines.push(`selectedFloors: ${opts.floors}`);
  if (opts.areaRange) lines.push(`selectedAreaRange: ${opts.areaRange}`);
  if (opts.caseSlug) lines.push(`relatedCaseSlug: ${opts.caseSlug}`);
  if (opts.projectSlugs?.length) {
    lines.push(`relatedProjectSlugs: ${opts.projectSlugs.join(", ")}`);
  }
  if (opts.ctaId) lines.push(`selectedCTA: ${opts.ctaId}`);
  return lines.join("\n");
}

export function builtObjectStatusLabel(status: BuiltObjectStatus): string {
  switch (status) {
    case "published":
      return "Опубликован";
    case "draft":
      return "Черновик";
    case "needs-data":
      return "Требуются данные";
    case "noindex":
      return "Не для индексации";
    default:
      return status;
  }
}

export function builtObjectTypeLabel(type: BuiltObject["objectType"]): string {
  switch (type) {
    case "built-house":
      return "Построен";
    case "in-progress":
      return "В процессе";
    case "project-adaptation":
      return "Адаптация проекта";
    case "case-only":
      return "Кейс";
    default:
      return type;
  }
}

export type ObjectsMapAnalyticsPayload = {
  objectSlug?: string;
  areaSlug?: string;
  material?: string;
  floors?: number;
  areaRange?: string;
  caseSlug?: string;
  source?: string;
  currentUrl?: string;
};

export function trackObjectsMapEvent(
  eventName:
    | "objects_map_viewed"
    | "objects_map_filter_used"
    | "objects_map_object_clicked"
    | "objects_map_case_clicked"
    | "objects_map_project_clicked"
    | "objects_map_lead_form_opened"
    | "objects_map_lead_submitted"
    | "objects_map_area_clicked",
  payload?: ObjectsMapAnalyticsPayload,
) {
  trackEvent(eventName, payload);
}

export function buildCatalogLinkForObject(item: BuiltObject): string {
  const params = new URLSearchParams({ source: "objects-map", object: item.slug });
  if (item.house.material) params.set("material", item.house.material);
  if (item.house.floors) params.set("floors", String(item.house.floors));
  if (item.house.area) {
    if (item.house.area <= 100) params.set("areaMax", "100");
    else if (item.house.area <= 150) params.set("areaMin", "100");
  }
  return `/catalog?${params.toString()}`;
}
