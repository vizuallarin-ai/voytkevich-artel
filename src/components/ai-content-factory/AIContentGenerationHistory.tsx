"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { AIGenerationRecord } from "@/types/ai-generation";

export function AIContentGenerationHistory() {
  const [records, setRecords] = useState<AIGenerationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/ai-content/history")
      .then((r) => r.json())
      .then((data: { records: AIGenerationRecord[] }) => setRecords(data.records ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-sm text-muted">Загрузка истории…</p>;
  }

  if (records.length === 0) {
    return (
      <p className="text-sm text-muted rounded-xl border p-6 text-center">
        Пока нет генераций.{" "}
        <Link href="/dashboard/content/generate" className="text-primary underline">
          Создать первую
        </Link>
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full text-sm">
        <thead className="bg-muted-bg text-left text-xs uppercase text-muted">
          <tr>
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">Режим</th>
            <th className="px-4 py-3">Тема</th>
            <th className="px-4 py-3">Статус</th>
            <th className="px-4 py-3">Quality</th>
            <th className="px-4 py-3">W/B</th>
            <th className="px-4 py-3">CMS</th>
            <th className="px-4 py-3">Дата</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.id} className="border-t hover:bg-muted-bg/50">
              <td className="px-4 py-3">
                <Link
                  href={`/dashboard/content/generate/${r.id}`}
                  className="text-primary underline-offset-4 hover:underline font-mono text-xs"
                >
                  {r.id.slice(0, 12)}…
                </Link>
              </td>
              <td className="px-4 py-3 text-xs">{r.mode}</td>
              <td className="px-4 py-3 max-w-[200px] truncate">{r.topic}</td>
              <td className="px-4 py-3">{r.status}</td>
              <td className="px-4 py-3">{r.validationLevel ?? "—"}</td>
              <td className="px-4 py-3 text-xs">
                {r.warningsCount}/{r.blockersCount}
              </td>
              <td className="px-4 py-3">
                {r.savedContentId ? (
                  <Link
                    href={`/dashboard/content/items/${r.savedContentId}`}
                    className="text-primary text-xs underline"
                  >
                    открыть
                  </Link>
                ) : (
                  "—"
                )}
              </td>
              <td className="px-4 py-3 text-xs text-muted whitespace-nowrap">
                {new Date(r.createdAt).toLocaleString("ru-RU")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
