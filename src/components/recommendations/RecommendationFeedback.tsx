"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ThumbsDown, ThumbsUp } from "lucide-react";

type RecommendationFeedbackProps = {
  recommendationId: string;
  contentItemId?: string;
  placement?: string;
  sessionId?: string;
  className?: string;
};

export function RecommendationFeedback({
  recommendationId,
  contentItemId,
  placement,
  sessionId,
  className,
}: RecommendationFeedbackProps) {
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");

  async function submit(feedbackType: "helpful" | "not-relevant" | "hide") {
    setStatus("idle");
    try {
      const res = await fetch("/api/recommendations/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          recommendationId,
          contentItemId,
          placement,
          feedbackType,
        }),
      });
      if (!res.ok) throw new Error("feedback failed");
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className={cn("mt-3 flex items-center gap-2", className)}>
      <button
        type="button"
        onClick={() => submit("helpful")}
        className="inline-flex items-center gap-1 rounded-sm border border-graphite/10 px-2 py-1 text-xs text-muted hover:bg-sand/40"
        aria-label="Полезно"
      >
        <ThumbsUp className="h-3.5 w-3.5" aria-hidden />
        Полезно
      </button>
      <button
        type="button"
        onClick={() => submit("not-relevant")}
        className="inline-flex items-center gap-1 rounded-sm border border-graphite/10 px-2 py-1 text-xs text-muted hover:bg-sand/40"
        aria-label="Не релевантно"
      >
        <ThumbsDown className="h-3.5 w-3.5" aria-hidden />
        Не релевантно
      </button>
      {status === "sent" && <span className="text-xs text-muted">Спасибо за отзыв</span>}
      {status === "error" && <span className="text-xs text-muted">Не удалось отправить</span>}
    </div>
  );
}
