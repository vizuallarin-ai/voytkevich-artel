"use client";

import { LeadForm } from "@/components/forms/lead-form";
import type { ServicePage } from "@/types/service-page";
import { buildServiceLeadComment } from "@/lib/service-pages";
import { pageCopy } from "@/data/positioning";

const LEAD_FOOTNOTE =
  "Сначала уточним вводные: участок, площадь, материал, комплектацию и сроки. После этого можно предметно говорить о расчёте.";

export function ServiceLeadSection({ page }: { page: ServicePage }) {
  const id = `lead-${page.slug}`;
  const comment = buildServiceLeadComment(page);

  return (
    <section aria-labelledby={`${id}-section-title`}>
      <h2 id={`${id}-section-title`} className="sr-only">
        {page.cta.leadTitle}
      </h2>
      <LeadForm
        id={id}
        title={page.cta.leadTitle}
        subtitle={pageCopy.forms.defaultSubtitle}
        prefilledComment={comment}
        submitLabel={page.cta.leadSubmit ?? page.cta.leadTitle}
        footnote={LEAD_FOOTNOTE}
        leadConfig={{
          sourceType: "service-page",
          pageSlug: page.slug,
          formId: id,
          formName: page.title,
          requestType: "service-page",
          requestTitle: page.cta.leadTitle,
          selectedCTA: page.cta.leadSubmit ?? page.cta.leadTitle,
          conversionGoal: "service_page_submit",
          context: {
            service: {
              slug: page.slug,
              title: page.title,
              serviceType: page.serviceType,
            },
          },
        }}
      />
    </section>
  );
}
