import Link from "next/link";
import { ProjectCard } from "@/components/catalog/project-card";
import { Button } from "@/components/ui/button";
import { buildPlannerCalculatorUrl, type PlannerDraft } from "@/lib/planner";
import { trackPlannerEvent } from "@/lib/planner-analytics";
import { cta } from "@/data/copy";
import type { Project } from "@/types";

export function PlannerRelatedProjects({
  projects,
  draft,
}: {
  projects: Project[];
  draft: PlannerDraft;
}) {
  const calcUrl = buildPlannerCalculatorUrl(draft);

  if (!projects.length) {
    return (
      <section className="mt-8">
        <h2 className="font-display text-xl">Похожие проекты из каталога</h2>
        <p className="mt-2 text-muted">
          Пока нет точного совпадения. Отправьте планировку специалисту — он подберёт или
          адаптирует проект под ваши вводные.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href="/catalog#catalog-picker">Подобрать проект вручную</Link>
          </Button>
          <Button asChild>
            <Link href={calcUrl} onClick={() => trackPlannerEvent("planner_calculator_clicked")}>
              Рассчитать стоимость планировки
            </Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="planner-related-title">
      <h2 id="planner-related-title" className="font-display text-xl">
        Похожие проекты из каталога
      </h2>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <div key={p.id} className="space-y-3">
            <ProjectCard project={p} leadSource="planner-related" />
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link
                href={`/catalog/${p.slug}`}
                onClick={() =>
                  trackPlannerEvent("planner_project_clicked", {
                    relatedProjectSlugs: [p.slug],
                  })
                }
              >
                Рассчитать по моей планировке
              </Link>
            </Button>
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link href="/catalog">{cta.viewCatalog}</Link>
        </Button>
        <Button asChild>
          <Link href={calcUrl} onClick={() => trackPlannerEvent("planner_calculator_clicked")}>
            Рассчитать стоимость этой планировки
          </Link>
        </Button>
      </div>
    </section>
  );
}
