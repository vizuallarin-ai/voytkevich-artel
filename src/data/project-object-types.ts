import type { ProjectObjectType } from "@/types/project-taxonomy";

const HOUSE_MATERIALS = ["frame", "timber", "gas-concrete", "brick", "blocks", "combined"];
const BATH_MATERIALS = ["timber", "frame", "blocks", "combined"];
const HOUSE_SIZES = [
  "dom-6-na-8",
  "dom-8-na-8",
  "dom-8-na-10",
  "dom-10-na-10",
  "area-50-80",
  "area-80-100",
  "area-100-120",
  "area-120-150",
  "area-150-200",
  "floors-1",
  "floors-2",
  "floors-mansard",
];
const BATH_SIZES = [
  "banya-3-na-3",
  "banya-3-na-4",
  "banya-4-na-4",
  "banya-4-na-6",
  "banya-6-na-6",
];
const HOUSE_FEATURES = [
  "terrace",
  "garage",
  "mansard",
  "second-light",
  "panoramic-windows",
  "family-with-kids",
  "permanent-living",
];
const PAGE_TYPES = [
  "project-category",
  "project-material-page",
  "project-size-page",
  "project-feature-page",
  "project-location-page",
] as const;

export const projectObjectTypes: ProjectObjectType[] = [
  {
    id: "houses",
    slug: "doma",
    title: "Дом",
    pluralTitle: "Дома",
    category: "house",
    urlSegment: "domov",
    description: "Малоэтажные дома для постоянного или сезонного проживания.",
    defaultIntent: "commercial",
    allowedMaterials: HOUSE_MATERIALS,
    allowedSizes: HOUSE_SIZES,
    allowedFeatures: HOUSE_FEATURES,
    allowedPageTypes: [...PAGE_TYPES],
    indexableByDefault: false,
    requiresRealProjects: true,
    requiresKeywordValidation: false,
    priority: "P1",
    status: "active",
  },
  {
    id: "bathhouses",
    slug: "bani",
    title: "Баня",
    pluralTitle: "Бани",
    category: "bathhouse",
    urlSegment: "ban",
    description: "Бани и банные комплексы под ключ.",
    defaultIntent: "transactional",
    allowedMaterials: BATH_MATERIALS,
    allowedSizes: BATH_SIZES,
    allowedFeatures: ["sauna", "terrace", "utility-room"],
    allowedPageTypes: [...PAGE_TYPES],
    indexableByDefault: false,
    requiresRealProjects: true,
    requiresKeywordValidation: false,
    priority: "P1",
    status: "active",
  },
  {
    id: "cottages",
    slug: "kottedzhi",
    title: "Коттедж",
    pluralTitle: "Коттеджи",
    category: "cottage",
    urlSegment: "domov",
    description: "Коттеджи повышенной площади и комплектации.",
    defaultIntent: "commercial",
    allowedMaterials: HOUSE_MATERIALS,
    allowedSizes: ["area-120-150", "area-150-200", "area-200-plus", "floors-2"],
    allowedFeatures: HOUSE_FEATURES,
    allowedPageTypes: ["project-category", "project-material-page", "project-location-page"],
    indexableByDefault: false,
    requiresRealProjects: true,
    requiresKeywordValidation: true,
    priority: "P2",
    status: "active",
  },
  {
    id: "country-houses",
    slug: "zagorodnye-doma",
    title: "Загородный дом",
    pluralTitle: "Загородные дома",
    category: "country-house",
    urlSegment: "domov",
    description: "Дома для жизни за городом — участок, логистика, инженерия.",
    defaultIntent: "local",
    allowedMaterials: HOUSE_MATERIALS,
    allowedSizes: HOUSE_SIZES,
    allowedFeatures: HOUSE_FEATURES,
    allowedPageTypes: [...PAGE_TYPES],
    indexableByDefault: false,
    requiresRealProjects: true,
    requiresKeywordValidation: true,
    priority: "P2",
    status: "active",
  },
  {
    id: "dacha-houses",
    slug: "dachnye-doma",
    title: "Дачный дом",
    pluralTitle: "Дачные дома",
    category: "dacha",
    urlSegment: "domov",
    description: "Компактные дома для сезонного отдыха.",
    defaultIntent: "commercial",
    allowedMaterials: ["frame", "timber", "blocks"],
    allowedSizes: ["area-50-80", "area-80-100", "dom-6-na-8", "dom-8-na-8"],
    allowedFeatures: ["terrace", "dacha-lifestyle"],
    allowedPageTypes: ["project-category", "project-size-page", "project-location-page"],
    indexableByDefault: false,
    requiresRealProjects: true,
    requiresKeywordValidation: true,
    priority: "P2",
    status: "active",
  },
  {
    id: "guest-houses",
    slug: "gostevye-doma",
    title: "Гостевой дом",
    pluralTitle: "Гостевые дома",
    category: "guest-house",
    urlSegment: "domov",
    description: "Отдельные гостевые блоки на участке основного дома.",
    defaultIntent: "informational",
    allowedMaterials: ["frame", "timber"],
    allowedSizes: ["area-50-80", "dom-6-na-6"],
    allowedFeatures: ["compact-layout"],
    allowedPageTypes: ["project-category", "project-size-page"],
    indexableByDefault: false,
    requiresRealProjects: true,
    requiresKeywordValidation: true,
    priority: "P3",
    status: "active",
  },
  {
    id: "family-houses",
    slug: "doma-dlya-semi",
    title: "Дом для семьи",
    pluralTitle: "Дома для семьи",
    category: "house",
    urlSegment: "domov",
    description: "Планировки под семью с детьми: спальни, зоны, хранение.",
    defaultIntent: "commercial",
    allowedMaterials: HOUSE_MATERIALS,
    allowedSizes: HOUSE_SIZES,
    allowedFeatures: ["family-with-kids", "rooms-3", "rooms-4", "bedrooms-3"],
    allowedPageTypes: ["project-feature-page", "project-category"],
    indexableByDefault: false,
    requiresRealProjects: true,
    requiresKeywordValidation: true,
    priority: "P2",
    status: "active",
    notes: "Feature-based landing, не дублировать /catalog/kategoriya/dlya-semi без canonical.",
  },
  {
    id: "permanent-living-houses",
    slug: "doma-dlya-postoyannogo-prozhivaniya",
    title: "Дом для постоянного проживания",
    pluralTitle: "Дома для постоянного проживания",
    category: "house",
    urlSegment: "domov",
    description: "Утепление, инженерия, надёжный фундамент под круглогодичное проживание.",
    defaultIntent: "commercial",
    allowedMaterials: HOUSE_MATERIALS,
    allowedSizes: ["area-100-120", "area-120-150", "floors-1", "floors-2"],
    allowedFeatures: ["permanent-living", "boiler-room"],
    allowedPageTypes: ["project-feature-page", "project-category"],
    indexableByDefault: false,
    requiresRealProjects: true,
    requiresKeywordValidation: true,
    priority: "P2",
    status: "active",
  },
  {
    id: "utility-buildings",
    slug: "hozpostrojki",
    title: "Хозпостройка",
    pluralTitle: "Хозпостройки",
    category: "utility",
    urlSegment: "domov",
    description: "Хозблоки и вспомогательные постройки — только по запросу.",
    defaultIntent: "informational",
    allowedMaterials: ["frame", "timber"],
    allowedSizes: ["dom-6-na-6"],
    allowedFeatures: ["utility-room"],
    allowedPageTypes: ["project-category"],
    indexableByDefault: false,
    requiresRealProjects: true,
    requiresKeywordValidation: true,
    priority: "P4",
    status: "future",
    notes: "Не indexableByDefault — уточнить у заказчика, входит ли в услуги.",
  },
];

export function getObjectTypeById(id: string) {
  return projectObjectTypes.find((o) => o.id === id);
}

export function getActiveObjectTypes() {
  return projectObjectTypes.filter((o) => o.status !== "future");
}

/** Типы, для которых генерируются programmatic URL (material/size/geo). Остальные — фильтры и category-only. */
export function getPrimaryProgrammaticObjectTypes() {
  return projectObjectTypes.filter(
    (o) => o.status !== "future" && (o.id === "houses" || o.id === "bathhouses"),
  );
}

/** Подтипы с уникальным category slug (не дублируют houses/bathhouses URL). */
export function getSubtypeCategoryObjectTypes() {
  return projectObjectTypes.filter(
    (o) =>
      o.status !== "future" &&
      o.id !== "houses" &&
      o.id !== "bathhouses" &&
      o.allowedPageTypes.includes("project-category"),
  );
}
