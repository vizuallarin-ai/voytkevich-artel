import type { Metadata } from "next";
import Link from "next/link";
import { KnowledgeGraphDashboard } from "@/components/knowledge-graph/KnowledgeGraphDashboard";

export const metadata: Metadata = {
  title: "CRM — Knowledge Graph",
  robots: { index: false, follow: false },
};

export default function KnowledgeGraphPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/content" className="text-sm text-muted underline">
          ← Контент CMS
        </Link>
        <h1 className="mt-3 heading-section text-3xl">Knowledge Graph</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted">
          Единый контентный граф: сущности, связи, pillar-cluster, перелинковка и валидация.
        </p>
      </div>
      <KnowledgeGraphDashboard />
    </div>
  );
}
