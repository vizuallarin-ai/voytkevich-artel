import type { CatalogFilters, Material, Project, ProjectPurpose } from "@/types";

const MATERIAL_ALIASES: Record<string, Material[]> = {
  brus: ["брус", "клееный брус"],
  karkas: ["каркас"],
  gazobeton: ["газобетон"],
  kirpich: ["кирпич"],
};

const AREA_PRESETS: Record<string, { areaMin?: number; areaMax?: number }> = {
  "до-100": { areaMax: 100 },
  "100-150": { areaMin: 100, areaMax: 150 },
  "150-200": { areaMin: 150, areaMax: 200 },
  "200+": { areaMin: 200 },
};

const BUDGET_PRESETS: Record<string, { priceMin?: number; priceMax?: number }> = {
  "до-5-mln": { priceMax: 5_000_000 },
  "5-8-mln": { priceMin: 5_000_000, priceMax: 8_000_000 },
  "8-12-mln": { priceMin: 8_000_000, priceMax: 12_000_000 },
  "12+": { priceMin: 12_000_000 },
};

const FEATURE_ALIASES: Record<string, Partial<CatalogFilters>> = {
  terrace: { terrace: true },
  garage: { garage: true },
  sauna: { sauna: true },
  cabinet: { cabinet: true },
};

const PURPOSE_ALIASES: Record<string, ProjectPurpose> = {
  family: "семья",
  semya: "семья",
  dacha: "дача",
  dachi: "дача",
  permanent: "постоянное",
  postoyannoe: "постоянное",
  countryside: "загородная",
};

function parseShorthand(searchParams: Record<string, string | string[] | undefined>): Partial<CatalogFilters> {
  const get = (key: string) => {
    const v = searchParams[key];
    return Array.isArray(v) ? v[0] : v;
  };
  const patch: Partial<CatalogFilters> = {};

  const area = get("area");
  if (area && AREA_PRESETS[area]) Object.assign(patch, AREA_PRESETS[area]);

  const budget = get("budget");
  if (budget && BUDGET_PRESETS[budget]) Object.assign(patch, BUDGET_PRESETS[budget]);

  const material = get("material");
  if (material && MATERIAL_ALIASES[material]) patch.material = MATERIAL_ALIASES[material];

  const feature = get("feature");
  if (feature && FEATURE_ALIASES[feature]) Object.assign(patch, FEATURE_ALIASES[feature]);

  const purpose = get("purpose");
  if (purpose) {
    const p = PURPOSE_ALIASES[purpose] ?? (purpose as ProjectPurpose);
    patch.purpose = [p];
  }

  const floors = get("floors");
  if (floors && !searchParams.floors) patch.floors = [Number(floors)];

  return patch;
}

export function parseCatalogFilters(
  searchParams: Record<string, string | string[] | undefined>,
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

  const base: CatalogFilters = {
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
    cabinet: get("cabinet") === "1",
    purpose: getArr("purpose") as CatalogFilters["purpose"],
    sort: (get("sort") as CatalogFilters["sort"]) ?? "featured",
  };

  return { ...base, ...parseShorthand(searchParams) };
}

export function filterProjects(projects: Project[], filters: CatalogFilters): Project[] {
  let result = [...projects];

  if (filters.q) {
    const q = filters.q.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.specs.style.toLowerCase().includes(q) ||
        p.specs.material.toLowerCase().includes(q),
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
  if (filters.cabinet) result = result.filter((p) => p.specs.hasCabinet);
  if (filters.purpose?.length)
    result = result.filter((p) =>
      filters.purpose!.some((purpose) => p.purpose?.includes(purpose)),
    );

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
    case "duration-asc":
      result.sort((a, b) => a.specs.buildTimeMonths - b.specs.buildTimeMonths);
      break;
    case "duration-desc":
      result.sort((a, b) => b.specs.buildTimeMonths - a.specs.buildTimeMonths);
      break;
    case "newest":
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
    default:
      result.sort((a, b) => Number(b.featured) - Number(a.featured) || a.price - b.price);
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

export function getActiveFilterLabels(filters: CatalogFilters): { key: string; label: string }[] {
  const labels: { key: string; label: string }[] = [];
  if (filters.q) labels.push({ key: "q", label: `Поиск: ${filters.q}` });
  if (filters.areaMin && filters.areaMax)
    labels.push({ key: "area", label: `${filters.areaMin}–${filters.areaMax} м²` });
  else if (filters.areaMax) labels.push({ key: "areaMax", label: `до ${filters.areaMax} м²` });
  else if (filters.areaMin) labels.push({ key: "areaMin", label: `от ${filters.areaMin} м²` });
  if (filters.priceMin && filters.priceMax)
    labels.push({
      key: "price",
      label: `${(filters.priceMin / 1_000_000).toFixed(0)}–${(filters.priceMax / 1_000_000).toFixed(0)} млн ₽`,
    });
  else if (filters.priceMax)
    labels.push({ key: "priceMax", label: `до ${(filters.priceMax / 1_000_000).toFixed(0)} млн ₽` });
  else if (filters.priceMin)
    labels.push({ key: "priceMin", label: `от ${(filters.priceMin / 1_000_000).toFixed(0)} млн ₽` });
  filters.floors?.forEach((f) => labels.push({ key: `floors-${f}`, label: `${f} этаж` }));
  filters.material?.forEach((m) => labels.push({ key: `material-${m}`, label: m }));
  filters.purpose?.forEach((p) => labels.push({ key: `purpose-${p}`, label: p }));
  if (filters.terrace) labels.push({ key: "terrace", label: "Терраса" });
  if (filters.garage) labels.push({ key: "garage", label: "Гараж" });
  if (filters.sauna) labels.push({ key: "sauna", label: "Баня" });
  if (filters.cabinet) labels.push({ key: "cabinet", label: "Кабинет" });
  return labels;
}

export function clearFilterKey(filters: CatalogFilters, key: string): CatalogFilters {
  const next = { ...filters };
  if (key === "q") delete next.q;
  if (key === "area" || key === "areaMin") delete next.areaMin;
  if (key === "area" || key === "areaMax") delete next.areaMax;
  if (key === "price" || key === "priceMin") delete next.priceMin;
  if (key === "price" || key === "priceMax") delete next.priceMax;
  if (key.startsWith("floors-")) {
    const f = Number(key.replace("floors-", ""));
    next.floors = next.floors?.filter((x) => x !== f);
    if (!next.floors?.length) delete next.floors;
  }
  if (key.startsWith("material-")) {
    const m = key.replace("material-", "") as Material;
    next.material = next.material?.filter((x) => x !== m);
    if (!next.material?.length) delete next.material;
  }
  if (key.startsWith("purpose-")) {
    const p = key.replace("purpose-", "") as ProjectPurpose;
    next.purpose = next.purpose?.filter((x) => x !== p);
    if (!next.purpose?.length) delete next.purpose;
  }
  if (key === "terrace") delete next.terrace;
  if (key === "garage") delete next.garage;
  if (key === "sauna") delete next.sauna;
  if (key === "cabinet") delete next.cabinet;
  return next;
}

export function getMaterialsInCatalog(projects: Project[]): Material[] {
  return [...new Set(projects.map((p) => p.specs.material))];
}
