import type { ContentScheduleMode } from "@/types/content-calendar";
import { getCapacityRules } from "@/data/content-capacity-rules";

export type SchedulePreset = {
  id: ContentScheduleMode;
  label: string;
  description: string;
  sitePerDay: string;
  externalPerDay: string;
  risk: "low" | "medium" | "high";
  requiresConfirmation: boolean;
  recommended: boolean;
};

export const contentSchedulePresets: SchedulePreset[] = [
  {
    id: "cautious",
    label: "Осторожный",
    description: "1–3 материала на сайт в день. Для раннего этапа и набора индекса.",
    sitePerDay: "1–3",
    externalPerDay: "1–5",
    risk: "low",
    requiresConfirmation: false,
    recommended: true,
  },
  {
    id: "working",
    label: "Рабочий",
    description: "3–7 материалов на сайт в день при стабильном quality pipeline.",
    sitePerDay: "3–7",
    externalPerDay: "5–15",
    risk: "medium",
    requiresConfirmation: false,
    recommended: true,
  },
  {
    id: "aggressive",
    label: "Агрессивный",
    description: "7–15 материалов в день. Только после проверки индексации и аналитики.",
    sitePerDay: "7–15",
    externalPerDay: "15–40",
    risk: "high",
    requiresConfirmation: true,
    recommended: false,
  },
  {
    id: "manual",
    label: "Ручной",
    description: "Лимиты задаются вручную в настройках.",
    sitePerDay: "custom",
    externalPerDay: "custom",
    risk: "medium",
    requiresConfirmation: false,
    recommended: false,
  },
];

export function getPreset(mode: ContentScheduleMode): SchedulePreset | undefined {
  return contentSchedulePresets.find((p) => p.id === mode);
}

export function getPresetCapacity(mode: ContentScheduleMode) {
  return getCapacityRules(mode);
}
