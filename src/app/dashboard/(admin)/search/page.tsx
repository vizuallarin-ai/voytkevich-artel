import type { Metadata } from "next";
import Link from "next/link";
import { SearchDashboard } from "@/components/search/SearchDashboard";

export const metadata: Metadata = {
  title: "CRM — Search",
  robots: { index: false, follow: false },
};

export default function SearchAdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/content" className="text-sm text-muted underline">← Контент CMS</Link>
        <h1 className="mt-3 heading-section text-3xl">Search</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted">
          Hybrid retrieval, index health, queries и zero-results analytics.
        </p>
      </div>
      <SearchDashboard />
    </div>
  );
}
