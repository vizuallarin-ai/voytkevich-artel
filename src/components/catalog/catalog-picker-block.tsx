import { LeadForm } from "@/components/forms/lead-form";
import { catalogPickerBlock } from "@/data/catalog-copy";
import { cta } from "@/data/copy";

type Props = {
  categorySlug?: string;
  categoryTitle?: string;
};

export function CatalogPickerBlock({ categorySlug, categoryTitle }: Props = {}) {
  return (
    <section
      id="catalog-picker"
      className="scroll-mt-28 rounded-sm border border-graphite/10 bg-muted-bg/60 p-6 md:p-10"
      aria-labelledby="catalog-picker-title"
    >
      <p className="label-caps">Подбор проекта</p>
      <h2 id="catalog-picker-title" className="heading-section mt-2">
        {catalogPickerBlock.title}
      </h2>
      <p className="mt-4 max-w-2xl text-muted">{catalogPickerBlock.text}</p>
      <div className="mt-8 max-w-lg">
        <LeadForm
          id="catalog-picker-form"
          title={categoryTitle ? `Подбор: ${categoryTitle}` : catalogPickerBlock.cta}
          subtitle="Уточним площадь, бюджет, участок и подберём 2–3 варианта из каталога"
          submitLabel={cta.discussPlot}
          leadConfig={{
            sourceType: categorySlug ? "catalog-category" : "catalog",
            pageSlug: categorySlug,
            formId: "catalog-picker-form",
            formName: categoryTitle
              ? `Подбор проекта — ${categoryTitle}`
              : "Подбор проекта из каталога",
            requestType: "project-selection",
            requestTitle: categoryTitle ?? "Подбор проекта под участок",
            selectedCTA: cta.discussPlot,
            conversionGoal: "catalog_project_selection",
            context: categorySlug ? { catalog: { categorySlug } } : undefined,
          }}
        />
      </div>
      <p className="mt-4 max-w-xl text-xs text-muted">{catalogPickerBlock.footnote}</p>
    </section>
  );
}
