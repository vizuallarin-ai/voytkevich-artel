export { formatPercent, formatTrend } from "./insights";

export function formatMinutes(minutes: number | null): string {
  if (minutes == null) return "—";
  if (minutes < 60) return `${minutes} мин.`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h} ч. ${m} мин.` : `${h} ч.`;
}

export function formatNumber(n: number): string {
  return n.toLocaleString("ru-RU");
}
