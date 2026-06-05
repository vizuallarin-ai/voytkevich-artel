"use client";

import Link from "next/link";
import { getDisplayPackages } from "@/lib/project-content";
import { buildCalculatorUrl, type PackageTypeId } from "@/lib/calculator";
import type { Project } from "@/types";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const PACKAGE_MAP: Record<string, PackageTypeId> = {
  shell: "коробка",
  korobka: "коробка",
  warm: "тёплый контур",
  pred: "предчистовая",
  full: "под ключ",
  turnkey: "под ключ",
};

function packageTypeFromId(id: string, name: string): PackageTypeId {
  if (PACKAGE_MAP[id]) return PACKAGE_MAP[id];
  if (name.toLowerCase().includes("короб")) return "коробка";
  if (name.toLowerCase().includes("тёпл") || name.toLowerCase().includes("тепл"))
    return "тёплый контур";
  if (name.toLowerCase().includes("предчист")) return "предчистовая";
  return "под ключ";
}

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
              <Link
                href={buildCalculatorUrl({
                  project: project.slug,
                  area: project.specs.area,
                  material: project.specs.material,
                  floors: project.specs.floors <= 2 ? project.specs.floors : 2,
                  packageType: packageTypeFromId(pkg.id, pkg.name),
                  bedrooms: Math.min(4, project.specs.bedrooms),
                  source: "project-page",
                })}
                onClick={() => {
                  sessionStorage.setItem(`project-package-${project.slug}`, pkg.name);
                }}
              >
                Рассчитать в этой комплектации
              </Link>
            </Button>
          </article>
        ))}
      </div>
    </section>
  );
}
