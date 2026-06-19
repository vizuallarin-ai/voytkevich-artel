"use client";

import type { KeywordDemandItem } from "@/types/keyword-demand";

type Props = { items: KeywordDemandItem[] };

export function KeywordDemandTable({ items }: Props) {
  if (!items.length) {
    return (
      <p className="text-sm text-muted p-4 border border-dashed rounded-sm">
        Нет keyword data. Импортируйте CSV или добавьте вручную. Heuristic mode активен.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-sm border border-graphite/10">
      <table className="w-full text-left text-sm">
        <thead className="border-b bg-graphite/5 text-xs text-muted">
          <tr>
            <th className="p-3">Keyword</th>
            <th className="p-3">Volume</th>
            <th className="p-3">Region</th>
            <th className="p-3">Source</th>
            <th className="p-3">Intent</th>
            <th className="p-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((k) => (
            <tr key={k.id} className="border-b border-graphite/5">
              <td className="p-3">{k.keyword}</td>
              <td className="p-3 text-muted">
                {k.metrics.searchVolume != null ? k.metrics.searchVolume : "—"}
              </td>
              <td className="p-3 text-xs">{k.region}</td>
              <td className="p-3 text-xs">{k.source}</td>
              <td className="p-3 text-xs">{k.intent}</td>
              <td className="p-3 text-xs">{k.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
