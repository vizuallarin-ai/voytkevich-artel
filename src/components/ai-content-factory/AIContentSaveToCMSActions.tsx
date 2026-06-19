"use client";

import { useState } from "react";
import Link from "next/link";
import type { AIContentGenerationOutput } from "@/types/ai-content-factory";
import { Button } from "@/components/ui/button";

type Props = {
  output: AIContentGenerationOutput;
  onDiscard?: () => void;
  onSaved?: (contentId: string) => void;
};

export function AIContentSaveToCMSActions({ output, onDiscard, onSaved }: Props) {
  const [loading, setLoading] = useState<"save" | "review" | "discard" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [contentId, setContentId] = useState(output.cms.savedContentId);

  async function handleSave() {
    setLoading("save");
    setError(null);
    try {
      const res = await fetch(`/api/dashboard/ai-content/${output.id}/save`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Ошибка сохранения");
      setContentId(data.itemId);
      onSaved?.(data.itemId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setLoading(null);
    }
  }

  async function handleReview() {
    setLoading("review");
    setError(null);
    try {
      const res = await fetch(`/api/dashboard/ai-content/${output.id}/review`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Ошибка review");
      setContentId(data.itemId);
      onSaved?.(data.itemId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setLoading(null);
    }
  }

  async function handleDiscard() {
    setLoading("discard");
    setError(null);
    try {
      await fetch(`/api/dashboard/ai-content/${output.id}/discard`, { method: "POST" });
      onDiscard?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setLoading(null);
    }
  }

  function copyOutput() {
    void navigator.clipboard.writeText(JSON.stringify(output.result, null, 2));
  }

  function copyBrief() {
    if (output.result.brief) {
      void navigator.clipboard.writeText(JSON.stringify(output.result.brief, null, 2));
    }
  }

  const canSave = output.validation.canSaveToCMS && !contentId;
  const canReview = output.validation.canSendToReview;

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <h3 className="font-semibold">Действия</h3>
      <p className="text-xs text-muted">
        Статус после сохранения: <strong>ai-generated</strong>. Кнопок Publish/Approve нет.
      </p>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {contentId && (
        <p className="text-sm">
          CMS item:{" "}
          <Link
            href={`/dashboard/content/items/${contentId}`}
            className="text-primary underline-offset-4 hover:underline"
          >
            {contentId}
          </Link>
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          disabled={!canSave || loading !== null}
          onClick={handleSave}
        >
          {loading === "save" ? "Сохранение…" : "Сохранить как ai-generated"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={!canReview || loading !== null}
          onClick={handleReview}
        >
          {loading === "review" ? "Отправка…" : "Отправить на review"}
        </Button>
        <Button type="button" variant="outline" onClick={copyOutput}>
          Копировать output
        </Button>
        {output.result.brief && (
          <Button type="button" variant="outline" onClick={copyBrief}>
            Копировать brief
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          disabled={loading !== null}
          onClick={handleDiscard}
        >
          Отклонить
        </Button>
      </div>
    </div>
  );
}
