"use client";

import type { VisualAspectRatio } from "@/types/visual-content";
import { buildFormatVariant } from "@/lib/visual-content/image-format-adapter";
import type { VisualAsset } from "@/types/visual-content";

const RATIOS: VisualAspectRatio[] = ["16:9", "1:1", "4:5", "9:16"];

type Props = {
  asset: VisualAsset;
};

export function VisualFormatPreview({ asset }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {RATIOS.map((ratio) => {
        const variant = buildFormatVariant(asset, ratio);
        return (
          <div key={ratio} className="rounded-sm border border-graphite/10 p-3">
            <p className="text-xs font-medium">{ratio}</p>
            <p className="text-xs text-muted mt-1">status: {variant.status}</p>
            <div
              className="mt-2 bg-graphite/5 rounded-sm flex items-center justify-center text-xs text-muted"
              style={{
                aspectRatio: ratio === "16:9" ? "16/9" : ratio === "1:1" ? "1/1" : ratio === "4:5" ? "4/5" : "9/16",
              }}
            >
              {variant.fileUrl ? "ready" : "planned"}
            </div>
            {variant.note && <p className="mt-2 text-[10px] text-muted leading-snug">{variant.note}</p>}
          </div>
        );
      })}
    </div>
  );
}
