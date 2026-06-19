"use client";

import type { AIContentGenerationMode } from "@/types/ai-content-factory";
import { AI_CONTENT_GENERATION_MODES } from "@/data/ai-content-generation-modes";
import { cn } from "@/lib/utils";

type Props = {
  value: AIContentGenerationMode;
  onChange: (mode: AIContentGenerationMode) => void;
};

export function AIContentModeSelector({ value, onChange }: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {AI_CONTENT_GENERATION_MODES.map((mode) => (
        <button
          key={mode.id}
          type="button"
          onClick={() => onChange(mode.id)}
          className={cn(
            "rounded-xl border p-4 text-left transition-colors duration-200",
            value === mode.id
              ? "border-primary bg-primary/5 ring-2 ring-primary/20"
              : "border-border bg-card hover:border-primary/40",
          )}
        >
          <p className="font-medium text-foreground">{mode.label}</p>
          <p className="mt-1 text-xs text-muted">{mode.description}</p>
          {mode.requiresSource && (
            <span className="mt-2 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">
              Нужен источник
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
