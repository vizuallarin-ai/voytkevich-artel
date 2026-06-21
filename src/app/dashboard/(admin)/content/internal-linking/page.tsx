import type { Metadata } from "next";
import Link from "next/link";
import { InternalLinkingDashboard } from "@/components/knowledge-graph/InternalLinkingDashboard";

export const metadata: Metadata = {
  title: "CRM — Internal Linking",
  robots: { index: false, follow: false },
};

export default function InternalLinkingPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/content/knowledge-graph" className="text-sm text-muted underline">
          ← Knowledge Graph
        </Link>
        <h1 className="mt-3 heading-section text-3xl">Internal Linking</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted">
          Инвентарь ссылок, relevance scoring, рекомендации и batch workflow с rollback.
        </p>
      </div>
      <InternalLinkingDashboard />
    </div>
  );
}
