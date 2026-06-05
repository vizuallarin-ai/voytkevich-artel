"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, GitCompare, Bed, Layers, Maximize } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { projectBadges } from "@/lib/project-meta";
import type { Project } from "@/types";
import { Button } from "@/components/ui/button";
import { cta } from "@/data/copy";
import { pageCopy } from "@/data/positioning";
import { useFavorites } from "@/hooks/use-favorites";

export function ProjectCard({
  project,
  compare,
  onCompare,
}: {
  project: Project;
  compare?: string[];
  onCompare?: (id: string) => void;
  leadSource?: string;
  filterContext?: string;
}) {
  const { isFavorite, toggle } = useFavorites();
  const fav = isFavorite(project.id);
  const inCompare = compare?.includes(project.id);
  const badges = projectBadges(project);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-sm bg-background shadow-sm transition hover:shadow-lg">
      <Link href={`/catalog/${project.slug}`} className="relative block aspect-[4/3] overflow-hidden">
        <Image
          src={project.images[0]}
          alt={`Проект дома ${project.name} — ${project.specs.area} м²`}
          fill
          className="object-cover transition duration-700 group-hover:scale-105"
          sizes="(max-width:768px) 100vw, 33vw"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-graphite/60 to-transparent opacity-0 transition group-hover:opacity-100" />
        <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
          <span className="text-sm text-background">{cta.openProject} →</span>
        </div>
      </Link>

      <div className="absolute right-3 top-3 flex gap-2">
        <button
          type="button"
          onClick={() => toggle(project.id)}
          className="glass flex h-9 w-9 items-center justify-center rounded-full"
          aria-label={fav ? "Убрать из избранного" : "В избранное"}
        >
          <Heart className={cn("h-4 w-4", fav && "fill-graphite text-graphite")} />
        </button>
        {onCompare && (
          <button
            type="button"
            onClick={() => onCompare(project.id)}
            className={cn(
              "glass flex h-9 w-9 items-center justify-center rounded-full",
              inCompare && "ring-2 ring-graphite",
            )}
            aria-label="Сравнить"
          >
            <GitCompare className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-display text-xl">
              <Link href={`/catalog/${project.slug}`} className="hover:underline">
                {project.name}
              </Link>
            </h3>
            <p className="mt-1 text-sm text-muted">{project.tagline}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-xs text-muted">от</p>
            <p className="font-medium">{formatPrice(project.price)}</p>
          </div>
        </div>

        <ul className="mt-3 flex flex-wrap gap-1.5">
          {badges.map((b) => (
            <li
              key={b}
              className="rounded-full bg-sand/80 px-2 py-0.5 text-[10px] uppercase tracking-wide text-graphite/80"
            >
              {b}
            </li>
          ))}
        </ul>

        <ul className="mt-3 flex flex-wrap gap-3 text-xs text-muted">
          <li className="flex items-center gap-1">
            <Maximize className="h-3.5 w-3.5" /> {project.specs.area} м²
          </li>
          <li className="flex items-center gap-1">
            <Layers className="h-3.5 w-3.5" /> {project.specs.floors} эт.
          </li>
          <li className="flex items-center gap-1">
            <Bed className="h-3.5 w-3.5" /> {project.specs.bedrooms} спален
          </li>
        </ul>

        <p className="mt-2 text-xs text-muted">
          {project.specs.buildTimeMonths} мес. · {project.specs.material}
        </p>

        {project.shortDescription && (
          <p className="mt-3 line-clamp-2 text-xs text-muted">{project.shortDescription}</p>
        )}

        <p className="mt-2 text-[10px] leading-relaxed text-muted">{pageCopy.project.priceNote}</p>

        <div className="mt-5 flex flex-col gap-2">
          <Button asChild className="w-full">
            <Link href={`/catalog/${project.slug}#project-lead`}>{cta.projectEstimate}</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href={`/catalog/${project.slug}`}>{cta.openProject}</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
