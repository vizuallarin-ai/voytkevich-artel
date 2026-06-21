"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NavigationAssistant } from "@/components/search/NavigationAssistant";
import type { SearchResponse } from "@/types/search-result";

const TYPE_LABELS: Record<string, string> = {
  service: "Услуга",
  project: "Проект",
  programmatic: "Страница",
  technical: "Статья",
  editorial: "Блог",
  location: "Локация",
  faq: "FAQ",
  other: "Материал",
};

export function SearchPageClient() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQ);
  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAssistant, setShowAssistant] = useState(false);

  const runSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error("Search failed");
      const json = (await res.json()) as SearchResponse;
      setData(json);
      window.history.replaceState(null, "", `/search?q=${encodeURIComponent(q)}`);
    } catch {
      setError("Не удалось выполнить поиск. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialQ) runSearch(initialQ);
  }, [initialQ, runSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch(query);
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Проекты, технологии, локации, статьи..."
          aria-label="Поисковый запрос"
          className="flex-1"
          autoFocus
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Поиск..." : "Найти"}
        </Button>
      </form>

      {data?.correction && data.correction !== data.normalizedQuery && (
        <p className="text-sm text-muted">
          Показаны результаты для «{data.correction}»
        </p>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {data?.zeroResult && (
        <div className="rounded-sm border border-graphite/10 p-6 space-y-4">
          <p className="font-medium">Точных результатов не найдено</p>
          <p className="text-sm text-muted">
            Попробуйте изменить запрос, убрать фильтры или задайте вопрос AI-помощнику.
          </p>
          {data.relatedQueries.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {data.relatedQueries.map((q) => (
                <button
                  key={q}
                  type="button"
                  className="rounded-full border border-graphite/15 px-3 py-1 text-xs hover:bg-muted-bg"
                  onClick={() => {
                    setQuery(q);
                    runSearch(q);
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}
          <Button type="button" variant="outline" onClick={() => setShowAssistant(true)}>
            Спросить AI-помощника
          </Button>
        </div>
      )}

      {data && !data.zeroResult && (
        <p className="text-sm text-muted">
          Найдено: {data.total} · {data.latencyMs} мс
        </p>
      )}

      <ul className="space-y-4">
        {data?.results.map((result) => (
          <li key={result.documentId} className="rounded-sm border border-graphite/10 p-4">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
              <span>{TYPE_LABELS[result.type] ?? result.type}</span>
              {result.confidence && <span>· {result.confidence}</span>}
            </div>
            <Link href={result.canonicalUrl} className="mt-1 block font-semibold hover:text-primary">
              {result.title}
            </Link>
            {result.description && (
              <p className="mt-1 text-sm text-muted">{result.description}</p>
            )}
            <p className="mt-2 text-sm">{result.snippet}</p>
          </li>
        ))}
      </ul>

      <section className="border-t border-graphite/10 pt-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-xl">AI-помощник</h2>
          <Button type="button" variant="outline" size="sm" onClick={() => setShowAssistant((v) => !v)}>
            {showAssistant ? "Скрыть" : "Открыть"}
          </Button>
        </div>
        {showAssistant && (
          <div className="mt-4">
            <NavigationAssistant initialQuery={query} />
          </div>
        )}
      </section>
    </div>
  );
}
