export type PostRefreshMonitoringWindow = {
  id: string;
  contentItemId: string;
  versionId: string;
  experimentId?: string;

  baselinePeriod: {
    from: string;
    to: string;
  };

  observationPeriod: {
    from: string;
    to: string;
  };

  primaryMetrics: string[];
  guardrailMetrics: string[];

  status:
    | "waiting"
    | "collecting"
    | "ready-for-analysis"
    | "completed"
    | "alert"
    | "rolled-back";

  createdAt: string;
};
