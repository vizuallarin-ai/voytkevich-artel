import Link from "next/link";
import { projectBadges } from "@/lib/project-meta";
import { buildCalculatorUrl } from "@/lib/calculator";
import type { Project } from "@/types";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { cta } from "@/data/copy";
import { pageCopy } from "@/data/positioning";

export function ProjectHero({ project }: { project: Project }) {
  const { specs } = project;
  const badges = projectBadges(project);

  return (
    <header className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
      <div>
        <p className="label-caps">
          {specs.material} · {specs.style}
        </p>
        <h1 className="heading-section mt-2">
          Проект дома {project.name} — {specs.area} м²
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">
          Готовый проект для строительства под ключ в Иркутске и Иркутской области. Можно
          адаптировать под участок, состав семьи, материал, комплектацию и бюджет.
        </p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {badges.map((b) => (
            <li
              key={b}
              className="rounded-full bg-sand/80 px-3 py-1 text-xs uppercase tracking-wide"
            >
              {b}
            </li>
          ))}
        </ul>
      </div>
      <div className="lg:text-right">
        <p className="text-xs text-muted">от</p>
        <p className="font-display text-3xl md:text-4xl">{formatPrice(project.price)}</p>
        <p className="mt-2 text-sm text-muted">
          {specs.area} м² · {specs.buildTimeMonths} мес. · {specs.bedrooms} спален
        </p>
        <p className="mt-2 max-w-xs text-xs text-muted lg:ml-auto">{pageCopy.project.priceNote}</p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row lg:justify-end">
          <Button asChild size="lg">
            <Link href="#project-lead">{cta.projectEstimate}</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link
              href={buildCalculatorUrl({
                project: project.slug,
                area: project.specs.area,
                material: project.specs.material,
                floors: project.specs.floors <= 2 ? project.specs.floors : 2,
                source: "project-page",
              })}
            >
              Рассчитать этот проект
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
