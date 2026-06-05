import { calculateHouseCost } from "@/lib/calculator";
import { buildCalculatorUrl } from "@/lib/calculator";
import { buildFloorPlans } from "@/lib/floor-plan-generator";
import { findMatchingProject } from "@/lib/find-matching-project";
import { computeRoomAreas } from "@/lib/plan-rules";
import {
  computeAreaSummary,
  findPlannerProjects,
  getPlannerRecommendations,
  PLANNER_DRAFT_KEY,
  PLANNER_DRAFT_VERSION,
  type AreaSummary,
  type PlannerRecommendation,
} from "@/lib/planner-area";
import {
  createRoomId,
  inferRoomType,
  ROOM_DEFAULTS,
  ROOM_TYPE_LABELS,
  type PlannerRoomType,
} from "@/lib/planner-rooms";
import {
  scenarioPurposeMap,
  type PlannerLandStatus,
  type PlannerPriority,
  type PlannerResidents,
  type PlannerRoomItem,
  type PlannerScenarioId,
  type PlannerSlope,
} from "@/lib/planner-scenarios";
import type { PlannerInput, PlannerResult, PlannerRoomArea } from "@/types";

export const DEFAULT_PLANNER_INPUT: PlannerInput = {
  area: 150,
  floors: 1,
  bedrooms: 3,
  bathrooms: 2,
  hasGarage: false,
  hasTerrace: true,
  material: "газобетон",
  finish: "под ключ",
  layoutVariant: "classic",
};

export const PLANNER_AREA_MIN = 50;
export const PLANNER_AREA_MAX = 300;
export const PLANNER_AREA_STEP = 10;

export interface PlannerDraft {
  version: typeof PLANNER_DRAFT_VERSION;
  scenario: PlannerScenarioId | null;
  targetArea: number;
  input: PlannerInput;
  residents: PlannerResidents;
  hasLand: PlannerLandStatus;
  landLocation: string;
  landPlotArea: string;
  landSlope: PlannerSlope;
  priority: PlannerPriority;
  customRooms: PlannerRoomItem[];
}

export const DEFAULT_PLANNER_DRAFT: PlannerDraft = {
  version: PLANNER_DRAFT_VERSION,
  scenario: null,
  targetArea: 150,
  input: DEFAULT_PLANNER_INPUT,
  residents: "3-4",
  hasLand: "подбираю",
  landLocation: "",
  landPlotArea: "",
  landSlope: "не_знаю",
  priority: "comfort",
  customRooms: [],
};

export function generatePlannerResult(input: PlannerInput): PlannerResult {
  const roomAreas = computeRoomAreas(input);
  const floorPlans = buildFloorPlans(input, roomAreas);
  const calculator = calculateHouseCost({
    area: input.area,
    floors: input.floors,
    material: input.material,
    foundation: input.area > 180 ? "плита" : "ленточный",
    finish: input.finish,
    utilities: true,
    plotPrep: false,
  });
  const { project, score } = findMatchingProject(input);

  return {
    floorPlans,
    roomAreas,
    calculator,
    matchedProject: project,
    matchScore: score,
  };
}

export function roomAreasToPlannerItems(rooms: PlannerRoomArea[]): PlannerRoomItem[] {
  return rooms.map((r) => ({
    id: r.id,
    type: inferRoomType(r.id, r.name),
    name: r.name,
    area: r.area,
    floor: r.floor,
    required: true,
  }));
}

export function plannerItemsToRoomAreas(items: PlannerRoomItem[]): PlannerRoomArea[] {
  return items.map(({ id, name, area, floor }) => ({ id, name, area, floor }));
}

export function syncInputFromRooms(
  input: PlannerInput,
  rooms: PlannerRoomItem[],
): PlannerInput {
  const bedrooms = rooms.filter((r) =>
    ["bedroom", "children_room", "master_bedroom", "guest_room"].includes(r.type),
  ).length;
  const bathrooms = rooms.filter((r) =>
    ["bathroom", "guest_bathroom"].includes(r.type),
  ).length;

  return {
    ...input,
    bedrooms: Math.max(1, bedrooms || input.bedrooms),
    bathrooms: Math.max(1, bathrooms || input.bathrooms),
    hasGarage: rooms.some((r) => r.type === "garage"),
    hasTerrace: rooms.some((r) => r.type === "terrace"),
  };
}

export function getEffectiveRooms(
  draft: PlannerDraft,
  layoutRoomAreas: PlannerRoomArea[],
): PlannerRoomItem[] {
  if (draft.customRooms.length > 0) return draft.customRooms;
  return roomAreasToPlannerItems(layoutRoomAreas);
}

export function buildAreaSummaryForDraft(
  draft: PlannerDraft,
  layoutRoomAreas: PlannerRoomArea[],
): AreaSummary {
  const rooms = getEffectiveRooms(draft, layoutRoomAreas);
  return computeAreaSummary(rooms, draft.targetArea);
}

export function buildRecommendationsForDraft(
  draft: PlannerDraft,
  summary: AreaSummary,
  layoutRoomAreas: PlannerRoomArea[],
): PlannerRecommendation[] {
  const rooms = getEffectiveRooms(draft, layoutRoomAreas);
  return getPlannerRecommendations({
    scenario: draft.scenario,
    residents: draft.residents,
    floors: draft.input.floors,
    rooms,
    summary,
    hasLand: draft.hasLand,
    landSlope: draft.landSlope,
  });
}

