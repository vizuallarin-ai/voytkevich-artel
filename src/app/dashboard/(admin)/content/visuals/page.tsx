import type { Metadata } from "next";
import Link from "next/link";
import { VisualAssetsDashboard } from "@/components/visual-content/VisualAssetsDashboard";

export const metadata: Metadata = {
  title: "CRM — Visual assets",
  robots: { index: false, follow: false },
};

export default function VisualsPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/content" className="text-sm text-muted underline-offset-4 hover:underline">
          ← Контент CMS
        </Link>
        <h1 className="mt-3 heading-section text-3xl">Visual assets</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted">
          Единый визуальный стиль, шаблоны обложек, prompt builder и registry для SEO-контента и teaser-публикаций.
        </p>
      </div>
      <VisualAssetsDashboard />
    </div>
  );
}
