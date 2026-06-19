import type { Metadata } from "next";
import Link from "next/link";
import { ManualExportPageClient } from "@/components/content-distribution/ManualExportPageClient";

export const metadata: Metadata = {
  title: "CRM — Manual export",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ id?: string }> };

export default async function ManualExportPage({ searchParams }: Props) {
  const { id } = await searchParams;
  return (
    <div className="space-y-6">
      <Link href="/dashboard/content/distribution" className="text-sm text-muted underline">
        ← Дистрибуция
      </Link>
      <h1 className="heading-section text-3xl">Manual export</h1>
      <ManualExportPageClient publicationId={id} />
    </div>
  );
}
