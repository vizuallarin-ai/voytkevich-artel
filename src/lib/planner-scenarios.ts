import type { PlannerInput } from "@/types";
import { DEFAULT_PLANNER_INPUT } from "@/lib/planner";
import type { PlannerRoomType } from "@/lib/planner-rooms";
import { ROOM_DEFAULTS, ROOM_TYPE_LABELS } from "@/lib/planner-rooms";

export type PlannerScenarioId =
  | "family"
  | "apartment_move"
  | "couple"
  | "parents"
  | "dacha"
  | "permanent"
  | "office"
  | "terrace";

export type PlannerResidents = "1-2" | "3-4" | "5+";

export type PlannerPriority =
  | "budget"
  | "comfort"
  | "compact"
  | "grow"
  | "view"
  | "simple";

export type PlannerLandStatus = "да" | "нет" | "подбираю" | "есть_не_проверен";

export type PlannerSlope = "ровный" | "есть_уклон" | "не_знаю";

export interface PlannerRoomItem {
  id: string;
  type: PlannerRoomType;
  name: string;
  area: number;
  floor: number;
  required: boolean;
}

export interface PlannerScenario {
  id: PlannerScenarioId;
  title: string;
  description: string;
  input: Partial<PlannerInput>;
  residents: PlannerResidents;
  rooms: Omit<PlannerRoomItem, "id">[];
}

function room(
  type: PlannerRoomType,
  floor = 1,
  required = true,
  area = ROOM_DEFAULTS[type],
  name?: string,
): Omit<PlannerRoomItem, "id"> {
  return {
    type,
    name: name ?? ROOM_TYPE_LABELS[type],
    area,
    floor,
    required,
  };
}

