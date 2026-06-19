"use client";

import type { VisualTemplate } from "@/types/visual-templates";
import { renderVisualTemplatePreview } from "@/lib/visual-content/visual-template-renderer";
import { trackVisualTemplatePreviewed } from "@/lib/visual-content/visual-content-analytics";
import { useEffect } from "react";

type Props = {
  template: VisualTemplate;
  title?: string;
};

export function VisualTemplatePreview({ template, title = "Пример заголовка" }: Props) {
  useEffect(() => {
    trackVisualTemplatePreviewed({ templateId: template.id, aspectRatio: template.aspectRatio });
  }, [template.id, template.aspectRatio]);

  const preview = renderVisualTemplatePreview(
    template,
    { title: template.title, safety: { requiresIllustrationNotice: true } },
    { title, subtitle: "Подзаголовок материала" },
  );

  return (
    <div className="rounded-sm border border-graphite/10 p-4">
      <div
        className="relative overflow-hidden rounded-sm bg-graphite/10 flex items-end p-4"
        style={{
          aspectRatio:
            template.aspectRatio === "16:9"
              ? "16/9"
              : template.aspectRatio === "1:1"
                ? "1/1"
                : template.aspectRatio === "4:5"
                  ? "4/5"
                  : template.aspectRatio === "9:16"
                    ? "9/16"
                    : "1/1",
        }}
      >
        <div className="relative z-10">
          <p className="font-semibold text-sm text-white drop-shadow">{preview.overlay.title}</p>
          {preview.overlay.subtitle && (
            <p className="text-xs text-white/80 mt-1">{preview.overlay.subtitle}</p>
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-graphite/80 to-transparent" />
      </div>
      {preview.illustrationNotice && (
        <p className="mt-2 text-[10px] text-muted">{preview.illustrationNotice}</p>
      )}
      <p className="mt-2 text-xs text-muted">Safe area: {preview.overlay.safeArea}</p>
    </div>
  );
}
