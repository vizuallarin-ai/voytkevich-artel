"use client";

import type { SemanticCluster } from "@/types/semantic-clusters";

type Props = { clusters: SemanticCluster[] };

export function SemanticClusterTable({ clusters }: Props) {
  return (
    <div className="overflow-x-auto rounded-sm border border-graphite/10">
      <table className="w-full text-left text-sm">
        <thead className="border-b bg-graphite/5 text-xs text-muted">
          <tr>
            <th className="p-3">Cluster</th>
            <th className="p-3">Type</th>
            <th className="p-3">Keywords</th>
            <th className="p-3">Demand</th>
            <th className="p-3">Data</th>
            <th className="p-3">Priority</th>
          </tr>
        </thead>
        <tbody>
          {clusters.map((c) => (
            <tr key={c.id} className="border-b border-graphite/5 align-top">
              <td className="p-3">
                <p className="font-medium">{c.title}</p>
                <p className="text-xs text-muted">{c.id}</p>
              </td>
              <td className="p-3 text-xs">{c.clusterType}</td>
              <td className="p-3 text-xs">{c.keywords.length}</td>
              <td className="p-3 text-xs">{c.demand.demandLevel}</td>
              <td className="p-3 text-xs">{c.demand.dataCompleteness}</td>
              <td className="p-3 text-xs">
                <span className="font-medium">{c.priority.level}</span>
                {c.priority.confidence === "low" && "*"}
                <span className="text-muted ml-1">({c.priority.score})</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
