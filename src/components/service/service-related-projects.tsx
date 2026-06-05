import Link from "next/link";
import Image from "next/image";
import type { Project } from "@/types";
import type { ServicePage } from "@/types/service-page";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { buildServiceProjectCalculatorUrl } from "@/lib/service-pages";
import { cta } from "@/data/copy";

export function ServiceRelatedProjects({
  page,
  projects,
}: {
  page: ServicePage;
  projects: Project[];
}) {
  const catalogUrl = page.relatedCatalogHref ?? "/catalog";

  if (projects.length === 0) {
    return (
      <section aria-labelledby="service-projects-title" className="rounded-sm border border-dashed border-graphite/20 p-8 text-center">
        <h2 id="service-projects-title" className="heading-section text-2xl">
          Подходящие проекты
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted">
          В этой подборке пока нет проектов. Посмотрите каталог или оставьте заявку — подберём вручную.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild>
            <Link href={catalogUrl}>{page.cta.catalog ?? "Смотреть проекты"}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`#lead-${page.slug}`}>Подобрать проект</Link>
          </Button>
        </div>
      </section>
    );
  }

  const shown = projects.slice(0, 6);

  return (
    <section aria-labelledby="service-projects-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="service-projects-title" className="heading-section text-2xl md:text-3xl">
            Подходящие проекты
          </h2>
          <p className="mt-2 text-sm text-muted">
            Цена — ориентир «от». Точная смета после уточнения участка и комплектации.
          </p>
        </div>
        <Button asChild variant="outline" className="shrink-0">
          <Link href={catalogUrl}>Все проекты</Link>
        </Button>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((project) => (
          <article
            key={project.id}
            className="flex flex-col overflow-hidden rounded-sm border border-graphite/10 bg-background shadow-sm transition hover:shadow-md"
          >
            <Link
              href={`/catalog/${project.slug}`}
              className="relative block aspect-[4/3] overflow-hidden"
            >
              <Image
                src={project.images[0]}
                alt={`Проект ${project.name}`}
                fill
                className="object-cover transition duration-500 hover:scale-105"
                sizes="(max-width:768px) 100vw, 33vw"
              />
            </Link>
            <div className="flex flex-1 flex-col p-5">
              <h3 className="font-display text-xl">
                <Link href={`/catalog/${project.slug}`} className="hover:underline">
                  {project.name}
                </Link>
              </h3>
              <p className="mt-1 text-sm text-muted">
                {project.specs.area} м² · {project.specs.floors} эт. · {project.specs.material}
              </p>
              <p className="mt-2 font-medium">от {formatPrice(project.price)}</p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Button asChild size="sm" variant="outline" className="flex-1">
                  <Link href={`/catalog/${project.slug}`}>{cta.openProject}</Link>
                </Button>
                <Button asChild size="sm" className="flex-1">
                  <Link href={buildServiceProjectCalculatorUrl(page, project.slug)}>
                    Рассчитать
                  </Link>
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
