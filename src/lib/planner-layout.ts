import type { FloorPlan, FloorRoom, PlannerInput } from "@/types";
import { buildFloorPlans } from "@/lib/floor-plan-generator";
import { computeRoomAreas } from "@/lib/plan-rules";

export type LayoutRoom = {
  id: string;
  name: string;
  area: number;
  floor: number;
  x: number;
  y: number;
  w: number;
  h: number;
};

export function plannerLayoutKey(input: PlannerInput) {
  return [
    input.area,
    input.floors,
    input.bedrooms,
    input.bathrooms,
    input.hasGarage,
    input.hasTerrace,
    input.layoutVariant ?? "classic",
  ].join("|");
}

export function createLayoutFromInput(input: PlannerInput): LayoutRoom[] {
  const roomAreas = computeRoomAreas(input);
  const plans = buildFloorPlans(input, roomAreas);
  return floorPlansToLayout(plans);
}

export function floorPlansToLayout(plans: FloorPlan[]): LayoutRoom[] {
  return plans.flatMap((plan) =>
    plan.rooms.map((room) => {
      const { x, y, w, h } = polygonToRect(room.polygon);
      return {
        id: room.id,
        name: room.name,
        area: room.area,
        floor: plan.floor,
        x,
        y,
        w,
        h,
      };
    }),
  );
}

export function layoutToFloorPlans(rooms: LayoutRoom[], input: PlannerInput): FloorPlan[] {
  const floors = input.floors === 2 ? [1, 2] : [1];
  const labels: Record<number, string> =
    input.floors === 2
      ? { 1: "Первый этаж", 2: "Второй этаж" }
      : { 1: "Планировка" };

  return floors.map((floor) => ({
    floor,
    label: labels[floor],
    image: "",
    rooms: rooms
      .filter((r) => r.floor === floor)
      .map(layoutRoomToFloorRoom),
  }));
}

export function layoutRoomToFloorRoom(r: LayoutRoom): FloorRoom {
  return {
    id: r.id,
    name: r.name,
    area: r.area,
    polygon: `${r.x},${r.y} ${r.x + r.w},${r.y} ${r.x + r.w},${r.y + r.h} ${r.x},${r.y + r.h}`,
  };
}

export function updateLayoutRoomArea(
  rooms: LayoutRoom[],
  floor: number,
  id: string,
  area: number,
): LayoutRoom[] {
  return rooms.map((room) => {
    if (room.floor !== floor || room.id !== id) return room;
    if (room.id === "stairs") return { ...room, area };

    const scale = Math.sqrt(Math.max(area, 1) / Math.max(room.area, 1));
    const cx = room.x + room.w / 2;
    const cy = room.y + room.h / 2;
    const w = clamp(room.w * scale, 6, 88);
    const h = clamp(room.h * scale, 6, 88);

    return clampPosition({
      ...room,
      area,
      w,
      h,
      x: cx - w / 2,
      y: cy - h / 2,
    });
  });
}

export function moveLayoutRoom(
  rooms: LayoutRoom[],
  floor: number,
  id: string,
  x: number,
  y: number,
): LayoutRoom[] {
  return rooms.map((room) => {
    if (room.floor !== floor || room.id !== id) return room;
    return clampPosition({ ...room, x, y });
  });
}

export function areaLimits(id: string): { min: number; max: number } {
  if (id === "garage") return { min: 16, max: 48 };
  if (id === "terrace") return { min: 8, max: 32 };
  if (id === "kitchen") return { min: 10, max: 24 };
  if (id === "living") return { min: 18, max: 56 };
  if (id.startsWith("bed")) return { min: 9, max: 30 };
  if (id.startsWith("bath")) return { min: 3, max: 12 };
  if (id === "hall" || id.startsWith("hall")) return { min: 5, max: 18 };
  if (id === "stairs") return { min: 4, max: 10 };
  return { min: 6, max: 40 };
}

function polygonToRect(polygon: string) {
  const coords = polygon.split(" ").map((p) => p.split(",").map(Number));
  const xs = coords.map(([x]) => x);
  const ys = coords.map(([, y]) => y);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
}

function clampPosition(room: LayoutRoom): LayoutRoom {
  const w = clamp(room.w, 4, 92);
  const h = clamp(room.h, 4, 92);
  return {
    ...room,
    w,
    h,
    x: clamp(room.x, 1, 99 - w),
    y: clamp(room.y, 1, 99 - h),
  };
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}
