import type { CalculatorInput, CalculatorResult, Material } from "@/types";
import { formatPrice } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────

export type PackageTypeId = "коробка" | "тёплый контур" | "предчистовая" | "под ключ";

export type HousePurpose =
  | "постоянное"
  | "дачный"
  | "загородный"
  | "семья"
  | "ипотека";

export type LandStatus = "да" | "нет" | "подбираю" | "есть_не_проверен";

export type FoundationType =
  | "базовый"
  | "ленточный"
  | "плита"
  | "свайный"
  | "не_знаю";

export type AccessType = "хороший" | "ограниченный" | "не_знаю";

export type SlopeType = "ровный" | "есть_уклон" | "не_знаю";

export type GeologyStatus = "не_знаю" | "есть" | "нужна_консультация";

export type AdditionalOptionId =
  | "терраса"
  | "гараж"
  | "навес"
  | "кабинет"
  | "второй_свет"
  | "панорамные_окна"
  | "котельная"
  | "сложная_кровля"
  | "повышенное_утепление"
  | "инженерия_постоянное";

export interface CalculatorEstimateInput {
  area: number;
  floors: 1 | 2;
  material: Material;
  purpose: HousePurpose;
  bedrooms: 1 | 2 | 3 | 4;
  bathrooms: 1 | 2 | 3;
  foundation: FoundationType;
  packageType: PackageTypeId;
  hasLand: LandStatus;
  landLocation: string;
  geology: GeologyStatus;
  access: AccessType;
  communications: string[];
  slope: SlopeType;
  additionalOptions: AdditionalOptionId[];
  projectSlug?: string;
  projectTitle?: string;
  source?: string;
}

export interface BreakdownItem {
  id: string;
  label: string;
  amountMin: number;
  amountMax: number;
  percentMin: number;
  percentMax: number;
  description: string;
}

export interface CalculatorEstimateResult {
  totalMin: number;
  totalMax: number;
  pricePerM2Min: number;
  pricePerM2Max: number;
  durationMinMonths: number;
  durationMaxMonths: number;
  breakdown: BreakdownItem[];
  warnings: string[];
}

export const CALCULATOR_AREA_MIN = 50;
export const CALCULATOR_AREA_MAX = 300;
export const CALCULATOR_AREA_STEP = 10;

export const DEFAULT_CALCULATOR_INPUT: CalculatorEstimateInput = {
  area: 150,
  floors: 1,
  material: "газобетон",
  purpose: "постоянное",
  bedrooms: 3,
  bathrooms: 2,
  foundation: "не_знаю",
  packageType: "под ключ",
  hasLand: "подбираю",
  landLocation: "",
  geology: "не_знаю",
  access: "не_знаю",
  communications: [],
  slope: "не_знаю",
  additionalOptions: [],
};

const MATERIALS: Material[] = ["каркас", "газобетон", "кирпич", "брус", "клееный брус"];

const BASE_RATE: Record<Material, Record<PackageTypeId, number>> = {
  каркас: {
    коробка: 38000,
    "тёплый контур": 48000,
    предчистовая: 58000,
    "под ключ": 72000,
  },
  газобетон: {
    коробка: 42000,
    "тёплый контур": 52000,
    предчистовая: 62000,
    "под ключ": 78000,
  },
  кирпич: {
    коробка: 48000,
    "тёплый контур": 58000,
    предчистовая: 68000,
    "под ключ": 85000,
  },
  брус: {
    коробка: 45000,
    "тёплый контур": 55000,
    предчистовая: 65000,
    "под ключ": 82000,
  },
  "клееный брус": {
    коробка: 52000,
    "тёплый контур": 63000,
    предчистовая: 74000,
    "под ключ": 92000,
  },
};

const FOUNDATION_MULT: Record<FoundationType, number> = {
  базовый: 1,
  ленточный: 1,
  плита: 1.12,
  свайный: 0.92,
  не_знаю: 1,
};

const FLOOR_MULT: Record<1 | 2, number> = {
  1: 1.06,
  2: 1,
};

const PURPOSE_MULT: Record<HousePurpose, number> = {
  постоянное: 1.04,
  дачный: 0.94,
  загородный: 1,
  семья: 1.02,
  ипотека: 1,
};

const EXTRA_FIXED: Record<AdditionalOptionId, number> = {
  терраса: 180000,
  гараж: 450000,
  навес: 120000,
  кабинет: 90000,
  второй_свет: 220000,
  панорамные_окна: 160000,
  котельная: 110000,
  сложная_кровля: 200000,
  повышенное_утепление: 140000,
  инженерия_постоянное: 180000,
};

