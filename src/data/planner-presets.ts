import type { PlannerInput } from "@/types";
import { DEFAULT_PLANNER_INPUT } from "@/lib/planner";

export type PlannerPreset = {
  id: string;
  label: string;
  description: string;
  input: Partial<PlannerInput>;
};

export const plannerPresets: PlannerPreset[] = [
  {
    id: "family",
    label: "Семья с детьми",
    description: "3 спальни, 2 санузла, терраса",
    input: { area: 150, floors: 1, bedrooms: 3, bathrooms: 2, hasTerrace: true, hasGarage: false },
  },
  {
    id: "couple",
    label: "Пара",
    description: "2 спальни, компактная планировка",
    input: { area: 110, floors: 1, bedrooms: 2, bathrooms: 1, hasTerrace: true, hasGarage: false },
  },
  {
    id: "parents",
    label: "Для родителей",
    description: "1 этаж, без лестниц",
    input: { area: 95, floors: 1, bedrooms: 2, bathrooms: 1, hasTerrace: true, hasGarage: false },
  },
  {
    id: "dacha",
    label: "Дачный дом",
    description: "Небольшой, быстрый в стройке",
    input: { area: 80, floors: 1, bedrooms: 2, bathrooms: 1, finish: "коробка" },
  },
  {
    id: "permanent",
    label: "Постоянное проживание",
    description: "2 этажа, гараж, полная комплектация",
    input: {
      area: 180,
      floors: 2,
      bedrooms: 4,
      bathrooms: 2,
      hasGarage: true,
      hasTerrace: true,
      finish: "под ключ",
    },
  },
  {
    id: "office",
    label: "С кабинетом",
    description: "4 спальни / кабинет, 2 этажа",
    input: { area: 200, floors: 2, bedrooms: 4, bathrooms: 2, hasTerrace: false, hasGarage: true },
  },
];

export function applyPreset(preset: PlannerPreset): PlannerInput {
  return { ...DEFAULT_PLANNER_INPUT, ...preset.input };
}
