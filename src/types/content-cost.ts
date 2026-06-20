export type ContentCostRecord = {
  contentItemId: string;

  production: {
    research?: number | null;
    writing?: number | null;
    expertReview?: number | null;
    editing?: number | null;
    design?: number | null;
    development?: number | null;
    aiUsage?: number | null;
  };

  distribution: {
    paidPromotion?: number | null;
    publication?: number | null;
    repurposing?: number | null;
  };

  maintenance: {
    updates?: number | null;
    monitoring?: number | null;
  };

  currency: "RUB";
  source: "manual" | "calculated" | "imported";
  confidence: "low" | "medium" | "high";
  calculatedAt: string;
};
