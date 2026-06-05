import { projectAudienceScenarios } from "@/lib/project-content";
import type { Project } from "@/types";

export function ProjectAudience({ project }: { project: Project }) {
  const scenarios = projectAudienceScenarios(project);

  return (
    <section aria-labelledby="project-audience-title">
      <h2 id="project-audience-title" className="font-display text-2xl">
        Кому подойдёт этот проект
      </h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {scenarios.map((s) => (
          <div
            key={s.title}
            className="rounded-sm border border-graphite/10 bg-muted-bg/40 p-5"
          >
            <h3 className="font-medium">{s.title}</h3>
            <p className="mt-2 text-sm text-muted">{s.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
