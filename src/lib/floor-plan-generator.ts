import type { FloorPlan, FloorRoom, PlannerInput, PlannerRoomArea } from "@/types";

type LayoutRect = {
  id: string;
  name: string;
  area: number;
  x: number;
  y: number;
  w: number;
  h: number;
};

const PAD = 2;
const GAP = 1;

export function buildFloorPlans(
  input: PlannerInput,
  roomAreas: PlannerRoomArea[],
): FloorPlan[] {
  const variant = input.layoutVariant ?? "classic";
  if (input.floors === 2) {
    return [
      buildFloor(1, "Первый этаж", roomAreas.filter((r) => r.floor === 1), input, variant, true),
      buildFloor(2, "Второй этаж", roomAreas.filter((r) => r.floor === 2), input, variant, false),
    ];
  }
  return [buildFloor(1, "Планировка", roomAreas, input, variant, false)];
}

function buildFloor(
  floor: number,
  label: string,
  rooms: PlannerRoomArea[],
  input: PlannerInput,
  variant: NonNullable<PlannerInput["layoutVariant"]>,
  withStairs: boolean,
): FloorPlan {
  const rects = layoutFloor(rooms, input, floor, variant, withStairs);
  return {
    floor,
    label,
    image: "",
    rooms: rects.map(toFloorRoom),
  };
}

function layoutFloor(
  rooms: PlannerRoomArea[],
  input: PlannerInput,
  floor: number,
  variant: NonNullable<PlannerInput["layoutVariant"]>,
  withStairs: boolean,
): LayoutRect[] {
  const byId = Object.fromEntries(rooms.map((r) => [r.id, r]));
  const rects: LayoutRect[] = [];

  let x0 = PAD;
  let y0 = PAD;
  let innerW = 100 - PAD * 2;
  let innerH = 100 - PAD * 2;

  if (floor === 1 && input.hasGarage && byId.garage) {
    const gw = Math.min(22, innerW * 0.22);
    rects.push(box(byId.garage, x0, y0, gw, innerH));
    x0 += gw + GAP;
    innerW -= gw + GAP;
  }

  if (floor === 1 && input.hasTerrace && byId.terrace) {
    const tw = Math.min(16, innerW * 0.18);
    rects.push(box(byId.terrace, x0 + innerW - tw, y0, tw, innerH));
    innerW -= tw + GAP;
  }

  if (withStairs) {
    const sw = 10;
    const sh = 14;
    rects.push({
      id: "stairs",
      name: "Лестница",
      area: 6,
      x: round(x0 + innerW - sw),
      y: round(y0 + innerH - sh),
      w: sw,
      h: sh,
    });
    innerW -= sw + GAP;
    innerH -= sh + GAP;
  }

  const isUpper = input.floors === 2 && floor === 2;

  if (variant === "linear" && !isUpper) {
    layoutLinearGround(byId, rects, x0, y0, innerW, innerH);
    return rects;
  }
  if (variant === "linear" && isUpper) {
    layoutLinearUpper(byId, rects, x0, y0, innerW, innerH);
    return rects;
  }
  if (isUpper) {
    layoutClassicUpper(byId, rects, x0, y0, innerW, innerH);
    return rects;
  }
  layoutClassicGround(byId, rects, x0, y0, innerW, innerH);
  return rects;
}

function layoutClassicGround(
  byId: Record<string, PlannerRoomArea>,
  rects: LayoutRect[],
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const topH = h * 0.42;
  const bottomH = h - topH - GAP;
  const bottomY = y + topH + GAP;

  const publicRooms = pick(byId, ["kitchen", "living"]);
  const baths = roomIds(byId, "bath").map((id) => byId[id]);
  const hall = byId.hall ?? byId["hall-1"];
  const topRow = [...publicRooms, ...baths, ...(hall ? [hall] : [])];

  if (topRow.length) {
    rects.push(...splitHorizontal(topRow, x, y, w, topH));
  }

  const beds = roomIds(byId, "bed").map((id) => byId[id]);
  if (beds.length) {
    const weights = beds.map((b, i) => (i === 0 ? b.area * 1.2 : b.area));
    rects.push(...splitHorizontal(beds, x, bottomY, w, bottomH, weights));
  }
}

