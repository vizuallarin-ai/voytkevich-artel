import type { Metadata } from "next";
import { Suspense } from "react";
import { contentService } from "@/lib/content-cms/content-service";
import { ContentTable } from "@/components/content-cms/ContentTable";
import { ContentFiltersBar, parseContentFiltersFromSearchParams } from "@/components/content-cms/ContentFilters";
import Link from "next/link";

export const metadata: Metadata = {
  title: "CRM — Все материалы",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function ContentItemsPage({ searchParams }: Props) {
  const params = await searchParams;
  const urlParams = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (typeof v === "string") urlParams.set(k, v);
  }
  const filters = parseContentFiltersFromSearchParams(urlParams);
  const items = await contentService.list(filters);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/content" className="text-sm text-muted underline-offset-4 hover:underline">
          ← Контент CMS
        </Link>
        <h1 className="mt-3 heading-section text-3xl">Все материалы</h1>
        <p className="mt-2 text-sm text-muted">Единый список programmatic, technical и editorial контента.</p>
      </div>
      <Suspense fallback={null}>
        <ContentFiltersBar />
      </Suspense>
      <ContentTable items={items} />
    </div>
  );
}