const BREAKDOWN_SHARES: {
  id: string;
  label: string;
  shareMin: number;
  shareMax: number;
  description: string;
}[] = [
  {
    id: "design",
    label: "Проектирование / подготовка",
    shareMin: 0.03,
    shareMax: 0.06,
    description: "Адаптация проекта, уточнение планировки и предварительный расчёт.",
  },
  {
    id: "foundation",
    label: "Фундамент",
    shareMin: 0.12,
    shareMax: 0.18,
    description: "Зависит от грунта, уклона, геологии, площади дома и технологии.",
  },
  {
    id: "shell",
    label: "Коробка дома",
    shareMin: 0.28,
    shareMax: 0.38,
    description: "Стены, перекрытия и несущий каркас здания.",
  },
  {
    id: "roof",
    label: "Кровля",
    shareMin: 0.08,
    shareMax: 0.12,
    description: "Стропильная система, покрытие и водосток.",
  },
  {
    id: "windows",
    label: "Окна и двери",
    shareMin: 0.06,
    shareMax: 0.1,
    description: "Состав зависит от комплектации и выбранных решений.",
  },
  {
    id: "engineering",
    label: "Инженерные системы",
    shareMin: 0.08,
    shareMax: 0.15,
    description: "Отопление, электрика, водоснабжение, канализация, вентиляция.",
  },
  {
    id: "finish",
    label: "Отделка",
    shareMin: 0.05,
    shareMax: 0.2,
    description: "Объём зависит от комплектации: от коробки до формата под ключ.",
  },
  {
    id: "logistics",
    label: "Логистика / организация работ",
    shareMin: 0.03,
    shareMax: 0.06,
    description: "Доставка материалов, организация площадки и подъезд техники.",
  },
  {
    id: "reserve",
    label: "Резерв на уточнение",
    shareMin: 0.05,
    shareMax: 0.08,
    description: "Запас на изменения после анализа участка и проектных решений.",
  },
];

function clampArea(area: number): number {
  if (!Number.isFinite(area)) return DEFAULT_CALCULATOR_INPUT.area;
  return Math.min(CALCULATOR_AREA_MAX, Math.max(CALCULATOR_AREA_MIN, Math.round(area)));
}

function safeMaterial(value: string | null | undefined): Material {
  if (value && MATERIALS.includes(value as Material)) return value as Material;
  const map: Record<string, Material> = {
    brus: "брус",
    karkas: "каркас",
    gazobeton: "газобетон",
    kirpich: "кирпич",
    "kleeniy-brus": "клееный брус",
  };
  if (value && map[value]) return map[value];
  return DEFAULT_CALCULATOR_INPUT.material;
}

function safePackage(value: string | null | undefined): PackageTypeId {
  const map: Record<string, PackageTypeId> = {
    korobka: "коробка",
    warm: "тёплый контур",
    "teplyy-kontur": "тёплый контур",
    pred: "предчистовая",
    predchistovaya: "предчистовая",
    turnkey: "под ключ",
    "pod-klyuch": "под ключ",
    коробка: "коробка",
    "тёплый контур": "тёплый контур",
    предчистовая: "предчистовая",
    "под ключ": "под ключ",
  };
  if (value && map[value]) return map[value];
  return DEFAULT_CALCULATOR_INPUT.packageType;
}

function uncertaintySpread(input: CalculatorEstimateInput): number {
  let spread = 0.1;
  if (input.foundation === "не_знаю") spread += 0.04;
  if (input.geology === "не_знаю" || input.geology === "нужна_консультация") spread += 0.03;
  if (input.access === "ограниченный" || input.access === "не_знаю") spread += 0.02;
  if (input.slope === "есть_уклон" || input.slope === "не_знаю") spread += 0.02;
  if (input.communications.includes("ничего не подведено")) spread += 0.03;
  return Math.min(spread, 0.2);
}

