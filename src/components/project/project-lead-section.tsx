"use client";

import { useEffect, useState } from "react";
import { LeadForm } from "@/components/forms/lead-form";
import { buildProjectLeadComment } from "@/lib/project-content";
import type { Project } from "@/types";

export function ProjectLeadSection({
  project,
  slug,
}: {
  project: Project;
  slug: string;
}) {
  const [packageName, setPackageName] = useState<string | undefined>();

  useEffect(() => {
    const stored = sessionStorage.getItem(`project-package-${slug}`);
    if (stored) setPackageName(stored);
  }, [slug]);

  const comment = buildProjectLeadComment(project, {
    packageName,
    url: typeof window !== "undefined" ? window.location.href : undefined,
  });

  return (
    <section id="project-lead" className="scroll-mt-28">
      <LeadForm
        title={`Получить расчёт проекта ${project.name}`}
        subtitle="Оставьте контакты — уточним участок, комплектацию, материал и подготовим предварительный расчёт."
        prefilledArea={String(project.specs.area)}
        prefilledComment={comment}
        source={`project-page-${slug}`}
        submitLabel="Отправить проект на расчёт"
        footnote="Сначала уточним вводные. Без навязчивых звонков и обещаний цены без расчёта."
      />
    </section>
  );
}
