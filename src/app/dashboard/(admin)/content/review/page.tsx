import { ContentSectionPage, contentSectionMetadata } from "@/components/content-cms/ContentSectionPage";
import { REVIEW_QUEUE_STATUSES } from "@/data/content-review-rules";

export const metadata = contentSectionMetadata("Review queue");

export default async function ContentReviewPage() {
  return (
    <ContentSectionPage
      title="Review queue"
      description="Материалы на проверке: AI-generated, needs-source, fact-check, expert review."
      filters={{ status: [...REVIEW_QUEUE_STATUSES] }}
    />
  );
}