const SCENARIO_LABELS: Record<PlannerScenarioId, string> = {
  family: "Семья с детьми",
  apartment_move: "Переезд из квартиры",
  couple: "Дом для пары",
  parents: "Дом для родителей",
  dacha: "Дачный дом",
  permanent: "Дом для постоянного проживания",
  office: "Дом с кабинетом",
  terrace: "Дом с террасой",
};

const PRIORITY_LABELS: Record<PlannerPriority, string> = {
  budget: "Уложиться в бюджет",
  comfort: "Максимум комфорта",
  compact: "Компактный дом",
  grow: "Дом на вырост",
  view: "Красивый вид / терраса",
  simple: "Простая эксплуатация",
};

const LAND_LABELS: Record<PlannerLandStatus, string> = {
  да: "участок есть",
  нет: "участка пока нет",
  подбираю: "подбираю участок",
  есть_не_проверен: "участок есть, но не проверен",
};

export function plannerSummaryForLead(
  draft: PlannerDraft,
  opts: {
    summary: AreaSummary;
    recommendations: PlannerRecommendation[];
    relatedSlugs: string[];
    roomAreas: PlannerRoomArea[];
    customized: boolean;
    calculatorTotal?: number;
  },
  currentUrl?: string,
): string {
  const rooms = getEffectiveRooms(draft, opts.roomAreas);
  const roomLines = rooms.map(
    (r) =>
      `  · ${r.name} (${r.type}): ${r.area} м², эт.${r.floor}${r.required ? "" : ", желательно"}`,
  );

  return [
    "=== Планировщик: вводные ===",
    draft.scenario ? `Сценарий: ${SCENARIO_LABELS[draft.scenario]}` : null,
    `Целевая площадь: ${draft.targetArea} м² · Сумма помещений: ${opts.summary.totalArea} м²`,
    `Жилая: ${opts.summary.livingArea} м² · Техн.: ${opts.summary.technicalArea} м² · Доп.: ${opts.summary.additionalArea} м²`,
    `Этажей: ${draft.input.floors} · Жильцы: ${draft.residents} · Приоритет: ${PRIORITY_LABELS[draft.priority]}`,
    `Материал: ${draft.input.material} · Комплектация: ${draft.input.finish}`,
    `Участок: ${LAND_LABELS[draft.hasLand]}${draft.landLocation ? ` · ${draft.landLocation}` : ""}`,
    draft.landSlope !== "не_знаю" ? `Уклон: ${draft.landSlope}` : null,
    opts.customized ? "Планировка: настроена вручную" : "Планировка: по сценарию",
    "Помещения:",
    ...roomLines,
    opts.recommendations.length
      ? `Рекомендации:\n${opts.recommendations.map((r) => `  · ${r.text}`).join("\n")}`
      : null,
    opts.relatedSlugs.length
      ? `Похожие проекты: ${opts.relatedSlugs.join(", ")}`
      : null,
    opts.calculatorTotal
      ? `Ориентир сметы: ${opts.calculatorTotal.toLocaleString("ru-RU")} ₽`
      : null,
    currentUrl ? `URL: ${currentUrl}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildPlannerCalculatorUrl(draft: PlannerDraft): string {
  const purpose = draft.scenario ? scenarioPurposeMap(draft.scenario) : "постоянное";
  const url = buildCalculatorUrl({
    area: draft.targetArea,
    floors: draft.input.floors,
    material: draft.input.material,
    bedrooms: Math.min(4, draft.input.bedrooms),
    source: "planner",
  });
  const params = new URLSearchParams(url.split("?")[1] ?? "");
  params.set("purpose", purpose);
  params.set("hasLand", draft.hasLand);
  if (draft.landLocation) params.set("landLocation", draft.landLocation);
  return `/calculator?${params.toString()}`;
}

export function addRoomToDraft(
  draft: PlannerDraft,
  type: PlannerRoomType,
  floor = 1,
): PlannerDraft {
  const count = draft.customRooms.filter((r) => r.type === type).length;
  const name =
    count > 0 ? `${ROOM_TYPE_LABELS[type]} ${count + 1}` : ROOM_TYPE_LABELS[type];

  const item: PlannerRoomItem = {
    id: createRoomId(type, count + 1),
    type,
    name,
    area: ROOM_DEFAULTS[type],
    floor,
    required: false,
  };

  return {
    ...draft,
    customRooms: [...draft.customRooms, item],
  };
}

export function savePlannerDraft(draft: PlannerDraft): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PLANNER_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    /* ignore quota errors */
  }
}

export function loadPlannerDraft(): PlannerDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PLANNER_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PlannerDraft;
    if (parsed.version !== PLANNER_DRAFT_VERSION) return null;
    return { ...DEFAULT_PLANNER_DRAFT, ...parsed, input: { ...DEFAULT_PLANNER_INPUT, ...parsed.input } };
  } catch {
    return null;
  }
}

export function clearPlannerDraft(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(PLANNER_DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

export { SCENARIO_LABELS, PRIORITY_LABELS, LAND_LABELS };
