import type { DateRange, DateRangeKey } from "@/types/analytics";

const LABELS: Record<DateRangeKey, string> = {
  today: "Сегодня",
  "7d": "7 дней",
  "30d": "30 дней",
  "90d": "90 дней",
  all: "Всё время",
};

export function getDateRange(key: DateRangeKey = "30d"): DateRange {
  const to = new Date();
  to.setHours(23, 59, 59, 999);
  const from = new Date(to);

  switch (key) {
    case "today":
      from.setHours(0, 0, 0, 0);
      break;
    case "7d":
      from.setDate(from.getDate() - 7);
      from.setHours(0, 0, 0, 0);
      break;
    case "30d":
      from.setDate(from.getDate() - 30);
      from.setHours(0, 0, 0, 0);
      break;
    case "90d":
      from.setDate(from.getDate() - 90);
      from.setHours(0, 0, 0, 0);
      break;
    case "all":
      from.setFullYear(2020, 0, 1);
      from.setHours(0, 0, 0, 0);
      break;
  }

  return { key, from, to, label: LABELS[key] };
}

export function getPreviousDateRange(range: DateRange): DateRange {
  const durationMs = range.to.getTime() - range.from.getTime();
  const to = new Date(range.from.getTime() - 1);
  const from = new Date(to.getTime() - durationMs);
  return { ...range, from, to, label: `Пред. ${range.label}` };
}

export function isInDateRange(iso: string, range: DateRange): boolean {
  const t = new Date(iso).getTime();
  return t >= range.from.getTime() && t <= range.to.getTime();
}

export function parseDateRangeKey(value?: string | null): DateRangeKey {
  const valid: DateRangeKey[] = ["today", "7d", "30d", "90d", "all"];
  if (value && valid.includes(value as DateRangeKey)) return value as DateRangeKey;
  return "30d";
}
