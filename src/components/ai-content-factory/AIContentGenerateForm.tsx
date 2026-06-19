"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { AIContentGenerationMode, AIContentGenerationOutput } from "@/types/ai-content-factory";
import { AIContentModeSelector } from "@/components/ai-content-factory/AIContentModeSelector";
import { AIContentOutputPreview } from "@/components/ai-content-factory/AIContentOutputPreview";
import { AIContentBriefPanel } from "@/components/ai-content-factory/AIContentBriefPanel";
import { AIContentValidationPanel } from "@/components/ai-content-factory/AIContentValidationPanel";
import { AIContentTeaserPreview } from "@/components/ai-content-factory/AIContentTeaserPreview";
import { AIContentSaveToCMSActions } from "@/components/ai-content-factory/AIContentSaveToCMSActions";
import { Button } from "@/components/ui/button";
import { getGenerationModeMeta } from "@/data/ai-content-generation-modes";
import { trackAIContentGenerateOpened } from "@/lib/ai-content-factory/ai-content-analytics";

export function AIContentGenerateForm() {
  const [mode, setMode] = useState<AIContentGenerationMode>("content-brief");
  const [topic, setTopic] = useState("");
  const [targetKeyword, setTargetKeyword] = useState("");
  const [secondaryKeywords, setSecondaryKeywords] = useState("");
  const [additionalContext, setAdditionalContext] = useState("");
  const [sourceUrls, setSourceUrls] = useState("");
  const [sourceNotes, setSourceNotes] = useState("");
  const [requiresDisclaimer, setRequiresDisclaimer] = useState(true);
  const [requiresFactCheck, setRequiresFactCheck] = useState(false);
  const [requiresExpertReview, setRequiresExpertReview] = useState(false);
  const [allowFictionalizedStory, setAllowFictionalizedStory] = useState(false);
  const [allowExternalTeasers, setAllowExternalTeasers] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState<AIContentGenerationOutput | null>(null);
  const [providerInfo, setProviderInfo] = useState<string>("");

  useEffect(() => {
    trackAIContentGenerateOpened({ page: "generate" });
    fetch("/api/dashboard/ai-content/provider")
      .then((r) => r.json())
      .then((d: { message: string; label: string }) =>
        setProviderInfo(`${d.label}: ${d.message}`),
      );
  }, []);

  const modeMeta = getGenerationModeMeta(mode);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!topic.trim()) {
      setError("Укажите тему");
      return;
    }
    setLoading(true);
    setError(null);
    setOutput(null);

    try {
      const res = await fetch("/api/dashboard/ai-content/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          input: {
            topic: topic.trim(),
            targetKeyword: targetKeyword.trim() || undefined,
            secondaryKeywords: secondaryKeywords
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
            sourceUrls: sourceUrls
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean),
            sourceNotes: sourceNotes.trim() || undefined,
            additionalContext: additionalContext.trim() || undefined,
          },
          constraints: {
            requiresDisclaimer,
            requiresFactCheck,
            requiresExpertReview,
            allowFictionalizedStory,
            allowExternalTeasers,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Ошибка генерации");
      setOutput(data.output as AIContentGenerationOutput);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {providerInfo && (
        <p className="rounded-lg bg-muted-bg px-4 py-2 text-xs text-muted">{providerInfo}</p>
      )}

      <section className="space-y-3">
        <h2 className="font-semibold">Режим генерации</h2>
        <AIContentModeSelector value={mode} onChange={setMode} />
      </section>

      <form onSubmit={handleGenerate} className="space-y-6 rounded-xl border bg-card p-6">
        <h2 className="font-semibold">Входные данные</h2>

        <label className="block space-y-1">
          <span className="text-sm font-medium">Тема *</span>
          <input
            className="w-full rounded-lg border px-3 py-2 text-sm"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Например: Каркасный дом 8×10 в Иркутске"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1">
            <span className="text-sm font-medium">Целевой ключ</span>
            <input
              className="w-full rounded-lg border px-3 py-2 text-sm"
              value={targetKeyword}
              onChange={(e) => setTargetKeyword(e.target.value)}
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium">Доп. ключи (через запятую)</span>
            <input
              className="w-full rounded-lg border px-3 py-2 text-sm"
              value={secondaryKeywords}
              onChange={(e) => setSecondaryKeywords(e.target.value)}
            />
          </label>
        </div>

        {modeMeta?.requiresSource && (
          <>
            <label className="block space-y-1">
              <span className="text-sm font-medium">Source URLs (по одному на строку) *</span>
              <textarea
                className="w-full rounded-lg border px-3 py-2 text-sm min-h-[80px]"
                value={sourceUrls}
                onChange={(e) => setSourceUrls(e.target.value)}
              />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-medium">Заметки к источникам</span>
              <textarea
                className="w-full rounded-lg border px-3 py-2 text-sm min-h-[60px]"
                value={sourceNotes}
                onChange={(e) => setSourceNotes(e.target.value)}
              />
            </label>
          </>
        )}

        <label className="block space-y-1">
          <span className="text-sm font-medium">Дополнительный контекст</span>
          <textarea
            className="w-full rounded-lg border px-3 py-2 text-sm min-h-[80px]"
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value)}
          />
        </label>

        <fieldset className="grid gap-2 sm:grid-cols-2 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={requiresDisclaimer}
              onChange={(e) => setRequiresDisclaimer(e.target.checked)}
            />
            Требуется дисклеймер
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={requiresFactCheck}
              onChange={(e) => setRequiresFactCheck(e.target.checked)}
            />
            Требуется fact-check
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={requiresExpertReview}
              onChange={(e) => setRequiresExpertReview(e.target.checked)}
            />
            Требуется expert review
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={allowFictionalizedStory}
              onChange={(e) => setAllowFictionalizedStory(e.target.checked)}
            />
            Допустима вымышленная история
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={allowExternalTeasers}
              onChange={(e) => setAllowExternalTeasers(e.target.checked)}
            />
            Разрешить external teasers
          </label>
        </fieldset>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" disabled={loading}>
          {loading ? "Генерация…" : "Сгенерировать черновик"}
        </Button>
      </form>

      {output && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">Результат</h2>
            <Link
              href={`/dashboard/content/generate/${output.id}`}
              className="text-sm text-primary underline"
            >
              Открыть детально
            </Link>
          </div>
          <AIContentValidationPanel validation={output.validation} />
          <AIContentBriefPanel brief={output.result.brief} />
          <AIContentOutputPreview output={output} />
          <AIContentTeaserPreview teasers={output.result.teasers} />
          <AIContentSaveToCMSActions output={output} onDiscard={() => setOutput(null)} />
          {output.usage && (
            <p className="text-xs text-muted">
              {output.usage.provider} / {output.usage.model} — tokens in{" "}
              {output.usage.inputTokens ?? 0} out {output.usage.outputTokens ?? 0}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
