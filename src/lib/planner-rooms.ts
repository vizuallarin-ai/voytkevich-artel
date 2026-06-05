export type PlannerRoomType =
  | "bedroom"
  | "children_room"
  | "master_bedroom"
  | "guest_room"
  | "office"
  | "living"
  | "kitchen_living"
  | "bathroom"
  | "guest_bathroom"
  | "boiler_room"
  | "laundry"
  | "pantry"
  | "wardrobe"
  | "tech_room"
  | "hallway"
  | "hall"
  | "corridor"
  | "stairs"
  | "vestibule"
  | "terrace"
  | "garage"
  | "canopy"
  | "sauna"
  | "workshop";

export type PlannerRoomZone =
  | "living"
  | "technical"
  | "sanitary"
  | "passage"
  | "additional";

export const ROOM_TYPE_LABELS: Record<PlannerRoomType, string> = {
  bedroom: "Спальня",
  children_room: "Детская",
  master_bedroom: "Мастер-спальня",
  guest_room: "Гостевая",
  office: "Кабинет",
  living: "Гостиная",
  kitchen_living: "Кухня-гостиная",
  bathroom: "Санузел",
  guest_bathroom: "Гостевой санузел",
  boiler_room: "Котельная",
  laundry: "Постирочная",
  pantry: "Кладовая",
  wardrobe: "Гардеробная",
  tech_room: "Техническое помещение",
  hallway: "Прихожая",
  hall: "Холл",
  corridor: "Коридор",
  stairs: "Лестница",
  vestibule: "Тамбур",
  terrace: "Терраса",
  garage: "Гараж",
  canopy: "Навес",
  sauna: "Сауна/баня",
  workshop: "Мастерская",
};

export const ROOM_ZONE_MAP: Record<PlannerRoomType, PlannerRoomZone> = {
  bedroom: "living",
  children_room: "living",
  master_bedroom: "living",
  guest_room: "living",
  office: "living",
  living: "living",
  kitchen_living: "living",
  bathroom: "sanitary",
  guest_bathroom: "sanitary",
  boiler_room: "technical",
  laundry: "technical",
  pantry: "technical",
  wardrobe: "technical",
  tech_room: "technical",
  hallway: "passage",
  hall: "passage",
  corridor: "passage",
  stairs: "passage",
  vestibule: "passage",
  terrace: "additional",
  garage: "additional",
  canopy: "additional",
  sauna: "additional",
  workshop: "additional",
};

export const ROOM_DEFAULTS: Record<PlannerRoomType, number> = {
  bedroom: 14,
  children_room: 12,
  master_bedroom: 18,
  guest_room: 12,
  office: 10,
  living: 20,
  kitchen_living: 30,
  bathroom: 5,
  guest_bathroom: 3,
  boiler_room: 6,
  laundry: 5,
  pantry: 4,
  wardrobe: 5,
  tech_room: 4,
  hallway: 8,
  hall: 8,
  corridor: 8,
  stairs: 8,
  vestibule: 4,
  terrace: 18,
  garage: 24,
  canopy: 12,
  sauna: 8,
  workshop: 12,
};

export const ROOM_AREA_LIMITS: Record<PlannerRoomType, { min: number; max: number }> = {
  bedroom: { min: 9, max: 24 },
  children_room: { min: 9, max: 18 },
  master_bedroom: { min: 14, max: 28 },
  guest_room: { min: 9, max: 18 },
  office: { min: 8, max: 16 },
  living: { min: 14, max: 40 },
  kitchen_living: { min: 20, max: 50 },
  bathroom: { min: 3, max: 10 },
  guest_bathroom: { min: 2, max: 6 },
  boiler_room: { min: 4, max: 10 },
  laundry: { min: 3, max: 8 },
  pantry: { min: 2, max: 8 },
  wardrobe: { min: 3, max: 10 },
  tech_room: { min: 2, max: 8 },
  hallway: { min: 4, max: 14 },
  hall: { min: 4, max: 14 },
  corridor: { min: 4, max: 14 },
  stairs: { min: 4, max: 12 },
  vestibule: { min: 2, max: 8 },
  terrace: { min: 8, max: 80 },
  garage: { min: 16, max: 80 },
  canopy: { min: 8, max: 40 },
  sauna: { min: 4, max: 16 },
  workshop: { min: 8, max: 40 },
};

export function clampRoomArea(type: PlannerRoomType, area: number): number {
  const { min, max } = ROOM_AREA_LIMITS[type];
  if (!Number.isFinite(area)) return ROOM_DEFAULTS[type];
  return Math.min(max, Math.max(min, Math.round(area)));
}

export function inferRoomType(id: string, name: string): PlannerRoomType {
  const n = name.toLowerCase();
  if (id.startsWith("bed-") || n.includes("спальн")) return "bedroom";
  if (n.includes("детск")) return "children_room";
  if (n.includes("кабинет")) return "office";
  if (n.includes("кухня-гостин") || n.includes("кухня гостин")) return "kitchen_living";
  if (n.includes("кухня") || n.includes("гостин")) return "kitchen_living";
  if (n.includes("сануз") || n.includes("ванн")) return "bathroom";
  if (n.includes("котельн")) return "boiler_room";
  if (n.includes("постир")) return "laundry";
  if (n.includes("кладов")) return "pantry";
  if (n.includes("гардероб")) return "wardrobe";
  if (n.includes("прихож")) return "hallway";
  if (n.includes("холл")) return "hall";
  if (n.includes("коридор")) return "corridor";
  if (n.includes("лестниц") || id === "stairs") return "stairs";
  if (n.includes("тамбур")) return "vestibule";
  if (n.includes("террас")) return "terrace";
  if (n.includes("гараж")) return "garage";
  if (n.includes("навес")) return "canopy";
  if (n.includes("саун") || n.includes("бан")) return "sauna";
  return "living";
}

export function createRoomId(type: PlannerRoomType, index: number): string {
  return `${type}-${index}-${Date.now().toString(36).slice(-4)}`;
}
