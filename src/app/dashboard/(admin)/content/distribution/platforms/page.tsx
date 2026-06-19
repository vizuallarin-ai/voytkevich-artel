import type { Metadata } from "next";
import Link from "next/link";
import { externalContentPlatforms } from "@/data/external-content-platforms";
import { PlatformRegistryTable } from "@/components/content-distribution/PlatformRegistryTable";
import { isAdapterActive } from "@/lib/content-distribution/platform-adapters";

export const metadata: Metadata = {
  title: "CRM — Площадки дистрибуции",
  robots: { index: false, follow: false },
};

export default function PlatformsPage() {
  const platforms = externalContentPlatforms.map((p) => ({
    ...p,
    adapterActive: isAdapterActive(p.id),
  }));

  return (
    <div className="space-y-6">
      <Link href="/dashboard/content/distribution" className="text-sm text-muted underline">
        ← Дистрибуция
      </Link>
      <h1 className="heading-section text-3xl">Площадки</h1>
      <p className="text-sm text-muted max-w-3xl">
        active — можно auto-publish (RSS, manual-export, env). manual — только ручной экспорт. needs-api —
        требуется настройка env.
      </p>
      <PlatformRegistryTable platforms={platforms} />
    </div>
  );
}
