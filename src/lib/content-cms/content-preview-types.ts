import type { CMSContentKind } from "@/types/content-cms";
import type { ContentStatus } from "@/types/content-workflow";

export type ContentPreview = {
  contentId: string;
  title: string;
  url: string;
  kind: CMSContentKind;
  status: ContentStatus;
  seo: {
    title: string;
    description: string;
    canonical: string;
    robots: { index: boolean; follow: boolean };
  };
  notices: {
    fictionNotice: "present" | "missing" | "not-required";
    sourceRequired: boolean;
    disclaimerRequired: boolean;
  };
  cta: string;
  relatedLinks: string[];
  qualityLevel: string;
  indexable: boolean;
  previewNote: string;
};
