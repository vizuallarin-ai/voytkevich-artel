"use client";

import type { ProgrammaticPageData } from "@/types/programmatic-page-template";
import { ProjectCard } from "@/components/catalog/project-card";
import { trackProgrammaticProjectClicked } from "@/lib/programmatic-seo/programmatic-analytics";

export function ProgrammaticProjectGrid({ page }: { page: ProgrammaticPageData }) {
  const projects = page.projects.matched;

  const handleProjectClick = (slug: string) => {
    trackProgrammaticProjectClicked({
      pageType: page.analytics.pageType,
      pageSlug: page.analytics.pageSlug,
      templateType: page.templateType,
      projectSlug: slug,
    });
  };

  return (
    <section className="mt-12" aria-labelledby="programmatic-projects">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 id="programmatic-projects" className="font-display text-2xl md:text-3xl">
          Проекты в подборке
        </h2>
        <p className="text-sm text-muted">{projects.length} в каталоге</p>
      </div>

      {page.content.disclaimer ? (
        <p className="mt-4 rounded-sm border border-graphite/10 bg-sand/40 px-4 py-3 text-sm text-muted">
          {page.content.disclaimer}
        </p>
      ) : null}

      {projects.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div key={project.id} onClick={() => handleProjectClick(project.slug)} role="presentation">
              <ProjectCard project={project} leadSource="programmatic-seo" />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-sm border border-dashed border-graphite/20 bg-background p-8 text-center">
          <p className="text-muted">
            Пока нет точных проектов под этот запрос. Мы можем подобрать или адаптировать проект под
            ваши вводные.
          </p>
        </div>
      )}

      {page.projects.related.length > 0 ? (
        <div className="mt-12">
          <h3 className="font-display text-xl">Похожие проекты</h3>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {page.projects.related.map((project) => (
              <ProjectCard key={project.id} project={project} leadSource="programmatic-related" />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
