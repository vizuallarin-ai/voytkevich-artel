import { AnimatedCounter } from "@/components/animations/counter";

/** Статика в HTML для SEO + анимация поверх без нулей при загрузке */
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

  return (
    <span className={className}>
      <span className="sr-only">
        {formatted}
        {suffix}
      </span>
      <span aria-hidden="true">
        <AnimatedCounter value={value} suffix={suffix} decimals={decimals} />
      </span>
    </span>
  );
}
