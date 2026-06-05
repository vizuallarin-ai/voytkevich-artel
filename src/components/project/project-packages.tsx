"use client";

import { getDisplayPackages } from "@/lib/project-content";
import type { Project } from "@/types";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function ProjectPackages({ project }: { project: Project }) {
  const packages = getDisplayPackages(project);

  return (
    <section aria-labelledby="project-packages-title">
      <h2 id="project-packages-title" className="font-display text-2xl">
        Возможные комплектации
      </h2>
      <p className="mt-2 text-sm text-muted">
        Состав работ фиксируется после уточнения вводных.
      </p>
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {packages.map((pkg) => (
          <article
            key={pkg.id}
            className="flex flex-col rounded-sm border border-graphite/10 p-6"
          >
            <h3 className="text-lg font-medium">{pkg.name}</h3>
            {pkg.description && (
              <p className="mt-2 text-sm text-muted">{pkg.description}</p>
            )}
            {pkg.priceFrom ? (
              <p className="mt-4 font-display text-2xl">от {formatPrice(pkg.priceFrom)}</p>
            ) : (
              <p className="mt-4 text-sm text-muted">{pkg.priceNote}</p>
            )}
            <ul className="mt-4 flex-1 space-y-1 text-sm text-muted">
              {pkg.includes.map((i) => (
                <li key={i}>— {i}</li>
              ))}
            </ul>
            <Button asChild className="mt-6 w-full" variant="outline">
              <a
                href="#project-lead"
                onClick={() => {
                  sessionStorage.setItem(`project-package-${project.slug}`, pkg.name);
                }}
              >
                Рассчитать в этой комплектации
              </a>
            </Button>
          </article>
        ))}
      </div>
    </section>
  );
}
