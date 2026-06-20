import type { Metadata } from "next";
import Link from "next/link";
import { IndexationDashboard } from "@/components/dashboard/seo-indexation/IndexationDashboard";

export const metadata: Metadata = {
  title: "CRM — Indexation",
  robots: { index: false, follow: false },
};

export default function SeoIndexationPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/seo" className="text-sm text-muted underline">
          ← SEO-платформа
        </Link>
        <h1 className="mt-3 heading-section text-3xl">Indexation</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted">
          Единый контур indexability → robots → sitemap. Без fake GSC/Yandex data.
        </p>
      </div>
      <IndexationDashboard />
    </div>
  );
}
