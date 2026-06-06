import Link from "next/link";
import Image from "next/image";
import type { CaseItem } from "@/types/case";
import type { Project } from "@/types";
import { Button } from "@/components/ui/button";
import { CaseCard } from "./case-card";
import { resolveCaseServiceLink } from "@/lib/cases";
import { formatPrice } from "@/lib/utils";
import { cta } from "@/data/copy";

export function RelatedCasesSection({
  cases,
  title = "Похожие кейсы",
  id = "related-cases",
}: {
  cases: CaseItem[];
  title?: string;
  id?: string;
}) {
  if (!cases.length) return null;
  return (
    <section aria-labelledby={id} className="mt-16">
      <h2 id={id} className="heading-section text-2xl">
        {title}
      </h2>
      <div className="mt-8 grid gap-8 md:grid-cols-2">
        {cases.map((item) => (
          <CaseCard key={item.slug} item={item} />
        ))}
      </div>
      <Button asChild variant="outline" className="mt-8">
        <Link href="/cases">Все кейсы</Link>
      </Button>
    </section>
  );
}

export function CaseRelatedProjects({
  projects,
  caseSlug,
}: {
  projects: Project[];
  caseSlug: string;
}) {
  if (!projects.length) {
    return (
      <section aria-labelledby="case-projects-title" className="mt-16 rounded-sm border border-dashed border-graphite/20 p-8 text-center">
        <h2 id="case-projects-title" className="heading-section text-2xl">
          Похожие проекты домов
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted">
          Посмотрите каталог или оставьте заявку — подберём проект под похожую задачу.
        </p>
        <Button asChild className="mt-6">
          <Link href="/catalog">Смотреть каталог</Link>
        </Button>
      </section>
    );
  }

  return (
    <section aria-labelledby="case-projects-title" className="mt-16">
      <h2 id="case-projects-title" className="heading-section text-2xl">
        Похожие проекты домов
      </h2>
      <p className="mt-2 text-sm text-muted">
        Цена — ориентир «от». Точная смета после уточнения участка и комплектации.
      </p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.slice(0, 6).map((project) => (
          <article
            key={project.id}
            className="flex flex-col overflow-hidden rounded-sm border border-graphite/10"
          >
            <Link href={`/catalog/${project.slug}`} className="relative block aspect-[4/3]">
              <Image src={project.images[0]} alt={project.name} fill className="object-cover" sizes="33vw" />
            </Link>
            <div className="flex flex-1 flex-col p-4">
              <h3 className="font-display text-lg">
                <Link href={`/catalog/${project.slug}`} className="hover:underline">
                  {project.name}
                </Link>
              </h3>
              <p className="mt-1 text-sm text-muted">
                {project.specs.area} м² · {project.specs.material}
              </p>
              <p className="mt-2 text-sm font-medium">от {formatPrice(project.price)}</p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Button asChild size="sm" variant="outline" className="flex-1">
                  <Link href={`/catalog/${project.slug}`}>{cta.openProject}</Link>
                </Button>
                <Button asChild size="sm" className="flex-1">
                  <Link href={`/calculator?source=case&case=${caseSlug}&project=${project.slug}`}>
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

export function CaseRelatedLinks({
  serviceSlugs,
  blogLinks,
}: {
  serviceSlugs?: string[];
  blogLinks?: { href: string; label: string }[];
}) {
  const services = (serviceSlugs ?? []).map(resolveCaseServiceLink);
  const blogs = blogLinks ?? [];
  if (!services.length && !blogs.length) return null;

  return (
    <section aria-labelledby="case-related-links" className="mt-16">
      <h2 id="case-related-links" className="heading-section text-2xl">
        Полезно по теме
      </h2>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {services.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="flex items-center gap-2 rounded-sm border border-graphite/10 px-4 py-3 text-sm transition hover:border-wood/40 hover:bg-wood/5"
            >
              <span className="text-wood">→</span>
              {link.label}
            </Link>
          </li>
        ))}
        {blogs.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="flex items-center gap-2 rounded-sm border border-graphite/10 px-4 py-3 text-sm transition hover:border-wood/40 hover:bg-wood/5"
            >
              <span className="text-wood">→</span>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
