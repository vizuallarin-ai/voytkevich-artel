import type { Metadata } from "next";
import Link from "next/link";
import { publicationRepository } from "@/lib/content-distribution/publication-repository";
import { PublicationTable } from "@/components/content-distribution/PublicationTable";

export const metadata: Metadata = {
  title: "CRM — Публикации",
  robots: { index: false, follow: false },
};

export default async function PublicationsListPage() {
  const publications = await publicationRepository.list();
  return (
    <div className="space-y-6">
      <Link href="/dashboard/content/distribution" className="text-sm text-muted underline">
        ← Дистрибуция
      </Link>
      <h1 className="heading-section text-3xl">Все публикации</h1>
      <PublicationTable items={publications} />
    </div>
  );
}
