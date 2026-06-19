import { ContentSectionPage, contentSectionMetadata } from "@/components/content-cms/ContentSectionPage";

export const metadata = contentSectionMetadata("Очередь публикаций");

export default async function ContentQueuePage() {
  return (
    <ContentSectionPage
      title="Очередь публикаций"
      description="Planned, approved и scheduled материалы по приоритету. Полный календарь — в разделе «Календарь»."
      filters={{ status: ["planned", "approved", "scheduled"] }}
    />
  );
}