function layoutClassicUpper(
  byId: Record<string, PlannerRoomArea>,
  rects: LayoutRect[],
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const hall = byId["hall-2"];
  const hallW = hall ? w * 0.12 : 0;
  const hallX = x + (w - hallW) / 2;

  if (hall) rects.push(box(hall, hallX, y, hallW, h));

  const sideW = hall ? (w - hallW - GAP) / 2 : w / 2;
  const leftX = x;
  const rightX = hall ? hallX + hallW + GAP : x + sideW + GAP;

  const beds = roomIds(byId, "bed").map((id) => byId[id]);
  const baths = roomIds(byId, "bath")
    .filter((id) => id !== "bath-1")
    .map((id) => byId[id]);

  const leftBeds = beds.slice(0, Math.ceil(beds.length / 2));
  const rightItems = [...beds.slice(Math.ceil(beds.length / 2)), ...baths];

  if (leftBeds.length) rects.push(...splitVertical(leftBeds, leftX, y, sideW, h));
  if (rightItems.length) rects.push(...splitVertical(rightItems, rightX, y, sideW, h));
}

function layoutLinearGround(
  byId: Record<string, PlannerRoomArea>,
  rects: LayoutRect[],
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const publicW = w * 0.58;
  const privateW = w - publicW - GAP;
  const publicX = x;
  const privateX = x + publicW + GAP;

  const publicRooms = pick(byId, ["kitchen", "living"]);
  const hall = byId.hall ?? byId["hall-1"];
  if (publicRooms.length) {
    rects.push(...splitVertical(publicRooms, publicX, y, publicW, h * 0.72));
  }
  if (hall) {
    rects.push(box(hall, publicX, y + h * 0.72 + GAP, publicW, h * 0.28 - GAP));
  }

  const baths = roomIds(byId, "bath").map((id) => byId[id]);
  const beds = roomIds(byId, "bed").map((id) => byId[id]);
  const privateItems = [...baths, ...beds];
  if (privateItems.length) {
    const weights = privateItems.map((r) =>
      r.id.startsWith("bed-1") ? r.area * 1.15 : r.area,
    );
    rects.push(...splitVertical(privateItems, privateX, y, privateW, h, weights));
  }
}

function layoutLinearUpper(
  byId: Record<string, PlannerRoomArea>,
  rects: LayoutRect[],
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const hall = byId["hall-2"];
  const items = [
    ...(hall ? [hall] : []),
    ...roomIds(byId, "bed").map((id) => byId[id]),
    ...roomIds(byId, "bath")
      .filter((id) => id !== "bath-1")
      .map((id) => byId[id]),
  ];
  if (items.length) rects.push(...splitVertical(items, x, y, w, h));
}

function splitHorizontal(
  rooms: PlannerRoomArea[],
  x: number,
  y: number,
  w: number,
  h: number,
  weights?: number[],
): LayoutRect[] {
  return splitAxis(rooms, x, y, w, h, "h", weights);
}

function splitVertical(
  rooms: PlannerRoomArea[],
  x: number,
  y: number,
  w: number,
  h: number,
  weights?: number[],
): LayoutRect[] {
  return splitAxis(rooms, x, y, w, h, "v", weights);
}

function splitAxis(
  rooms: PlannerRoomArea[],
  x: number,
  y: number,
  w: number,
  h: number,
  axis: "h" | "v",
  weights?: number[],
): LayoutRect[] {
  if (!rooms.length) return [];
  const wTotal = weights ?? rooms.map((r) => r.area);
  const sum = wTotal.reduce((a, b) => a + b, 0);
  const gapTotal = GAP * (rooms.length - 1);
  const avail = axis === "h" ? w - gapTotal : h - gapTotal;
  let cursor = axis === "h" ? x : y;
  const limit = axis === "h" ? x + w : y + h;

  return rooms.map((room, i) => {
    const isLast = i === rooms.length - 1;
    const size = isLast ? limit - cursor : (avail * wTotal[i]) / sum;
    const rect =
      axis === "h"
        ? box(room, cursor, y, size, h)
        : box(room, x, cursor, w, size);
    cursor += size + (isLast ? 0 : GAP);
    return rect;
  });
}

function pick(byId: Record<string, PlannerRoomArea>, ids: string[]) {
  return ids.filter((id) => byId[id]).map((id) => byId[id]);
}

function roomIds(byId: Record<string, PlannerRoomArea>, prefix: string) {
  return Object.keys(byId)
    .filter((id) => id.startsWith(prefix))
    .sort();
}

function box(room: PlannerRoomArea, x: number, y: number, w: number, h: number): LayoutRect {
  return {
    id: room.id,
    name: room.name,
    area: room.area,
    x: round(x),
    y: round(y),
    w: round(Math.max(w, 4)),
    h: round(Math.max(h, 4)),
  };
}

function round(n: number) {
  return Math.round(n * 10) / 10;
}

function toFloorRoom(r: LayoutRect): FloorRoom {
  const { x, y, w, h } = r;
  return {
    id: r.id,
    name: r.name,
    area: r.area,
    polygon: `${x},${y} ${x + w},${y} ${x + w},${y + h} ${x},${y + h}`,
  };
}
