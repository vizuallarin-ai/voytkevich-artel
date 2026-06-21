"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { NavigationAssistantAnswer } from "@/types/ai-navigation";

type Props = {
  initialQuery?: string;
};

export function NavigationAssistant({ initialQuery = "" }: Props) {
  const [sessionId] = useState(() => crypto.randomUUID());
  const [query, setQuery] = useState(initialQuery);
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [answer, setAnswer] = useState<NavigationAssistantAnswer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);

    const userMessage = { role: "user" as const, content: query };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);

    try {
      const res = await fetch("/api/search/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, query, messages: nextMessages }),
      });
      if (!res.ok) throw new Error("Assistant unavailable");
      const data = (await res.json()) as NavigationAssistantAnswer & { sessionId: string };
      setAnswer(data);
      setMessages((prev) => [...prev, { role: "assistant", content: data.answer }]);
      setQuery("");
    } catch {
      setError("Помощник временно недоступен. Используйте обычный поиск.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-sm border border-graphite/10 bg-muted-bg/30 p-4 space-y-4">
      <p className="text-xs text-muted">
        Ответы только на основе опубликованных материалов сайта. Без точных смет и инженерных заключений.
      </p>

      {messages.length > 0 && (
        <ul className="space-y-3 max-h-64 overflow-y-auto text-sm">
          {messages.map((m, i) => (
            <li key={i} className={m.role === "user" ? "text-right" : ""}>
              <span
                className={
                  m.role === "user"
                    ? "inline-block rounded-sm bg-primary/10 px-3 py-2"
                    : "inline-block rounded-sm bg-background px-3 py-2 border border-graphite/10"
                }
              >
                {m.content}
              </span>
            </li>
          ))}
        </ul>
      )}

      {answer && (
        <div className="space-y-3 text-sm">
          {answer.limitations.length > 0 && (
            <p className="text-xs text-muted">{answer.limitations.join(" ")}</p>
          )}
          {answer.citations.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted mb-1">Источники:</p>
              <ul className="space-y-1">
                {answer.citations.map((c) => (
                  <li key={c.sourceId}>
                    <Link href={c.canonicalUrl} className="text-primary underline text-xs">
                      {c.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {answer.suggestedActions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {answer.suggestedActions.map((action, i) => (
                action.url ? (
                  <Button key={i} asChild size="sm" variant="outline">
                    <Link href={action.url}>{action.title}</Link>
                  </Button>
                ) : (
                  <Button key={i} size="sm" variant="outline" type="button">
                    {action.title}
                  </Button>
                )
              ))}
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleAsk} className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Задайте вопрос о строительстве..."
          aria-label="Вопрос AI-помощнику"
        />
        <Button type="submit" disabled={loading}>
          {loading ? "..." : "Спросить"}
        </Button>
      </form>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
