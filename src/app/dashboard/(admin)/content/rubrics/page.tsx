import type { Metadata } from "next";
import { editorialRubrics } from "@/data/editorial-rubrics";
import { technicalContentClusters } from "@/data/technical-content-clusters";
import Link from "next/link";

export const metadata: Metadata = {
  title: "CRM — Рубрики и кластеры",
  robots: { index: false, follow: false },
};

export default function ContentRubricsPage() {
  return (
    <div className="space-y-8">
      <div>
        <Link href="/dashboard/content" className="text-sm text-muted underline-offset-4 hover:underline">
          ← Контент CMS
        </Link>
        <h1 className="mt-3 heading-section text-3xl">Рубрики и кластеры</h1>
      </div>

      <section>
        <h2 className="font-display text-lg">Редакционные рубрики</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-graphite/10 text-xs text-muted">
                <th className="py-2 pr-3">Рубрика</th>
                <th className="py-2 pr-3">Priority</th>
                <th className="py-2 pr-3">Default CTA</th>
                <th className="py-2">Lead magnet</th>
              </tr>
            </thead>
            <tbody>
              {editorialRubrics.map((r) => (
                <tr key={r.id} className="border-b border-graphite/5">
                  <td className="py-2 pr-3">{r.title}</td>
                  <td className="py-2 pr-3 text-xs">{r.priority}</td>
                  <td className="py-2 pr-3 text-xs">{r.defaultCTA}</td>
                  <td className="py-2 text-xs">{r.defaultLeadMagnet ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg">Технические кластеры</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-graphite/10 text-xs text-muted">
                <th className="py-2 pr-3">Кластер</th>
                <th className="py-2 pr-3">Category</th>
                <th className="py-2">Expert review</th>
              </tr>
            </thead>
            <tbody>
              {technicalContentClusters.map((c) => (
                <tr key={c.id} className="border-b border-graphite/5">
                  <td className="py-2 pr-3">{c.title}</td>
                  <td className="py-2 pr-3 text-xs">{c.category}</td>
                  <td className="py-2 text-xs">{c.requiresTechnicalReview ? "да" : "нет"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
