import Link from "next/link";
import { ProjectCard } from "@/components/catalog/project-card";
import { Button } from "@/components/ui/button";
import { cta } from "@/data/copy";
import type { Project } from "@/types";

export function CalculatorRelatedProjects({ projects }: { projects: Project[] }) {
  if (!projects.length) {
    return (
      <section className="mt-16 text-center">
        <h2 className="font-display text-2xl">
          Проекты, которые могут подойти под ваш расчёт
        </h2>
        <p className="mt-2 text-muted">
          Пока не нашли точных совпадений — посмотрите каталог или оставьте заявку на подбор.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/catalog">{cta.viewCatalog}</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/catalog#catalog-picker">Подобрать проект вручную</Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-16" aria-labelledby="calc-related-title">
      <h2 id="calc-related-title" className="font-display text-2xl">
        Проекты, которые могут подойти под ваш расчёт
      </h2>
      <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <ProjectCard key={p.id} project={p} leadSource="calculator-related" />
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link href="/catalog">{cta.viewCatalog}</Link>
        </Button>
      </div>
    </section>
  );
}
