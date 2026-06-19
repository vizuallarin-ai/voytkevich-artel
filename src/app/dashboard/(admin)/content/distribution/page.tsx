import type { Metadata } from "next";
import Link from "next/link";
import { DistributionDashboard } from "@/components/content-distribution/DistributionDashboard";

export const metadata: Metadata = {
  title: "CRM — Дистрибуция контента",
  robots: { index: false, follow: false },
};

export default function DistributionPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/content" className="text-sm text-muted underline-offset-4 hover:underline">
          ← Контент CMS
        </Link>
        <h1 className="mt-3 heading-section text-3xl">Внешняя дистрибуция</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted">
          Teaser-версии на внешние площадки с UTM. Полная статья остаётся на stroistroy.ru.
        </p>
      </div>
      <DistributionDashboard />
    </div>
  );
}
