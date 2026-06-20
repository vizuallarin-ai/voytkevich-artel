export type ConfidencePresetId = "default" | "strict" | "early-signal";

export type ContentAnalyticsConfidencePreset = {
  id: ConfidencePresetId;
  label: string;
  description: string;
  minimumObservationDays: number;
  minimumImpressions: number;
  minimumClicks: number;
  minimumSessions: number;
  minimumPageViews: number;
  minimumLeads: number;
  minimumQualifiedLeads: number;
  minimumDeals: number;
  minimumComparableItems: number;
  minimumDaysSincePublication: number;
};

export type ConfidenceSignalLevel =
  | "insufficient-data"
  | "early-signal"
  | "low-confidence"
  | "medium-confidence"
  | "high-confidence"
  | "needs-more-observation-time";

export const contentAnalyticsConfidencePresets: Record<
  ConfidencePresetId,
  ContentAnalyticsConfidencePreset
> = {
  default: {
    id: "default",
    label: "Стандартный",
    description: "Баланс между скоростью сигнала и надёжностью выводов",
    minimumObservationDays: 14,
    minimumImpressions: 100,
    minimumClicks: 10,
    minimumSessions: 30,
    minimumPageViews: 50,
    minimumLeads: 3,
    minimumQualifiedLeads: 1,
    minimumDeals: 1,
    minimumComparableItems: 5,
    minimumDaysSincePublication: 7,
  },
  strict: {
    id: "strict",
    label: "Строгий",
    description: "Только устойчивые выводы при большой выборке",
    minimumObservationDays: 30,
    minimumImpressions: 500,
    minimumClicks: 50,
    minimumSessions: 100,
    minimumPageViews: 200,
    minimumLeads: 10,
    minimumQualifiedLeads: 3,
    minimumDeals: 2,
    minimumComparableItems: 10,
    minimumDaysSincePublication: 21,
  },
  "early-signal": {
    id: "early-signal",
    label: "Ранний сигнал",
    description: "Мягкие пороги для ранних индикаторов с явной пометкой confidence",
    minimumObservationDays: 7,
    minimumImpressions: 30,
    minimumClicks: 5,
    minimumSessions: 15,
    minimumPageViews: 20,
    minimumLeads: 1,
    minimumQualifiedLeads: 1,
    minimumDeals: 1,
    minimumComparableItems: 3,
    minimumDaysSincePublication: 3,
  },
};

let activePresetId: ConfidencePresetId = "default";

export function getActiveConfidencePreset(): ContentAnalyticsConfidencePreset {
  return contentAnalyticsConfidencePresets[activePresetId];
}

export function setActiveConfidencePreset(id: ConfidencePresetId): ContentAnalyticsConfidencePreset {
  activePresetId = id;
  return getActiveConfidencePreset();
}

export function evaluateConfidenceSignal(input: {
  observationDays?: number | null;
  impressions?: number | null;
  clicks?: number | null;
  sessions?: number | null;
  pageViews?: number | null;
  leads?: number | null;
  qualifiedLeads?: number | null;
  deals?: number | null;
  daysSincePublication?: number | null;
  preset?: ContentAnalyticsConfidencePreset;
}): ConfidenceSignalLevel {
  const preset = input.preset ?? getActiveConfidencePreset();

  const observationDays = input.observationDays ?? 0;
  const daysSincePublication = input.daysSincePublication ?? observationDays;

  if (daysSincePublication < preset.minimumDaysSincePublication) {
    return "needs-more-observation-time";
  }

  if (observationDays < preset.minimumObservationDays) {
    return "needs-more-observation-time";
  }

  const hasTraffic =
    (input.sessions ?? 0) >= preset.minimumSessions ||
    (input.pageViews ?? 0) >= preset.minimumPageViews;

  const hasSearch =
    (input.impressions ?? 0) >= preset.minimumImpressions ||
    (input.clicks ?? 0) >= preset.minimumClicks;

  const hasLeads = (input.leads ?? 0) >= preset.minimumLeads;
  const hasQualified = (input.qualifiedLeads ?? 0) >= preset.minimumQualifiedLeads;
  const hasDeals = (input.deals ?? 0) >= preset.minimumDeals;

  if (!hasTraffic && !hasSearch && !hasLeads) {
    return "insufficient-data";
  }

  if (hasLeads && hasQualified && hasDeals && hasTraffic && hasSearch) {
    return "high-confidence";
  }

  if (hasLeads || hasSearch || hasTraffic) {
    if (
      observationDays < preset.minimumObservationDays * 1.5 ||
      (input.leads ?? 0) < preset.minimumLeads
    ) {
      return "early-signal";
    }
    return "medium-confidence";
  }

  return "low-confidence";
}
