import Link from "next/link";
import Image from "next/image";
import type { Project } from "@/types";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { cta } from "@/data/copy";

export function BlogRelatedProjects({ projects }: { projects: Project[] }) {
  if (!projects.length) {
    return (
      <section aria-labelledby="blog-projects-title" className="mt-16 rounded-sm border border-dashed border-graphite/20 p-8 text-center">
        <h2 id="blog-projects-title" className="heading-section text-2xl">
          Проекты, которые могут подойти
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted">
          Подберём проект вручную — посмотрите каталог или оставьте заявку.
        </p>
        <Button asChild className="mt-6">
          <Link href="/catalog">{cta.viewProjects}</Link>
        </Button>
      </section>
    );
  }

  const shown = projects.slice(0, 6);
  return (
    <section aria-labelledby="blog-projects-title" className="mt-16">
      <h2 id="blog-projects-title" className="heading-section text-2xl">
        Проекты, которые могут подойти
      </h2>
      <p className="mt-2 text-sm text-muted">
        Цена — ориентир «от». Точная смета после уточнения участка и комплектации.
      </p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((project) => (
          <article
            key={project.id}
            className="flex flex-col overflow-hidden rounded-sm border border-graphite/10 bg-background shadow-sm"
          >
            <Link href={`/catalog/${project.slug}`} className="relative block aspect-[4/3] overflow-hidden">
              <Image
                src={project.images[0]}
                alt={project.name}
                fill
                className="object-cover transition duration-500 hover:scale-105"
                sizes="(max-width:768px) 100vw, 33vw"
              />
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
              <Button asChild size="sm" variant="outline" className="mt-4">
                <Link href={`/catalog/${project.slug}`}>{cta.openProject}</Link>
              </Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
