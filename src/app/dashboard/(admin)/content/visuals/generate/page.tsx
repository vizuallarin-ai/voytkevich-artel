import type { Metadata } from "next";
import Link from "next/link";
import { ImageGenerateForm } from "@/components/visual-content/ImageGenerateForm";

export const metadata: Metadata = {
  title: "CRM — Image generation",
  robots: { index: false, follow: false },
};

export default function VisualGeneratePage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/content/visuals" className="text-sm text-muted underline-offset-4 hover:underline">
          ← Visual assets
        </Link>
        <h1 className="mt-3 heading-section text-3xl">Image generation workspace</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted">
          Prompt builder, safety checklist и сохранение visual asset в review. Без auto-publish.
        </p>
      </div>
      <ImageGenerateForm />
    </div>
  );
}
