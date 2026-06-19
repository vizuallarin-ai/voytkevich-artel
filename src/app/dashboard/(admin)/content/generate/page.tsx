import type { Metadata } from "next";
import Link from "next/link";
import { AIContentGenerateForm } from "@/components/ai-content-factory/AIContentGenerateForm";

export const metadata: Metadata = {
  title: "CRM — AI-генерация контента",
  robots: { index: false, follow: false },
};

export default function AIContentGeneratePage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/content"
          className="text-sm text-muted underline-offset-4 hover:underline"
        >
          ← Контент CMS
        </Link>
        <h1 className="mt-3 heading-section text-3xl">AI-контент-завод</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted">
          Генерация черновиков для SEO-материалов. Сохранение только как{" "}
          <strong>ai-generated</strong> — без автопубликации и approve.
        </p>
        <Link
          href="/dashboard/content/ai-history"
          className="mt-2 inline-block text-sm text-primary underline-offset-4 hover:underline"
        >
          История генераций →
        </Link>
      </div>
      <AIContentGenerateForm />
    </div>
  );
}
