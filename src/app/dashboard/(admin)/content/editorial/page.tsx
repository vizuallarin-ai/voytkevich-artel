import { ContentSectionPage, contentSectionMetadata, kindFilter } from "@/components/content-cms/ContentSectionPage";

export const metadata = contentSectionMetadata("Редакционный блог");

export default async function EditorialContentCmsPage() {
  return (
    <ContentSectionPage
      title="Редакционный блог"
      description="Истории, новости, дайджесты и авторские рубрики с маркировкой fiction."
      filters={kindFilter(["editorial-content", "news", "digest"])}
      showKind={true}
    />
  );
}
