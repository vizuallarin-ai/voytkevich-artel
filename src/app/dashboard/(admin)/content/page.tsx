import type { Metadata } from "next";
import { contentService } from "@/lib/content-cms/content-service";
import { REVIEW_QUEUE_STATUSES } from "@/data/content-review-rules";
import { ContentDashboard } from "@/components/content-cms/ContentDashboard";

export const metadata: Metadata = {
  title: "CRM — Контент CMS",
  robots: { index: false, follow: false },
};

export default async function ContentCmsDashboardPage() {
  const [metrics, reviewItems] = await Promise.all([
    contentService.getMetrics(),
    contentService.list({ status: [...REVIEW_QUEUE_STATUSES] }),
  ]);

  return <ContentDashboard metrics={metrics} reviewItems={reviewItems.slice(0, 10)} />;
}
