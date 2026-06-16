"use client";

import { useMemo, useState } from "react";
import { getTaxonomyCombinations } from "@/lib/taxonomy/taxonomy-combination-builder";

export function TaxonomyMatrixTable() {
  const all = useMemo(() => getTaxonomyCombinations(), []);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return all.filter((c) => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (levelFilter !== "all" && String(c.level) !== levelFilter) return false;
      return true;
    });
  }, [all, statusFilter, levelFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="heading-section text-3xl">Матрица комбинаций</h1>
        <p className="mt-2 text-sm text-muted">
          Кандидаты SEO-страниц: {filtered.length} из {all.length}. Публикация — только после
          Этапа 20 и human review.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <label className="text-sm">
          Статус{" "}
          <select
            className="ml-1 rounded-sm border border-graphite/15 px-2 py-1"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Все</option>
            <option value="planned">planned</option>
            <option value="needs-keyword-data">needs-keyword-data</option>
            <option value="draft">draft</option>
          </select>
        </label>
        <label className="text-sm">
          Уровень{" "}
          <select
            className="ml-1 rounded-sm border border-graphite/15 px-2 py-1"
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
          >
            <option value="all">Все</option>
            <option value="1">L1</option>
            <option value="2">L2</option>
            <option value="3">L3</option>
          </select>
        </label>
      </div>

      <div className="overflow-x-auto rounded-sm border border-graphite/10">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="border-b border-graphite/10 bg-muted-bg/50 text-xs uppercase text-muted">
            <tr>
              <th className="px-3 py-2">Priority</th>
              <th className="px-3 py-2">URL</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">L</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Index</th>
              <th className="px-3 py-2">Risks</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 200).map((c) => (
              <tr key={c.id} className="border-b border-graphite/5 hover:bg-muted-bg/30">
                <td className="px-3 py-2 font-mono text-xs">{c.priority.publishPriority}</td>
                <td className="max-w-[280px] truncate px-3 py-2" title={c.h1}>
                  <span className="block truncate font-mono text-xs text-muted">{c.url}</span>
                  <span className="block truncate">{c.h1}</span>
                </td>
                <td className="px-3 py-2 text-xs">{c.pageType}</td>
                <td className="px-3 py-2">{c.level}</td>
                <td className="px-3 py-2 text-xs">{c.status}</td>
                <td className="px-3 py-2">{c.indexing.indexable ? "yes" : "no"}</td>
                <td className="px-3 py-2 text-xs text-muted">
                  dup:{c.risks.duplicateRisk} can:{c.risks.cannibalizationRisk}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length > 200 && (
          <p className="p-3 text-xs text-muted">Показаны первые 200 из {filtered.length}</p>
        )}
      </div>
    </div>
  );
}
