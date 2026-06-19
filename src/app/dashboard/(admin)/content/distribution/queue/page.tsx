import type { Metadata } from "next";
import Link from "next/link";
import { PublicationQueueTable } from "@/components/content-distribution/PublicationQueueTable";

export const metadata: Metadata = {
  title: "CRM — Очередь публикаций",
  robots: { index: false, follow: false },
};

export default function DistributionQueuePage() {
  return (
    <div className="space-y-6">
      <Link href="/dashboard/content/distribution" className="text-sm text-muted underline">
        ← Дистрибуция
      </Link>
      <h1 className="heading-section text-3xl">Очередь публикаций</h1>
      <PublicationQueueTable />
    </div>
  );
}
