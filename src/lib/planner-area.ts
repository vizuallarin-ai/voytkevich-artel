import type { Project } from "@/types";
import type { PlannerRoomItem } from "@/lib/planner-scenarios";
import {
  ROOM_ZONE_MAP,
  inferRoomType,
  type PlannerRoomType,
  type PlannerRoomZone,
} from "@/lib/planner-rooms";

export type AreaSummaryStatus =
  | "within"
  | "surplus"
  | "exceeded"
  | "too_compact";

export interface AreaSummary {
  targetArea: number;
  livingArea: number;
  technicalArea: number;
  sanitaryArea: number;
  passageArea: number;
  additionalArea: number;
  internalArea: number;
  totalArea: number;
  delta: number;
  deltaPercent: number;
  status: AreaSummaryStatus;
  statusLabel: string;
  statusHint: string;
}

function safeArea(n: number): number {
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n);
}

export function computeAreaSummary(
  rooms: { area: number; type?: PlannerRoomType; id?: string; name?: string }[],
  targetArea: number,
): AreaSummary {
  const zones: Record<PlannerRoomZone, number> = {
    living: 0,
    technical: 0,
    sanitary: 0,
    passage: 0,
    additional: 0,
  };

  for (const r of rooms) {
    const area = safeArea(r.area);
    if (area <= 0) continue;
    const type = r.type ?? inferRoomType(r.id ?? "", r.name ?? "");
    const zone = ROOM_ZONE_MAP[type] ?? "living";
    zones[zone] += area;
  }

  const livingArea = zones.living;
  const technicalArea = zones.technical;
  const sanitaryArea = zones.sanitary;
  const passageArea = zones.passage;
  const additionalArea = zones.additional;
  const internalArea = livingArea + technicalArea + sanitaryArea + passageArea;
  const totalArea = internalArea + additionalArea;
  const safeTarget = Math.max(targetArea, 1);
  const delta = totalArea - safeTarget;
  const deltaPercent = Math.round((totalArea / safeTarget) * 100);

  let status: AreaSummaryStatus = "within";
  let statusLabel = "В пределах ориентира";
  let statusHint = `Сумма помещений близка к целевой площади ${safeTarget} м².`;

  if (deltaPercent < 75) {
    status = "too_compact";
    statusLabel = "Планировка компактная";
    statusHint = `Есть запас ${safeTarget - totalArea} м². Можно добавить хранение, кабинет или увеличить кухню-гостиную.`;
  } else if (delta > 15) {
    status = "exceeded";
    statusLabel = "Площадь превышена";
    statusHint = `Сумма помещений ${totalArea} м² — на ${delta} м² больше ориентира. Можно уменьшить комнаты или пересмотреть состав.`;
  } else if (delta < -10) {
    status = "surplus";
    statusLabel = "Есть запас";
    statusHint = `Запланировано ${totalArea} м² при ориентире ${safeTarget} м². Запас: ${Math.abs(delta)} м².`;
  }

  return {
    targetArea: safeTarget,
    livingArea,
    technicalArea,
    sanitaryArea,
    passageArea,
    additionalArea,
    internalArea,
    totalArea,
    delta,
    deltaPercent,
    status,
    statusLabel,
    statusHint,
  };
}

export interface PlannerRecommendation {
  id: string;
  text: string;
}

export function getPlannerRecommendations(opts: {
  scenario: string | null;
  residents: string;
  floors: number;
  rooms: PlannerRoomItem[];
  summary: AreaSummary;
  hasLand: string;
  landSlope: string;
}): PlannerRecommendation[] {
  const recs: PlannerRecommendation[] = [];
  const types = new Set(opts.rooms.map((r) => r.type));
  const bathCount = opts.rooms.filter(
    (r) => r.type === "bathroom" || r.type === "guest_bathroom",
  ).length;

  if (
    (opts.scenario === "permanent" || opts.residents === "5+") &&
    !types.has("boiler_room")
  ) {
    recs.push({
      id: "boiler",
      text: "Для постоянного проживания стоит предусмотреть котельную или техническое помещение под инженерные системы.",
    });
  }

  if (
    (opts.residents === "3-4" || opts.residents === "5+") &&
    bathCount < 2
  ) {
    recs.push({
      id: "bath",
      text: "Для семьи из 4+ человек обычно удобнее предусмотреть 2 санузла.",
    });
  }

  if (types.has("office")) {
    recs.push({
      id: "office-zone",
      text: "Кабинет лучше располагать в тихой зоне, отдельно от кухни-гостиной.",
    });
  }

  if (opts.scenario === "parents" && opts.floors === 2) {
    recs.push({
      id: "parents-floor",
      text: "Для старших членов семьи чаще удобнее одноэтажная планировка или спальня на первом этаже.",
    });
  }

  if (opts.summary.status === "exceeded") {
    recs.push({
      id: "area-high",
      text: "Сумма помещений выше ориентира. Можно уменьшить спальни, коридоры или пересмотреть дополнительные зоны.",
    });
  }

  if (opts.summary.status === "too_compact" || opts.summary.status === "surplus") {
    recs.push({
      id: "area-low",
      text: "Есть запас площади. Можно добавить хранение, кабинет, второй санузел или увеличить кухню-гостиную.",
    });
  }

  if (types.has("terrace")) {
    recs.push({
      id: "terrace",
      text: "Террасу стоит связывать с кухней-гостиной и учитывать стороны света и видовые точки участка.",
    });
  }

  if (opts.landSlope === "есть_уклон") {
    recs.push({
      id: "slope",
      text: "Для участка с уклоном важно заранее обсудить посадку дома, фундамент и подъезд техники.",
    });
  }

  if (recs.length === 0) {
    recs.push({
      id: "default",
      text: "Планировку можно обсудить со специалистом — он подскажет, как адаптировать состав помещений под участок и бюджет.",
    });
  }

  return recs.slice(0, 6);
}

export function findPlannerProjects(
  area: number,
  floors: number,
  projects: Project[],
  opts?: { hasTerrace?: boolean; hasGarage?: boolean; hasCabinet?: boolean },
  limit = 6,
): Project[] {
  const areaMin = area - 30;
  const areaMax = area + 30;

  return projects
    .map((project) => {
      const { specs } = project;
      let score = Math.abs(specs.area - area) * 2;
      if (specs.floors !== floors) score += 20;
      if (specs.area < areaMin || specs.area > areaMax) score += 25;
      if (opts?.hasTerrace && !specs.hasTerrace) score += 8;
      if (opts?.hasGarage && !specs.hasGarage) score += 10;
      if (opts?.hasCabinet && !specs.hasCabinet) score += 6;
      return { project, score };
    })
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
    .map((x) => x.project);
}

export const PLANNER_DRAFT_VERSION = 1;
export const PLANNER_DRAFT_KEY = "planner-draft-v1";
