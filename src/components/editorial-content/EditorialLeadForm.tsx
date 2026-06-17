"use client";

import type { EditorialContentItem } from "@/types/editorial-content";
import { LeadForm } from "@/components/forms/lead-form";
import {
  buildEditorialLeadContext,
  formatEditorialLeadSummary,
} from "@/lib/editorial-content/editorial-lead-context";
import type { LeadContext } from "@/types/lead";

export function EditorialLeadForm({ item }: { item: EditorialContentItem }) {
  const leadCtx = buildEditorialLeadContext(item, item.cta.sourceCTA, "final-form");
  const context: LeadContext = {
    editorial: leadCtx,
  };

  return (
    <section id="editorial-lead-form" className="mt-12 scroll-mt-28">
      <LeadForm
        id="editorial-lead-form"
        title={item.cta.primary}
        subtitle="Оставьте контакты — учтём тему материала при разборе вашего случая."
        managerNote={formatEditorialLeadSummary(leadCtx)}
        submitLabel={item.cta.primary}
        leadConfig={{
          sourceType: "editorial-content",
          pageSlug: item.slug,
          formId: "editorial-lead-form",
          formName: item.h1,
          selectedCTA: item.cta.sourceCTA,
          ctaPosition: "final",
          context,
          conversionGoal: "blog_submit",
        }}
      />
    </section>
  );
}
