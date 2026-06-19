import type { Metadata } from "next";
import Link from "next/link";
import { VisualAssetDetail } from "@/components/visual-content/VisualAssetDetail";

export const metadata: Metadata = {
  title: "CRM — Visual asset",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ imageId: string }> };

export default async function VisualAssetPage({ params }: Props) {
  const { imageId } = await params;
  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/content/visuals" className="text-sm text-muted underline-offset-4 hover:underline">
          ← Visual assets
        </Link>
        <h1 className="mt-3 heading-section text-3xl">Visual asset</h1>
        <p className="mt-2 text-sm text-muted font-mono">{imageId}</p>
      </div>
      <VisualAssetDetail />
    </div>
  );
}
