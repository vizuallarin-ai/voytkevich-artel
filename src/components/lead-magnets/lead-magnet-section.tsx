import type { LeadMagnet, LeadMagnetSubmitContext } from "@/types/lead-magnet";
import { LeadMagnetCard } from "./lead-magnet-card";
import { LeadMagnetViewTracker } from "./lead-magnet-view-tracker";

type Props = {
  title?: string;
  subtitle?: string;
  magnets: LeadMagnet[];
  context: LeadMagnetSubmitContext;
  prefilledArea?: string;
  columns?: 2 | 3 | 4;
};

export function LeadMagnetSection({
  title = "Не готовы сразу оставлять заявку? Начните с полезного шага",
  subtitle = "Получите материал или разбор — без обязательства строить прямо сейчас.",
  magnets,
  context,
  prefilledArea,
  columns = 2,
}: Props) {
  if (!magnets.length) return null;

  const gridClass =
    columns === 4
      ? "lg:grid-cols-4 md:grid-cols-2"
      : columns === 3
        ? "lg:grid-cols-3 md:grid-cols-2"
        : "md:grid-cols-2";

  return (
    <section aria-labelledby="lead-magnets-section" className="relative mt-16">
      {magnets[0] ? (
        <LeadMagnetViewTracker
          leadMagnetId={magnets[0].id}
          pageType={context.pageType}
          pageSlug={context.pageSlug}
        />
      ) : null}
      <h2 id="lead-magnets-section" className="heading-section text-2xl">
        {title}
      </h2>
      {subtitle ? <p className="mt-3 max-w-2xl text-sm text-muted">{subtitle}</p> : null}
      <div className={`mt-8 grid gap-6 ${gridClass}`}>
        {magnets.map((magnet) => (
          <LeadMagnetCard
            key={magnet.id}
            magnet={magnet}
            context={context}
            prefilledArea={prefilledArea}
          />
        ))}
      </div>
    </section>
  );
}
