"use client";

import { useState } from "react";
import { LeadForm } from "@/components/forms/lead-form";
import { buildProjectLeadComment } from "@/lib/project-content";
import type { Project } from "@/types";

function readPackageName(slug: string): string | undefined {
  if (typeof window === "undefined") return undefined;
  return sessionStorage.getItem(`project-package-${slug}`) ?? undefined;
}

export function ProjectLeadSection({
  project,
  slug,
}: {
  project: Project;
  slug: string;
}) {
  const [packageName] = useState<string | undefined>(() => readPackageName(slug));

  const comment = buildProjectLeadComment(project, {
    packageName,
    url: typeof window !== "undefined" ? window.location.href : undefined,
  });

  return (
    <section id="project-lead" className="scroll-mt-28">
      <LeadForm
        id="project-lead-form"
        title={`Получить расчёт проекта ${project.name}`}
        subtitle="Оставьте контакты — уточним участок, комплектацию, материал и подготовим предварительный расчёт."
        prefilledArea={String(project.specs.area)}
        managerNote={comment}
        commentPlaceholder="Например: район участка, сроки, изменения в планировке"
        submitLabel="Отправить проект на расчёт"
        footnote="Сначала уточним вводные. Без навязчивых звонков и обещаний цены без расчёта."
        leadConfig={{
          sourceType: "project-page",
          pageSlug: slug,
          formId: "project-lead-form",
          formName: `Расчёт проекта ${project.name}`,
          requestType: "project-estimate",
          requestTitle: `Получить расчёт проекта ${project.name}`,
          selectedCTA: "Отправить проект на расчёт",
          conversionGoal: "project_request",
          context: {
            project: {
              slug,
              title: project.name,
              area: project.specs.area,
              material: project.specs.material,
              floors: project.specs.floors,
              priceFrom: project.price,
            },
          },
        }}
        successMessage="Заявка по проекту отправлена. Мы получили название проекта и ваши вводные."
      />
    </section>
  );
}
