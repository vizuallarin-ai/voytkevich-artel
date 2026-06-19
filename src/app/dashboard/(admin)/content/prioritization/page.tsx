import type { Metadata } from "next";
import Link from "next/link";
import { PriorityDashboard } from "@/components/content-prioritization/PriorityDashboard";

export const metadata: Metadata = {
  title: "CRM — Приоритизация контента",
  robots: { index: false, follow: false },
};

export default function PrioritizationPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/content" className="text-sm text-muted underline">
          ← Контент CMS
        </Link>
        <h1 className="mt-3 heading-section text-3xl">Приоритизация контента</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted">
          Score P1–P5 по семантике, интенту, лид-потенциалу и readiness. Без fake search volume.
        </p>
      </div>
      <PriorityDashboard />
    </div>
  );
}
