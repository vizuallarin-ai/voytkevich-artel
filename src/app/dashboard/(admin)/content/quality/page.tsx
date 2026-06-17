import type { Metadata } from "next";
import Link from "next/link";
import { contentService } from "@/lib/content-cms/content-service";
import { ContentQualityBadge } from "@/components/content-cms/ContentQualityBadge";

export const metadata: Metadata = {
  title: "CRM — Quality",
  robots: { index: false, follow: false },
};

export default async function ContentQualityPage() {
  const items = await contentService.list({ hasBlockers: true });
  const warnings = await contentService.list({ hasWarnings: true });
  const poor = await contentService.list({ qualityLevel: ["poor"] });

  const issues = [
    ...items.map((i) => ({
      item: i,
      type: "blocker",
      severity: "high" as const,
      message: i.quality.blockers[0] ?? "Blockers",
    })),
    ...poor
      .filter((i) => !i.quality.blockers.length)
      .map((i) => ({
        item: i,
        type: "poor-quality",
        severity: "high" as const,
        message: "Poor quality score",
      })),
    ...warnings
      .filter((i) => i.quality.level !== "poor" && !i.quality.blockers.length)
      .slice(0, 20)
      .map((i) => ({
        item: i,
        type: "warning",
        severity: "medium" as const,
        message: i.quality.warnings[0] ?? "Warnings",
      })),
  ];

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/content" className="text-sm text-muted underline-offset-4 hover:underline">
          ← Контент CMS
        </Link>
        <h1 className="mt-3 heading-section text-3xl">Quality dashboard</h1>
        <p className="mt-2 text-sm text-muted">Blockers, warnings и риски качества контента.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-graphite/10 text-xs text-muted">
              <th className="py-2 pr-3">Материал</th>
              <th className="py-2 pr-3">Issue</th>
              <th className="py-2 pr-3">Severity</th>
              <th className="py-2">Quality</th>
            </tr>
          </thead>
          <tbody>
            {issues.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-muted">
                  Quality issues не обнаружены в текущей очереди.
                </td>
              </tr>
            ) : (
              issues.map(({ item, type, severity, message }) => (
                <tr key={`${item.id}-${type}`} className="border-b border-graphite/5">
                  <td className="py-2 pr-3">
                    <Link
                      href={`/dashboard/content/items/${encodeURIComponent(item.id)}`}
                      className="underline-offset-4 hover:underline"
                    >
                      {item.title}
                    </Link>
                  </td>
                  <td className="py-2 pr-3 text-xs">{message}</td>
                  <td className="py-2 pr-3 text-xs">{severity}</td>
                  <td className="py-2">
                    <ContentQualityBadge level={item.quality.level} score={item.quality.score} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
