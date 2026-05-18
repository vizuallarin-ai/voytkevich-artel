import type { CalculatorInput, CalculatorResult } from "@/types";

const MATERIAL_RATE: Record<CalculatorInput["material"], number> = {
  каркас: 42000,
  газобетон: 48000,
  кирпич: 55000,
  брус: 52000,
  "клееный брус": 62000,
};

const FOUNDATION_RATE: Record<CalculatorInput["foundation"], number> = {
  ленточный: 4500,
  плита: 6200,
  свайный: 3800,
};

const FINISH_MULT: Record<CalculatorInput["finish"], number> = {
  коробка: 1,
  предчистовая: 1.35,
  "под ключ": 1.72,
};

export function calculateHouseCost(input: CalculatorInput): CalculatorResult {
  const baseRate = MATERIAL_RATE[input.material];
  const floorMult = input.floors === 2 ? 1.18 : 1;
  const finishMult = FINISH_MULT[input.finish];

  const shell = input.area * baseRate * floorMult * finishMult;
  const foundation = input.area * FOUNDATION_RATE[input.foundation];
  const utilities = input.utilities ? input.area * 8500 : 0;
  const plot = input.plotPrep ? 280000 : 0;
  const engineering = input.area * 3200 * finishMult;
  const roof = input.area * 2800 * (input.floors === 2 ? 1.15 : 1);

  const breakdown = [
    { label: "Коробка и отделка", amount: Math.round(shell) },
    { label: "Фундамент", amount: Math.round(foundation) },
    { label: "Кровля", amount: Math.round(roof) },
    { label: "Инженерия", amount: Math.round(engineering) },
    ...(utilities ? [{ label: "Коммуникации", amount: Math.round(utilities) }] : []),
    ...(plot ? [{ label: "Подготовка участка", amount: plot }] : []),
  ];

  const total = breakdown.reduce((s, i) => s + i.amount, 0);
  const buildMonths =
    input.finish === "под ключ"
      ? Math.ceil(4 + input.area / 45 + (input.floors === 2 ? 1.5 : 0))
      : Math.ceil(2.5 + input.area / 60);

  return {
    total,
    perSqm: Math.round(total / input.area),
    buildMonths,
    breakdown,
  };
}

export function quickHeroEstimate(area: number): { price: number; months: number } {
  const result = calculateHouseCost({
    area,
    floors: area > 160 ? 2 : 1,
    material: "газобетон",
    foundation: "ленточный",
    finish: "под ключ",
    utilities: true,
    plotPrep: false,
  });
  return { price: result.total, months: result.buildMonths };
}
