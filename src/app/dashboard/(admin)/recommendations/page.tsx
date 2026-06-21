import type { Metadata } from "next";
import Link from "next/link";
import { RecommendationsDashboard } from "@/components/recommendations/RecommendationsDashboard";

export const metadata: Metadata = {
  title: "CRM — Recommendations",
  robots: { index: false, follow: false },
};

export default function RecommendationsAdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/content" className="text-sm text-muted underline">
          ← Контент CMS
        </Link>
        <h1 className="mt-3 heading-section text-3xl">Recommendations</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted">
          Персонализация, качество рекомендаций, privacy и review queue.
        </p>
      </div>
      <RecommendationsDashboard />
    </div>
  );
}
