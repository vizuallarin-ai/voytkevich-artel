"use client";

import { getSortedProgrammaticQueue } from "@/data/programmatic-seo-initial-queue";
import { calculatePublishingPriority, explainPublishingPriority } from "@/lib/seo/publishing-priority";
import { calculateContentQualityScore } from "@/lib/seo/content-quality-rules";

export function SeoRoadmapTable() {
  const queue = getSortedProgrammaticQueue();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="heading-section text-3xl">SEO-очередь</h1>
        <p className="mt-2 text-sm text-muted">
          {queue.length} страниц · сортировка по publish priority · все noindex до review
        </p>
      </div>

      <div className="overflow-x-auto rounded-sm border border-graphite/10">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="border-b border-graphite/10 bg-sand/50 text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-3 py-2">Priority</th>
              <th className="px-3 py-2">Страница</th>
              <th className="px-3 py-2">Тип</th>
              <th className="px-3 py-2">Кластер</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Quality</th>
              <th className="px-3 py-2">Index</th>
            </tr>
          </thead>
          <tbody>
            {queue.map((page) => {
              const tier = calculatePublishingPriority(page);
              const quality = calculateContentQualityScore(page);
              return (
                <tr key={page.id} className="border-b border-graphite/5 hover:bg-sand/30">
                  <td className="px-3 py-2 font-medium">{tier}</td>
                  <td className="px-3 py-2">
                    <p className="font-medium">{page.title}</p>
                    <p className="text-xs text-muted">{page.url}</p>
                    <p className="mt-1 text-xs text-muted">{page.targetKeyword}</p>
                  </td>
                  <td className="px-3 py-2 text-muted">{page.pageType}</td>
                  <td className="px-3 py-2 text-muted">{page.clusterId}</td>
                  <td className="px-3 py-2">{page.status}</td>
                  <td className="px-3 py-2">
                    <span title={quality.blockers.join("; ")}>{quality.level}</span>
                  </td>
                  <td className="px-3 py-2">{page.indexing.indexable ? "yes" : "no"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <details className="rounded-sm border border-graphite/10 bg-background p-4 text-sm">
        <summary className="cursor-pointer font-medium">Пример explainPublishingPriority (первая страница)</summary>
        <ul className="mt-3 list-inside list-disc space-y-1 text-muted">
          {queue[0] ? explainPublishingPriority(queue[0]).map((line) => <li key={line}>{line}</li>) : null}
        </ul>
      </details>
    </div>
  );
}
