import { projectSpecItems } from "@/lib/project-content";
import type { Project } from "@/types";

export function ProjectSpecs({ project }: { project: Project }) {
  const items = projectSpecItems(project);

  return (
    <section aria-labelledby="project-specs-title">
      <h2 id="project-specs-title" className="font-display text-2xl">
        Характеристики проекта
      </h2>
      <dl className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(({ label, value }) => (
          <div
            key={label}
            className="rounded-sm border border-graphite/10 bg-muted-bg/40 px-4 py-3"
          >
            <dt className="text-xs text-muted">{label}</dt>
            <dd className="mt-1 font-medium">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
