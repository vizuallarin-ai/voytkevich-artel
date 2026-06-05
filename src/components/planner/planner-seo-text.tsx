import { plannerSeo } from "@/data/planner-copy";

export function PlannerSeoText() {
  return (
    <section className="mt-16 max-w-3xl" aria-labelledby="planner-seo-title">
      <h2 id="planner-seo-title" className="font-display text-2xl">
        {plannerSeo.h2}
      </h2>
      <div className="mt-4 space-y-4 leading-relaxed text-muted">
        {plannerSeo.paragraphs.map((p) => (
          <p key={p.slice(0, 40)}>{p}</p>
        ))}
      </div>
    </section>
  );
}
