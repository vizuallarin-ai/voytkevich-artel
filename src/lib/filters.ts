import type { CatalogFilters, Project } from "@/types";

export function parseCatalogFilters(
  searchParams: Record<string, string | string[] | undefined>
): CatalogFilters {
  const get = (key: string) => {
    const v = searchParams[key];
    return Array.isArray(v) ? v[0] : v;
  };
  const getNum = (key: string) => {
    const v = get(key);
    return v ? Number(v) : undefined;
  };
  const getArr = (key: string) => {
    const v = searchParams[key];
    if (!v) return undefined;
    return (Array.isArray(v) ? v : v.split(",")).filter(Boolean);
  };

  return {
    q: get("q"),
    areaMin: getNum("areaMin"),
    areaMax: getNum("areaMax"),
    priceMin: getNum("priceMin"),
    priceMax: getNum("priceMax"),
    floors: getArr("floors")?.map(Number),
    material: getArr("material") as CatalogFilters["material"],
    style: getArr("style") as CatalogFilters["style"],
    bedrooms: getArr("bedrooms")?.map(Number),
    terrace: get("terrace") === "1",
    garage: get("garage") === "1",
    sauna: get("sauna") === "1",
    sort: (get("sort") as CatalogFilters["sort"]) ?? "newest",
  };
}

export function filterProjects(
  projects: Project[],
  filters: CatalogFilters
): Project[] {
  let result = [...projects];

  if (filters.q) {
    const q = filters.q.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.specs.style.toLowerCase().includes(q)
    );
  }
  if (filters.areaMin) result = result.filter((p) => p.specs.area >= filters.areaMin!);
  if (filters.areaMax) result = result.filter((p) => p.specs.area <= filters.areaMax!);
  if (filters.priceMin) result = result.filter((p) => p.price >= filters.priceMin!);
  if (filters.priceMax) result = result.filter((p) => p.price <= filters.priceMax!);
  if (filters.floors?.length)
    result = result.filter((p) => filters.floors!.includes(p.specs.floors));
  if (filters.material?.length)
    result = result.filter((p) => filters.material!.includes(p.specs.material));
  if (filters.style?.length)
    result = result.filter((p) => filters.style!.includes(p.specs.style));
  if (filters.bedrooms?.length)
    result = result.filter((p) => filters.bedrooms!.includes(p.specs.bedrooms));
  if (filters.terrace) result = result.filter((p) => p.specs.hasTerrace);
  if (filters.garage) result = result.filter((p) => p.specs.hasGarage);
  if (filters.sauna) result = result.filter((p) => p.specs.hasSauna);

  switch (filters.sort) {
    case "price-asc":
      result.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      result.sort((a, b) => b.price - a.price);
      break;
    case "area-asc":
      result.sort((a, b) => a.specs.area - b.specs.area);
      break;
    case "area-desc":
      result.sort((a, b) => b.specs.area - a.specs.area);
      break;
    default:
      result.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  return result;
}

export function filtersToSearchParams(filters: CatalogFilters): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === "" || value === false) return;
    if (Array.isArray(value)) {
      if (value.length) params.set(key, value.join(","));
    } else {
      params.set(key, String(value));
    }
  });
  return params.toString();
}
