import type { Metadata } from "next";
import Link from "next/link";
import { ContentCalendarDashboard } from "@/components/content-calendar/ContentCalendarDashboard";

export const metadata: Metadata = {
  title: "CRM — Контент-календарь",
  robots: { index: false, follow: false },
};

export default function ContentCalendarPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/content" className="text-sm text-muted underline-offset-4 hover:underline">
          ← Контент CMS
        </Link>
        <h1 className="mt-3 heading-section text-3xl">Контент-календарь</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted">
          Планировщик публикаций: readiness, capacity, balance и очередь approved материалов.
        </p>
      </div>
      <ContentCalendarDashboard />
    </div>
  );
}
