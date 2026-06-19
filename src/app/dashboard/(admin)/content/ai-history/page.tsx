import type { Metadata } from "next";
import Link from "next/link";
import { AIContentGenerationHistory } from "@/components/ai-content-factory/AIContentGenerationHistory";
import { AIGenerationHistoryTracker } from "@/components/ai-content-factory/AIGenerationHistoryTracker";

export const metadata: Metadata = {
  title: "CRM — История AI-генераций",
  robots: { index: false, follow: false },
};

export default function AIHistoryPage() {
  return (
    <div className="space-y-6">
      <AIGenerationHistoryTracker />
      <div>
        <Link
          href="/dashboard/content/generate"
          className="text-sm text-muted underline-offset-4 hover:underline"
        >
          ← AI-генерация
        </Link>
        <h1 className="mt-3 heading-section text-3xl">История AI-генераций</h1>
        <p className="mt-2 text-sm text-muted">
          Лог генераций, validation level, blockers и связь с CMS items.
        </p>
      </div>
      <AIContentGenerationHistory />
    </div>
  );
}
