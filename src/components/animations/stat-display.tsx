import { AnimatedCounter } from "@/components/animations/counter";

/** Анимированная статистика — одно визуальное значение, без дублей в DOM. */
export function StatDisplay({
  value,
  suffix = "",
  decimals = 0,
  className,
}: {
  value: number;
  suffix?: string;
  decimals?: number;
  className?: string;
}) {
  const formatted =
    decimals > 0 ? value.toFixed(decimals) : String(Math.round(value));
  const label = `${formatted}${suffix}`;

  return (
    <span className={className} aria-label={label}>
      <AnimatedCounter value={value} suffix={suffix} decimals={decimals} />
    </span>
  );
}
