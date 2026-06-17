import { ContentSectionPage, contentSectionMetadata, kindFilter } from "@/components/content-cms/ContentSectionPage";

export const metadata = contentSectionMetadata("Технические статьи");

export default async function TechnicalContentCmsPage() {
  return (
    <ContentSectionPage
      title="Техническая база знаний"
      description="How-to, гайды, чек-листы и сравнения. Все материалы noindex до expert review."
      filters={kindFilter("technical-article")}
      showKind={false}
    />
  );
}
