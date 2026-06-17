"use client";

import type { ProgrammaticPageData } from "@/types/programmatic-page-template";
import { LeadForm } from "@/components/forms/lead-form";
import {
  buildProgrammaticLeadContext,
  formatProgrammaticLeadSummary,
} from "@/lib/programmatic-seo/programmatic-lead-context";
import type { LeadContext } from "@/types/lead";

export function ProgrammaticLeadForm({ page }: { page: ProgrammaticPageData }) {
  const leadCtx = buildProgrammaticLeadContext(page, page.cta.sourceCTA, "final-form");
  const context: LeadContext = {
    programmatic: leadCtx,
  };

  return (
    <section id="programmatic-lead-form" className="mt-16 scroll-mt-28">
      <LeadForm
        id="programmatic-lead-form"
        title={page.cta.primary}
        subtitle="Оставьте контакты — специалист учтёт параметры этой подборки при расчёте."
        managerNote={formatProgrammaticLeadSummary(leadCtx)}
        submitLabel={page.cta.primary}
        leadConfig={{
          sourceType: "programmatic-seo",
          pageSlug: page.slug,
          formId: "programmatic-lead-form",
          formName: page.h1,
          selectedCTA: page.cta.sourceCTA,
          ctaPosition: "final",
          context,
          conversionGoal: "catalog_project_selection",
        }}
      />
    </section>
  );
}
