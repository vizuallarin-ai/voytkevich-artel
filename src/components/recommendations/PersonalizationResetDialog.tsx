"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

type PersonalizationResetDialogProps = {
  open: boolean;
  sessionId?: string;
  onClose: () => void;
  onReset: () => void;
};

export function PersonalizationResetDialog({
  open,
  sessionId,
  onClose,
  onReset,
}: PersonalizationResetDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  if (!open) return null;

  async function confirmReset() {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/recommendations/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      if (!res.ok) throw new Error("reset failed");
      onReset();
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-graphite/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-dialog-title"
    >
      <div className="w-full max-w-md rounded-sm border border-graphite/10 bg-background p-6 shadow-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-muted" aria-hidden />
          <div>
            <h2 id="reset-dialog-title" className="heading-section text-xl">
              Сбросить персонализацию?
            </h2>
            <p className="mt-2 text-sm text-muted">
              Будут удалены сохранённые предпочтения и история рекомендаций для этой сессии.
            </p>
          </div>
        </div>

        {error && (
          <p className="mt-3 text-sm text-muted">Не удалось выполнить сброс. Попробуйте позже.</p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-sm border border-graphite/20 px-4 py-2 text-sm hover:bg-sand/40"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={confirmReset}
            disabled={loading}
            className={cn(
              "rounded-sm border border-graphite/20 px-4 py-2 text-sm hover:bg-sand/40",
              loading && "opacity-60",
            )}
          >
            {loading ? "Сброс…" : "Сбросить"}
          </button>
        </div>
      </div>
    </div>
  );
}