export const PLANNER_SCENARIOS: PlannerScenario[] = [
  {
    id: "family",
    title: "Семья с детьми",
    description:
      "Отдельные спальни, общая кухня-гостиная, хранение, санузлы, котельная и пространство на вырост.",
    residents: "3-4",
    input: { area: 150, floors: 1, bedrooms: 3, bathrooms: 2, hasTerrace: true, hasGarage: false },
    rooms: [
      room("kitchen_living", 1),
      room("hallway", 1),
      room("bedroom", 1, true, 14, "Спальня 1"),
      room("bedroom", 1, true, 14, "Спальня 2"),
      room("children_room", 1),
      room("bathroom", 1, true, 5, "Санузел 1"),
      room("bathroom", 1, true, 5, "Санузел 2"),
      room("boiler_room", 1),
      room("wardrobe", 1, false),
      room("pantry", 1, false),
      room("terrace", 1, false),
    ],
  },
  {
    id: "apartment_move",
    title: "Переезд из квартиры",
    description:
      "Понятная площадь без лишних метров и привычный комфорт для переезда из города.",
    residents: "3-4",
    input: { area: 120, floors: 1, bedrooms: 2, bathrooms: 2, hasTerrace: false, hasGarage: false },
    rooms: [
      room("kitchen_living", 1),
      room("hallway", 1),
      room("bedroom", 1, true, 14, "Спальня 1"),
      room("bedroom", 1, true, 14, "Спальня 2"),
      room("bathroom", 1),
      room("bathroom", 1, false, 4, "Санузел 2"),
      room("boiler_room", 1),
      room("pantry", 1),
      room("office", 1, false),
    ],
  },
  {
    id: "couple",
    title: "Дом для пары",
    description:
      "Компактный дом с комфортной общей зоной, спальней и опциональным кабинетом или гостевой.",
    residents: "1-2",
    input: { area: 100, floors: 1, bedrooms: 2, bathrooms: 1, hasTerrace: true, hasGarage: false },
    rooms: [
      room("kitchen_living", 1),
      room("hallway", 1),
      room("master_bedroom", 1),
      room("guest_room", 1, false),
      room("bathroom", 1),
      room("boiler_room", 1),
      room("office", 1, false),
      room("terrace", 1, false),
    ],
  },
  {
    id: "parents",
    title: "Дом для родителей",
    description:
      "Удобство, минимум лестниц, спальня на первом этаже и простая эксплуатация.",
    residents: "1-2",
    input: { area: 95, floors: 1, bedrooms: 2, bathrooms: 2, hasTerrace: true, hasGarage: false },
    rooms: [
      room("kitchen_living", 1),
      room("hallway", 1),
      room("bedroom", 1, true, 14, "Спальня 1"),
      room("bedroom", 1, true, 14, "Спальня 2"),
      room("bathroom", 1),
      room("bathroom", 1, false, 4, "Санузел 2"),
      room("boiler_room", 1),
      room("pantry", 1),
    ],
  },
  {
    id: "dacha",
    title: "Дачный дом",
    description:
      "Компактный формат для сезонного проживания, отдыха и простого обслуживания.",
    residents: "1-2",
    input: { area: 80, floors: 1, bedrooms: 2, bathrooms: 1, hasTerrace: true, hasGarage: false, finish: "коробка" },
    rooms: [
      room("kitchen_living", 1),
      room("hallway", 1),
      room("bedroom", 1),
      room("bedroom", 1, false, 12, "Спальня 2"),
      room("bathroom", 1),
      room("terrace", 1, false),
    ],
  },
  {
    id: "permanent",
    title: "Дом для постоянного проживания",
    description:
      "Полноценная инженерия, котельная, хранение, утепление и продуманная бытовая логика.",
    residents: "5+",
    input: {
      area: 180,
      floors: 2,
      bedrooms: 4,
      bathrooms: 2,
      hasGarage: true,
      hasTerrace: true,
      finish: "под ключ",
    },
    rooms: [
      room("kitchen_living", 1),
      room("hallway", 1),
      room("boiler_room", 1),
      room("pantry", 1),
      room("wardrobe", 1),
      room("bathroom", 1),
      room("terrace", 1, false),
      room("garage", 1, false),
      room("hall", 2),
      room("bedroom", 2, true, 14, "Спальня 1"),
      room("bedroom", 2, true, 14, "Спальня 2"),
      room("bedroom", 2, true, 14, "Спальня 3"),
      room("bedroom", 2, false, 14, "Спальня 4"),
      room("bathroom", 2, true, 5, "Санузел 2"),
      room("laundry", 2, false),
    ],
  },
  {
    id: "office",
    title: "Дом с кабинетом",
    description:
      "Для удалённой работы, бизнеса или отдельного рабочего пространства.",
    residents: "3-4",
    input: { area: 160, floors: 2, bedrooms: 3, bathrooms: 2, hasTerrace: false, hasGarage: true },
    rooms: [
      room("kitchen_living", 1),
      room("hallway", 1),
      room("office", 1),
      room("boiler_room", 1),
      room("bathroom", 1),
      room("garage", 1, false),
      room("hall", 2),
      room("bedroom", 2, true, 14, "Спальня 1"),
      room("bedroom", 2, true, 14, "Спальня 2"),
      room("bedroom", 2, false, 14, "Спальня 3"),
      room("bathroom", 2),
    ],
  },
  {
    id: "terrace",
    title: "Дом с террасой",
    description:
      "Загородная жизнь, отдых, видовые участки и связь дома с улицей.",
    residents: "3-4",
    input: { area: 140, floors: 1, bedrooms: 3, bathrooms: 2, hasTerrace: true, hasGarage: false },
    rooms: [
      room("kitchen_living", 1, true, 32),
      room("hallway", 1),
      room("terrace", 1, true, 20),
      room("bedroom", 1, true, 14, "Спальня 1"),
      room("bedroom", 1, true, 14, "Спальня 2"),
      room("bedroom", 1, false, 14, "Спальня 3"),
      room("bathroom", 1),
      room("bathroom", 1, false, 4, "Санузел 2"),
      room("boiler_room", 1),
    ],
  },
];

export function getScenarioById(id: PlannerScenarioId): PlannerScenario | undefined {
  return PLANNER_SCENARIOS.find((s) => s.id === id);
}

export function scenarioToInput(scenario: PlannerScenario): PlannerInput {
  return { ...DEFAULT_PLANNER_INPUT, ...scenario.input };
}

export function scenarioPurposeMap(id: PlannerScenarioId): string {
  const map: Record<PlannerScenarioId, string> = {
    family: "семья",
    apartment_move: "постоянное",
    couple: "загородный",
    parents: "постоянное",
    dacha: "дачный",
    permanent: "постоянное",
    office: "семья",
    terrace: "загородный",
  };
  return map[id];
}
