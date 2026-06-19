import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getGenerationOutput } from "@/lib/ai-content-factory/ai-generation-audit-log";
import { AIContentOutputPreview } from "@/components/ai-content-factory/AIContentOutputPreview";
import { AIContentBriefPanel } from "@/components/ai-content-factory/AIContentBriefPanel";
import { AIContentValidationPanel } from "@/components/ai-content-factory/AIContentValidationPanel";
import { AIContentTeaserPreview } from "@/components/ai-content-factory/AIContentTeaserPreview";
import { AIContentSaveToCMSActions } from "@/components/ai-content-factory/AIContentSaveToCMSActions";

type Props = { params: Promise<{ generationId: string }> };

export const metadata: Metadata = {
  title: "CRM — AI генерация",
  robots: { index: false, follow: false },
};

export default async function AIGenerationDetailPage({ params }: Props) {
  const { generationId } = await params;
  const output = getGenerationOutput(generationId);
  if (!output) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/content/generate"
          className="text-sm text-muted underline-offset-4 hover:underline"
        >
          ← AI-генерация
        </Link>
        <h1 className="mt-3 heading-section text-2xl">{output.result.title}</h1>
        <p className="mt-1 text-xs font-mono text-muted">{output.id}</p>
        <p className="text-sm text-muted mt-2">Статус: {output.status}</p>
      </div>
      <AIContentValidationPanel validation={output.validation} />
      <AIContentBriefPanel brief={output.result.brief} />
      <AIContentOutputPreview output={output} />
      <AIContentTeaserPreview teasers={output.result.teasers} />
      <AIContentSaveToCMSActions output={output} />
    </div>
  );
}
