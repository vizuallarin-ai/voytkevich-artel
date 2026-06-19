import type { Metadata } from "next";
import Link from "next/link";
import { visualTemplateRegistry } from "@/data/visual-template-registry";
import { VisualTemplatePreview } from "@/components/visual-content/VisualTemplatePreview";

export const metadata: Metadata = {
  title: "CRM — Visual templates",
  robots: { index: false, follow: false },
};

export default function VisualTemplatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/content/visuals" className="text-sm text-muted underline-offset-4 hover:underline">
          ← Visual assets
        </Link>
        <h1 className="mt-3 heading-section text-3xl">Visual templates</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted">
          Реестр шаблонов обложек для сайта, OG и внешних площадок. Текст накладывается программно.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {visualTemplateRegistry.map((template) => (
          <div key={template.id} className="space-y-3">
            <div className="rounded-sm border border-graphite/10 p-4">
              <h2 className="font-medium">{template.title}</h2>
              <p className="text-xs text-muted mt-1">
                {template.id} · {template.usage} · {template.aspectRatio}
              </p>
              <p className="text-xs mt-2">
                Text overlay: {template.supportsTextOverlay ? "yes" : "no"}
              </p>
              <ul className="mt-2 text-xs text-muted list-disc pl-4">
                {template.visualRules.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
            <VisualTemplatePreview template={template} />
          </div>
        ))}
      </div>
    </div>
  );
}
