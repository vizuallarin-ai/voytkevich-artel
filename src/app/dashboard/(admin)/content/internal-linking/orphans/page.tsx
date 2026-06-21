"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type OrphanRow = {
  contentItemId: string;
  url: string;
  classification: string;
  severity: string;
  priority: string;
  indexability: string;
  recovery: Array<{ id: string; score: number }>;
};

export default function OrphanPagesPage() {
  const [orphans, setOrphans] = useState<OrphanRow[]>([]);

  useEffect(() => {
    fetch("/api/dashboard/internal-linking/orphans")
      .then((r) => r.json())
      .then((data) => setOrphans(data.orphans ?? []));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/content/internal-linking" className="text-sm text-muted underline">
          ← Internal Linking
        </Link>
        <h1 className="mt-3 heading-section text-3xl">Orphan Pages</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted">
          Страницы без входящих ссылок. P1/P2 orphan получают повышенную severity.
        </p>
      </div>

      {orphans.length === 0 ? (
        <p className="text-sm text-muted">Orphan pages не обнаружены или данные загружаются...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-graphite/10 text-left text-xs text-muted">
                <th className="p-2">URL</th>
                <th className="p-2">Classification</th>
                <th className="p-2">Severity</th>
                <th className="p-2">Priority</th>
                <th className="p-2">Recovery options</th>
              </tr>
            </thead>
            <tbody>
              {orphans.slice(0, 50).map((o) => (
                <tr key={o.contentItemId} className="border-b border-graphite/5">
                  <td className="p-2">{o.url}</td>
                  <td className="p-2">{o.classification}</td>
                  <td className="p-2">{o.severity}</td>
                  <td className="p-2">{o.priority}</td>
                  <td className="p-2">{o.recovery.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
