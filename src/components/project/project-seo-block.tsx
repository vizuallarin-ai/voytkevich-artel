import { buildProjectSeoText } from "@/lib/project-content";
import type { Project } from "@/types";

export function ProjectSeoBlock({ project }: { project: Project }) {
  const paragraphs = buildProjectSeoText(project);

  return (
    <section
      className="mt-16 border-t border-graphite/10 pt-12"
      aria-labelledby="project-seo-title"
    >
      <h2 id="project-seo-title" className="font-display text-xl md:text-2xl">
        Строительство проекта {project.name} в Иркутской области
      </h2>
      <div className="mt-4 max-w-3xl space-y-4 text-sm text-muted">
        {paragraphs.map((p) => (
          <p key={p.slice(0, 48)}>{p}</p>
        ))}
      </div>
    </section>
  );
}
