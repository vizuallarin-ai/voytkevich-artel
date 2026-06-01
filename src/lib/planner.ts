import { calculateHouseCost } from "@/lib/calculator";
import { buildFloorPlans } from "@/lib/floor-plan-generator";
import { findMatchingProject } from "@/lib/find-matching-project";
import { computeRoomAreas } from "@/lib/plan-rules";
import type { PlannerInput, PlannerResult } from "@/types";

export const DEFAULT_PLANNER_INPUT: PlannerInput = {
  area: 150,
  floors: 1,
  bedrooms: 3,
  bathrooms: 2,
  hasGarage: true,
  hasTerrace: true,
  material: "газобетон",
  finish: "под ключ",
  layoutVariant: "classic",
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

export function plannerSummaryForLead(
  input: PlannerInput,
  opts: {
    calculator: PlannerResult["calculator"];
    matchedProject: PlannerResult["matchedProject"];
    roomAreas: { name: string; area: number; floor: number }[];
    customized: boolean;
  },
): string {
  const roomLines = opts.roomAreas.map(
    (r) => `  · ${r.name} (эт.${r.floor}): ${r.area} м²`,
  );
  const lines = [
    "Заявка с подборщика планировки:",
    `Площадь дома: ${input.area} м², этажей: ${input.floors}`,
    `Спален: ${input.bedrooms}, санузлов: ${input.bathrooms}`,
    `Гараж: ${input.hasGarage ? "да" : "нет"}, терраса: ${input.hasTerrace ? "да" : "нет"}`,
    `Материал: ${input.material}, отделка: ${input.finish}`,
    `Раскладка: ${input.layoutVariant ?? "classic"}`,
    opts.customized ? "Планировка: настроена вручную (площади и позиции)" : "Планировка: автоматическая",
    "Комнаты:",
    ...roomLines,
    `Ориентир сметы: ${opts.calculator.total.toLocaleString("ru-RU")} ₽`,
    opts.matchedProject
      ? `Похожий проект: ${opts.matchedProject.name} (${opts.matchedProject.slug})`
      : "",
  ];
  return lines.filter(Boolean).join("\n");
}
