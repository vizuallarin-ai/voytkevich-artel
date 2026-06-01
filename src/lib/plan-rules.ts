import type { PlannerInput, PlannerRoomArea } from "@/types";

/** Доля полезной площади от общей (стены, шахты) */
export const USABLE_AREA_RATIO = 0.9;

export function computeRoomAreas(input: PlannerInput): PlannerRoomArea[] {
  const usable = input.area * USABLE_AREA_RATIO;
  const rooms: PlannerRoomArea[] = [];

  const terrace = input.hasTerrace ? clamp(Math.round(usable * 0.08), 8, 24) : 0;
  const garage = input.hasGarage ? clamp(Math.round(usable * 0.16), 18, 42) : 0;

  const bathEach = clamp(Math.round(usable * 0.045), 4, 8);
  const corridor = clamp(Math.round(usable * 0.09), 8, 16);
  const livingTotal = clamp(Math.round(usable * 0.3), 28, 56);
  const splitLiving = livingTotal >= 40;
  const kitchen = splitLiving ? clamp(Math.round(livingTotal * 0.38), 12, 22) : 0;
  const living = splitLiving ? livingTotal - kitchen : livingTotal;

  const fixed =
    terrace + garage + corridor + livingTotal + bathEach * input.bathrooms;
  const bedroomPool = Math.max(usable - fixed, input.bedrooms * 10);
  const bedroomEach = Math.round(bedroomPool / input.bedrooms);

  if (input.floors === 1) {
    if (garage) rooms.push({ id: "garage", name: "Гараж", area: garage, floor: 1 });
    pushLiving(rooms, living, kitchen, splitLiving, 1);
    rooms.push({ id: "hall", name: "Холл", area: corridor, floor: 1 });
    for (let i = 0; i < input.bathrooms; i++) {
      rooms.push({
        id: `bath-${i + 1}`,
        name: input.bathrooms > 1 ? `Санузел ${i + 1}` : "Санузел",
        area: bathEach,
        floor: 1,
      });
    }
    for (let i = 0; i < input.bedrooms; i++) {
      rooms.push({
        id: `bed-${i + 1}`,
        name: input.bedrooms > 1 ? `Спальня ${i + 1}` : "Спальня",
        area: bedroomEach,
        floor: 1,
      });
    }
    if (terrace) rooms.push({ id: "terrace", name: "Терраса", area: terrace, floor: 1 });
  } else {
    if (garage) rooms.push({ id: "garage", name: "Гараж", area: garage, floor: 1 });
    pushLiving(rooms, living, kitchen, splitLiving, 1);
    rooms.push({ id: "hall-1", name: "Холл", area: corridor, floor: 1 });
    rooms.push({
      id: "bath-1",
      name: "Санузел",
      area: bathEach,
      floor: 1,
    });
    if (terrace) rooms.push({ id: "terrace", name: "Терраса", area: terrace, floor: 1 });

    const upperBaths = Math.max(0, input.bathrooms - 1);
    const upperHall = clamp(Math.round(corridor * 0.7), 6, 12);
    for (let i = 0; i < upperBaths; i++) {
      rooms.push({
        id: `bath-${i + 2}`,
        name: upperBaths > 1 ? `Санузел ${i + 2}` : "Санузел",
        area: bathEach,
        floor: 2,
      });
    }
    rooms.push({ id: "hall-2", name: "Холл", area: upperHall, floor: 2 });
    for (let i = 0; i < input.bedrooms; i++) {
      rooms.push({
        id: `bed-${i + 1}`,
        name: input.bedrooms > 1 ? `Спальня ${i + 1}` : "Спальня",
        area: bedroomEach,
        floor: 2,
      });
    }
  }

  return rooms;
}

function pushLiving(
  rooms: PlannerRoomArea[],
  living: number,
  kitchen: number,
  split: boolean,
  floor: number,
) {
  if (split && kitchen > 0) {
    rooms.push({ id: "kitchen", name: "Кухня", area: kitchen, floor });
    rooms.push({ id: "living", name: "Гостиная", area: living, floor });
  } else {
    rooms.push({ id: "living", name: "Кухня-гостиная", area: living, floor });
  }
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}
