"use client";

import { useEffect } from "react";
import { trackAIGenerationHistoryOpened } from "@/lib/ai-content-factory/ai-content-analytics";

export function AIGenerationHistoryTracker() {
  useEffect(() => {
    trackAIGenerationHistoryOpened({ page: "ai-history" });
  }, []);
  return null;
}
