import Link from "next/link";
import { editorialRubrics } from "@/data/editorial-rubrics";
import { editorialAuthors } from "@/data/editorial-authors";
import { editorialContentInitialQueue } from "@/data/editorial-content-initial-queue";
import { getAllEditorialContent } from "@/lib/editorial-content/editorial-page-builder";
import { calculateEditorialContentQualityScore } from "@/lib/editorial-content/editorial-quality-rules";
import { isEditorialContentTeaserReady } from "@/lib/editorial-content/editorial-teaser-readiness";

export function EditorialContentDashboard() {
  const items = getAllEditorialContent();
  const stats = {
    total: items.length,
    indexable: items.filter((i) => i.indexing.indexable).length,
    needsSource: items.filter((i) => i.status === "needs-source").length,
    needsReview: items.filter((i) => i.status === "needs-human-review").length,
    teaserReady: items.filter((i) => isEditorialContentTeaserReady(i)).length,
    fictionalized: items.filter((i) => i.storyMeta.isFictionalized).length,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="heading-section text-3xl">Редакционный блог</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted">
          Этап 22: рубрики, авторские персонажи, story/news/digest шаблоны, initial queue (
          {stats.total} тем). Все материалы noindex до human review и маркировки.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Рубрик" value={editorialRubrics.length} />
        <StatCard label="Авторов" value={editorialAuthors.length} />
        <StatCard label="Тем в очереди" value={stats.total} />
        <StatCard label="Indexable" value={stats.indexable} />
        <StatCard label="Teaser ready" value={stats.teaserReady} />
        <StatCard label="Fiction" value={stats.fictionalized} />
      </div>

      <section className="rounded-sm border border-graphite/10 bg-background p-5">
        <h2 className="font-display text-lg">Очередь материалов</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead>
              <tr className="border-b border-graphite/10 text-xs text-muted">
                <th className="py-2 pr-3">Материал</th>
                <th className="py-2 pr-3">Рубрика</th>
                <th className="py-2 pr-3">Тип</th>
                <th className="py-2 pr-3">Автор</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Quality</th>
                <th className="py-2 pr-3">Fiction</th>
                <th className="py-2">Index</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const q = calculateEditorialContentQualityScore(item);
                return (
                  <tr key={item.id} className="border-b border-graphite/5">
                    <td className="py-2 pr-3">
                      <Link
                        href={item.url}
                        target="_blank"
                        className="underline-offset-4 hover:underline"
                      >
                        {item.title}
                      </Link>
                    </td>
                    <td className="py-2 pr-3 text-xs text-muted">{item.rubricId}</td>
                    <td className="py-2 pr-3 text-xs">{item.type}</td>
                    <td className="py-2 pr-3 text-xs">{item.authorId}</td>
                    <td className="py-2 pr-3 text-xs">{item.status}</td>
                    <td className="py-2 pr-3 text-xs">
                      {q.level} ({q.score})
                    </td>
                    <td className="py-2 pr-3 text-xs">
                      {item.storyMeta.isFictionalized ? "да" : "нет"}
                    </td>
                    <td className="py-2 text-xs">{item.indexing.indexable ? "да" : "noindex"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-muted">
          Очередь: {editorialContentInitialQueue.length} тем · needs-source: {stats.needsSource} ·
          needs-review: {stats.needsReview}
        </p>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-sm border border-graphite/10 bg-background p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 font-display text-2xl">{value}</p>
    </div>
  );
}
