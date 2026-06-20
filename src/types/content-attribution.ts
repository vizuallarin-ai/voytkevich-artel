export type AttributionRole =
  | "first-touch"
  | "last-touch"
  | "assisted"
  | "direct-conversion"
  | "unknown";

export type AttributionModel =
  | "first-touch"
  | "last-touch"
  | "linear"
  | "position-based"
  | "assisted"
  | "unknown";

export type ContentTouchpoint = {
  contentItemId: string;
  url: string;
  sessionId?: string;
  anonymousVisitorId?: string;
  occurredAt: string;
  role: AttributionRole;
  source?: string;
  medium?: string;
  campaign?: string;
  referrer?: string;
};

export type LeadContentAttribution = {
  leadId: string;

  firstTouch?: ContentTouchpoint | null;
  lastTouch?: ContentTouchpoint | null;
  convertingTouch?: ContentTouchpoint | null;
  assistedTouches: ContentTouchpoint[];

  attributionModel: AttributionModel;

  confidence: "low" | "medium" | "high";
  limitations: string[];
  calculatedAt: string;
};