export function calculateEstimate(
  raw: CalculatorEstimateInput,
): CalculatorEstimateResult {
  const input: CalculatorEstimateInput = {
    ...raw,
    area: clampArea(raw.area),
    floors: raw.floors === 2 ? 2 : 1,
    material: safeMaterial(raw.material),
    packageType: safePackage(raw.packageType),
    additionalOptions: raw.additionalOptions ?? [],
    communications: raw.communications ?? [],
  };

  const warnings: string[] = [];
  if (input.foundation === "не_знаю") {
    warnings.push("Тип фундамента уточняется после анализа участка.");
  }

  const baseRate = BASE_RATE[input.material][input.packageType];
  const floorMult = FLOOR_MULT[input.floors];
  const foundationMult = FOUNDATION_MULT[input.foundation];
  const purposeMult = PURPOSE_MULT[input.purpose];
  const bedroomMult = 1 + (input.bedrooms - 2) * 0.015;
  const bathroomMult = 1 + (input.bathrooms - 1) * 0.012;

  const extras = input.additionalOptions.reduce(
    (sum, opt) => sum + (EXTRA_FIXED[opt] ?? 0),
    0,
  );

  const midpoint =
    input.area *
      baseRate *
      floorMult *
      foundationMult *
      purposeMult *
      bedroomMult *
      bathroomMult +
    extras;

  const spread = uncertaintySpread(input);
  const totalMin = Math.round(midpoint * (1 - spread));
  const totalMax = Math.round(midpoint * (1 + spread));
  const safeArea = Math.max(input.area, 1);

  const breakdown = BREAKDOWN_SHARES.map((item) => {
    const amountMin = Math.round(totalMin * item.shareMin);
    const amountMax = Math.round(totalMax * item.shareMax);
    return {
      id: item.id,
      label: item.label,
      amountMin,
      amountMax,
      percentMin: Math.round(item.shareMin * 100),
      percentMax: Math.round(item.shareMax * 100),
      description: item.description,
    };
  });

  const baseMonths =
    input.packageType === "под ключ"
      ? 4 + input.area / 45 + (input.floors === 2 ? 1.5 : 0)
      : 2.5 + input.area / 60;

  const durationMinMonths = Math.max(2, Math.ceil(baseMonths * 0.9));
  const durationMaxMonths = Math.ceil(baseMonths * (1 + spread + 0.1));

  return {
    totalMin,
    totalMax,
    pricePerM2Min: Math.round(totalMin / safeArea),
    pricePerM2Max: Math.round(totalMax / safeArea),
    durationMinMonths,
    durationMaxMonths,
    breakdown,
    warnings,
  };
}

/** Legacy API for planner and hero widgets */
export function calculateHouseCost(input: CalculatorInput): CalculatorResult {
  const finishMap: Record<CalculatorInput["finish"], PackageTypeId> = {
    коробка: "коробка",
    предчистовая: "предчистовая",
    "под ключ": "под ключ",
  };

  const foundationMap: Record<
    CalculatorInput["foundation"],
    FoundationType
  > = {
    ленточный: "ленточный",
    плита: "плита",
    свайный: "свайный",
  };

  const estimate = calculateEstimate({
    ...DEFAULT_CALCULATOR_INPUT,
    area: input.area,
    floors: input.floors,
    material: input.material,
    foundation: foundationMap[input.foundation],
    packageType: finishMap[input.finish],
    additionalOptions: input.plotPrep ? ["терраса"] : [],
  });

  const total = Math.round((estimate.totalMin + estimate.totalMax) / 2);
  const breakdown = estimate.breakdown.map((b) => ({
    label: b.label,
    amount: Math.round((b.amountMin + b.amountMax) / 2),
  }));

  if (input.utilities) {
    const utilAmount = Math.round(input.area * 8500);
    breakdown.push({ label: "Коммуникации", amount: utilAmount });
  }

  const adjustedTotal = breakdown.reduce((s, i) => s + i.amount, 0);

  return {
    total: adjustedTotal || total,
    perSqm: Math.round((adjustedTotal || total) / Math.max(input.area, 1)),
    buildMonths: estimate.durationMinMonths,
    breakdown,
  };
}

export function quickHeroEstimate(area: number): {
  priceMin: number;
  priceMax: number;
  months: number;
} {
  const estimate = calculateEstimate({
    ...DEFAULT_CALCULATOR_INPUT,
    area,
    floors: area > 160 ? 2 : 1,
    material: "газобетон",
    foundation: "ленточный",
    packageType: "под ключ",
  });
  return {
    priceMin: estimate.totalMin,
    priceMax: estimate.totalMax,
    months: estimate.durationMinMonths,
  };
}

export function formatPriceRange(min: number, max: number): string {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return "—";
  if (min === max) return formatPrice(min);
  return `${formatPrice(min)} – ${formatPrice(max)}`;
}

export function formatMonthsRange(min: number, max: number): string {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return "—";
  if (min === max) return `${min} мес.`;
  return `${min}–${max} мес.`;
}

const PURPOSE_LABELS: Record<HousePurpose, string> = {
  постоянное: "для постоянного проживания",
  дачный: "дачный дом",
  загородный: "загородный дом",
  семья: "дом для семьи",
  ипотека: "дом в ипотеку",
};

const LAND_LABELS: Record<LandStatus, string> = {
  да: "участок есть",
  нет: "участка пока нет",
  подбираю: "подбираю участок",
  есть_не_проверен: "участок есть, но ещё не проверял",
};

