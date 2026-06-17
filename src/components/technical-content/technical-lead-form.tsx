"use client";

import type { TechnicalArticle } from "@/types/technical-content";
import { LeadForm } from "@/components/forms/lead-form";
import {
  buildTechnicalLeadContext,
  formatTechnicalLeadSummary,
} from "@/lib/technical-content/technical-lead-context";
import type { LeadContext } from "@/types/lead";

export function TechnicalLeadForm({ article }: { article: TechnicalArticle }) {
  const leadCtx = buildTechnicalLeadContext(article, article.cta.sourceCTA, "final-form");
  const context: LeadContext = {
    technical: leadCtx,
  };

  return (
    <section id="technical-lead-form" className="mt-12 scroll-mt-28">
      <LeadForm
        id="technical-lead-form"
        title={article.cta.primary}
        subtitle="Оставьте контакты — учтём тему статьи при разборе вашего случая."
        managerNote={formatTechnicalLeadSummary(leadCtx)}
        submitLabel={article.cta.primary}
        leadConfig={{
          sourceType: "technical-article",
          pageSlug: article.slug,
          formId: "technical-lead-form",
          formName: article.h1,
          selectedCTA: article.cta.sourceCTA,
          ctaPosition: "final",
          context,
          conversionGoal: "blog_submit",
        }}
      />
    </section>
  );
}
