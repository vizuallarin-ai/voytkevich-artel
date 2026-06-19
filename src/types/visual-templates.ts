import type { VisualAspectRatio } from "@/types/visual-content";

export type VisualTemplateUsage =
  | "site-cover"
  | "social-teaser"
  | "og"
  | "diagram"
  | "lead-magnet"
  | "favicon";

export type VisualTemplate = {
  id: string;
  title: string;
  usage: VisualTemplateUsage;
  aspectRatio: VisualAspectRatio;
  supportsTextOverlay: boolean;
  textOverlayRules?: {
    maxTitleLength: number;
    maxSubtitleLength?: number;
    safeArea: string;
    textPosition: "left" | "right" | "center" | "bottom" | "top";
  };
  visualRules: string[];
  forbidden: string[];
  defaultStyleId: string;
};

export type TextOverlayConfig = {
  title: string;
  subtitle?: string;
  cta?: string;
  position: VisualTemplate["textOverlayRules"] extends undefined
    ? "bottom"
    : NonNullable<VisualTemplate["textOverlayRules"]>["textPosition"];
  safeArea: string;
};

export type VisualTemplatePreview = {
  templateId: string;
  aspectRatio: VisualAspectRatio;
  backgroundPlaceholder: string;
  overlay: TextOverlayConfig;
  illustrationNotice?: string;
};
