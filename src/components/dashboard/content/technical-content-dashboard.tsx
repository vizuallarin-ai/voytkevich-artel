import Link from "next/link";
import { technicalContentClusters } from "@/data/technical-content-clusters";
import { technicalContentInitialQueue } from "@/data/technical-content-initial-queue";
import { technicalArticleTemplates } from "@/data/technical-article-templates";
import { getAllTechnicalArticles } from "@/lib/technical-content/technical-page-builder";
import { calculateTechnicalContentQualityScore } from "@/lib/technical-content/technical-quality-rules";

export function TechnicalContentDashboard() {
  const articles = getAllTechnicalArticles();
  const stats = {
    total: articles.length,
    indexable: articles.filter((a) => a.indexing.indexable).length,
    needsExpert: articles.filter((a) => a.status === "needs-expert-review").length,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="heading-section text-3xl">Техническая база знаний</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted">
          Этап 21: кластеры, шаблоны how-to, initial queue ({stats.total} тем). Все материалы noindex
          до expert review и approval.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-sm border border-graphite/10 bg-background p-4">
          <p className="text-xs text-muted">Кластеров</p>
          <p className="mt-1 font-display text-2xl">{technicalContentClusters.length}</p>
        </div>
        <div className="rounded-sm border border-graphite/10 bg-background p-4">
          <p className="text-xs text-muted">Шаблонов</p>
          <p className="mt-1 font-display text-2xl">{technicalArticleTemplates.length}</p>
        </div>
        <div className="rounded-sm border border-graphite/10 bg-background p-4">
          <p className="text-xs text-muted">Тем в очереди</p>
          <p className="mt-1 font-display text-2xl">{stats.total}</p>
        </div>
        <div className="rounded-sm border border-graphite/10 bg-background p-4">
          <p className="text-xs text-muted">Indexable</p>
          <p className="mt-1 font-display text-2xl">{stats.indexable}</p>
        </div>
      </div>

      <section className="rounded-sm border border-graphite/10 bg-background p-5">
        <h2 className="font-display text-lg">Очередь статей</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-graphite/10 text-xs text-muted">
                <th className="py-2 pr-3">Статья</th>
                <th className="py-2 pr-3">Кластер</th>
                <th className="py-2 pr-3">Тип</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Quality</th>
                <th className="py-2">Index</th>
              </tr>
            </thead>
            <tbody>
              {articles.slice(0, 25).map((a) => {
                const q = calculateTechnicalContentQualityScore(a);
                return (
                  <tr key={a.id} className="border-b border-graphite/5">
                    <td className="py-2 pr-3">
                      <Link
                        href={a.url}
                        target="_blank"
                        className="underline-offset-4 hover:underline"
                      >
                        {a.title}
                      </Link>
                    </td>
                    <td className="py-2 pr-3 text-xs text-muted">{a.clusterId}</td>
                    <td className="py-2 pr-3 text-xs">{a.type}</td>
                    <td className="py-2 pr-3 text-xs">{a.status}</td>
                    <td className="py-2 pr-3 text-xs">
                      {q.level} ({q.score})
                    </td>
                    <td className="py-2 text-xs">{a.indexing.indexable ? "да" : "noindex"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
