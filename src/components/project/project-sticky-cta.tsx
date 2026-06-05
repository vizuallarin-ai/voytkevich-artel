"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cta } from "@/data/copy";
import { pageCopy } from "@/data/positioning";
import type { Project } from "@/types";
import { formatPrice } from "@/lib/utils";

export function ProjectStickyCta({ project }: { project: Project }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-graphite/10 bg-background/95 p-3 backdrop-blur md:hidden"
      role="region"
      aria-label="Быстрый расчёт проекта"
    >
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{project.name}</p>
          <p className="text-xs text-muted">от {formatPrice(project.price)}</p>
        </div>
        <Button asChild size="lg" className="shrink-0">
          <Link href="#project-lead">{cta.projectEstimate}</Link>
        </Button>
      </div>
    </div>
  );
}

export function ProjectSidebar({ project }: { project: Project }) {
  return (
    <aside className="sticky top-28 hidden rounded-sm border border-graphite/10 bg-muted-bg/50 p-6 lg:block">
      <p className="text-xs text-muted">Предварительная стоимость</p>
      <p className="font-display text-3xl">от {formatPrice(project.price)}</p>
      <ul className="mt-4 space-y-2 text-sm text-muted">
        <li>{project.specs.area} м²</li>
        <li>{project.specs.material}</li>
        <li>{project.specs.floors} эт. · ~{project.specs.buildTimeMonths} мес.</li>
      </ul>
      <p className="mt-3 text-[10px] leading-relaxed text-muted">{pageCopy.project.priceNote}</p>
      <Button asChild className="mt-6 w-full" size="lg">
        <Link href="#project-lead">{cta.projectEstimate}</Link>
      </Button>
    </aside>
  );
}
