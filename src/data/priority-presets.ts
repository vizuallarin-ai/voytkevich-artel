import type { ContentScheduleMode } from "@/types/content-calendar";

export type PriorityPreset = {
  id: string;
  label: string;
  description: string;
  preferCommercial: boolean;
  preferLocal: boolean;
  minConfidenceForP1: "low" | "medium" | "high";
};

export const priorityPresets: PriorityPreset[] = [
  {
    id: "commercial-first",
    label: "Commercial first",
    description: "Приоритет коммерческим и локальным страницам с лид-потенциалом.",
    preferCommercial: true,
    preferLocal: true,
    minConfidenceForP1: "low",
  },
  {
    id: "data-driven",
    label: "Data-driven",
    description: "P1 только при импортированной частотности или GSC данных.",
    preferCommercial: false,
    preferLocal: false,
    minConfidenceForP1: "medium",
  },
  {
    id: "balanced",
    label: "Balanced",
    description: "Баланс commercial, technical и editorial для E-E-A-T.",
    preferCommercial: true,
    preferLocal: true,
    minConfidenceForP1: "low",
  },
];

export const defaultPriorityPreset = priorityPresets[0];

export type PriorityModeContext = {
  presetId: string;
  calendarMode?: ContentScheduleMode;
};
