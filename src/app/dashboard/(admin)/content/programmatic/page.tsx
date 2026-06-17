import { ContentSectionPage, contentSectionMetadata, kindFilter } from "@/components/content-cms/ContentSectionPage";

export const metadata = contentSectionMetadata("Programmatic SEO");

export default async function ProgrammaticContentPage() {
  return (
    <ContentSectionPage
      title="Programmatic SEO"
      description="Страницы проектов, категории, материалы, география и комбинации таксономии."
      filters={kindFilter("programmatic-page")}
    />
  );
}