export function buildCalculatorLeadComment(
  input: CalculatorEstimateInput,
  result: CalculatorEstimateResult,
  currentUrl?: string,
): string {
  const lines = [
    "=== Калькулятор: предварительный расчёт ===",
    input.projectTitle
      ? `Проект: ${input.projectTitle} (${input.projectSlug ?? ""})`
      : null,
    `Площадь: ${input.area} м² · ${input.floors} эт. · ${input.material}`,
    `Комплектация: ${input.packageType} · Назначение: ${PURPOSE_LABELS[input.purpose]}`,
    `Спальни: ${input.bedrooms === 4 ? "4+" : input.bedrooms} · Санузлы: ${input.bathrooms === 3 ? "3+" : input.bathrooms}`,
    `Фундамент: ${input.foundation}`,
    `Участок: ${LAND_LABELS[input.hasLand]}${input.landLocation ? ` · ${input.landLocation}` : ""}`,
    `Геология: ${input.geology} · Подъезд: ${input.access} · Уклон: ${input.slope}`,
    input.communications.length
      ? `Коммуникации: ${input.communications.join(", ")}`
      : null,
    input.additionalOptions.length
      ? `Доп. опции: ${input.additionalOptions.join(", ")}`
      : null,
    `Диапазон: ${formatPriceRange(result.totalMin, result.totalMax)} (${formatPriceRange(result.pricePerM2Min, result.pricePerM2Max)}/м²)`,
    `Срок: ${formatMonthsRange(result.durationMinMonths, result.durationMaxMonths)}`,
    result.breakdown
      .map(
        (b) =>
          `  ${b.label}: ${formatPriceRange(b.amountMin, b.amountMax)}`,
      )
      .join("\n"),
    currentUrl ? `URL: ${currentUrl}` : null,
    input.source ? `Source: ${input.source}` : null,
  ].filter(Boolean);

  return lines.join("\n");
}

export function parseCalculatorSearchParams(
  params: URLSearchParams,
): Partial<CalculatorEstimateInput> {
  const project = params.get("project") ?? params.get("projectSlug") ?? undefined;
  const areaRaw = params.get("area");
  const floorsRaw = params.get("floors");
  const bedroomsRaw = params.get("bedrooms");
  const bathroomsRaw = params.get("bathrooms");

  const partial: Partial<CalculatorEstimateInput> = {
    projectSlug: project,
    source: params.get("source") ?? undefined,
    material: safeMaterial(params.get("material") ?? undefined),
    packageType: safePackage(params.get("package") ?? params.get("packageType") ?? undefined),
    landLocation: params.get("landLocation") ?? undefined,
  };

  if (areaRaw) {
    const area = Number(areaRaw);
    if (Number.isFinite(area)) partial.area = clampArea(area);
  }

  if (floorsRaw) {
    const floors = Number(floorsRaw);
    if (floors === 1 || floors === 2) partial.floors = floors;
  }

  if (bedroomsRaw) {
    const b = Number(bedroomsRaw);
    if (b >= 1 && b <= 4) partial.bedrooms = b as 1 | 2 | 3 | 4;
  }

  if (bathroomsRaw) {
    const b = Number(bathroomsRaw);
    if (b >= 1 && b <= 3) partial.bathrooms = b as 1 | 2 | 3;
  }

  const purpose = params.get("purpose");
  if (purpose && purpose in PURPOSE_LABELS) {
    partial.purpose = purpose as HousePurpose;
  }

  return partial;
}

export function buildCalculatorUrl(opts: {
  project?: string;
  area?: number;
  material?: Material;
  floors?: number;
  packageType?: PackageTypeId;
  bedrooms?: number;
  source?: string;
}): string {
  const sp = new URLSearchParams();
  if (opts.project) sp.set("project", opts.project);
  if (opts.area) sp.set("area", String(opts.area));
  if (opts.material) {
    const slug: Record<Material, string> = {
      брус: "brus",
      каркас: "karkas",
      газобетон: "gazobeton",
      кирпич: "kirpich",
      "клееный брус": "kleeniy-brus",
    };
    sp.set("material", slug[opts.material]);
  }
  if (opts.floors) sp.set("floors", String(opts.floors));
  if (opts.packageType) {
    const slug: Record<PackageTypeId, string> = {
      коробка: "korobka",
      "тёплый контур": "warm",
      предчистовая: "pred",
      "под ключ": "turnkey",
    };
    sp.set("package", slug[opts.packageType]);
  }
  if (opts.bedrooms) sp.set("bedrooms", String(opts.bedrooms));
  if (opts.source) sp.set("source", opts.source);
  const qs = sp.toString();
  return qs ? `/calculator?${qs}` : "/calculator";
}

export function packageFromLegacyFinish(
  finish: CalculatorInput["finish"],
): PackageTypeId {
  const map: Record<CalculatorInput["finish"], PackageTypeId> = {
    коробка: "коробка",
    предчистовая: "предчистовая",
    "под ключ": "под ключ",
  };
  return map[finish];
}

export {
  MATERIALS as CALCULATOR_MATERIALS,
  PURPOSE_LABELS as CALCULATOR_PURPOSE_LABELS,
};
