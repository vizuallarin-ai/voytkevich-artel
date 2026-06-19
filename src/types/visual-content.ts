export type VisualAssetKind =
  | "real-photo"
  | "ai-illustration"
  | "diagram"
  | "cover"
  | "social-teaser-image"
  | "og-image"
  | "thumbnail"
  | "brand-character"
  | "icon"
  | "future";

export type VisualAssetStatus =
  | "planned"
  | "brief"
  | "generated"
  | "uploaded"
  | "review"
  | "approved"
  | "published"
  | "rejected"
  | "archived";

export type VisualAspectRatio = "16:9" | "1:1" | "4:5" | "9:16" | "favicon" | "custom";

export type VisualAsset = {
  id: string;
  kind: VisualAssetKind;
  status: VisualAssetStatus;
  title: string;
  description?: string;
  source: "uploaded" | "ai-generated" | "template-rendered" | "stock" | "client-provided" | "future";
  sourceUrl?: string;
  fileUrl?: string;
  thumbnailUrl?: string;
  related: {
    contentItemId?: string;
    publicationId?: string;
    teaserId?: string;
    projectId?: string;
    caseId?: string;
    authorId?: string;
    rubricId?: string;
    clusterId?: string;
  };
  format: {
    aspectRatio: VisualAspectRatio;
    width?: number;
    height?: number;
  };
  usage: {
    siteCover: boolean;
    openGraph: boolean;
    socialTeaser: boolean;
    blogInline: boolean;
    catalog: boolean;
    casePage: boolean;
    dashboardOnly: boolean;
  };
  rights: {
    usageAllowed: boolean;
    sourceConfirmed: boolean;
    clientPermission?: boolean;
    attributionRequired?: boolean;
    attributionText?: string;
  };
  safety: {
    canLookLikeRealObject: boolean;
    requiresIllustrationNotice: boolean;
    isRealObjectPhoto: boolean;
    isRealClientPhoto: boolean;
    fakeCaseRisk: "high" | "medium" | "low";
    misleadingRisk: "high" | "medium" | "low";
  };
  seo: {
    alt: string;
    title?: string;
    caption?: string;
  };
  prompts?: {
    visualBrief?: string;
    generationPrompt?: string;
    negativePrompt?: string;
  };
  createdAt: string;
  updatedAt?: string;
};

export type VisualBrief = {
  topic: string;
  contentKind?: string;
  visualStyleId: string;
  templateId?: string;
  aspectRatio: VisualAspectRatio;
  goals: string[];
  composition: string;
  palette: string[];
  forbidden: string[];
  requiresIllustrationNotice: boolean;
};

export type VisualAssetMetrics = {
  total: number;
  approved: number;
  review: number;
  generated: number;
  uploaded: number;
  missingAlt: number;
  missingRights: number;
  requiresIllustrationNotice: number;
  attachedToContent: number;
  attachedToPublications: number;
};
