import Link from "next/link";
import { ProjectCard } from "@/components/catalog/project-card";
import { Button } from "@/components/ui/button";
import { cta } from "@/data/copy";
import type { Project } from "@/types";

export function ProjectRelated({ similar }: { similar: Project[] }) {
  if (!similar.length) {
    return (
      <section className="mt-16 text-center">
        <Button asChild variant="outline">
          <Link href="/catalog">{cta.viewProjects}</Link>
        </Button>
      </section>
    );
  }

  return (
    <section aria-labelledby="project-related-title">
      <h2 id="project-related-title" className="font-display text-2xl">
        Похожие проекты
      </h2>
      <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {similar.map((p) => (
          <ProjectCard key={p.id} project={p} leadSource="project-related" />
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link href="/catalog">{cta.viewCatalog}</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/catalog#catalog-picker">Подобрать похожий проект</Link>
        </Button>
      </div>
    </section>
  );
}
