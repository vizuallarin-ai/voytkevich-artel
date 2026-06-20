import type { Metadata } from "next";
import Link from "next/link";
import { ContentRefreshDashboard } from "@/components/content-refresh/ContentRefreshDashboard";

export const metadata: Metadata = {
  title: "CRM — Content Refresh",
  robots: { index: false, follow: false },
};

export default function ContentRefreshPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/content" className="text-sm text-muted underline">← Контент CMS</Link>
        <h1 className="mt-3 heading-section text-3xl">Content Refresh</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted">
          Управляемое обновление контента на основе аналитики Этапа 30. Human review обязателен.
        </p>
      </div>
      <ContentRefreshDashboard />
    </div>
  );
}
