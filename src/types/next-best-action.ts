export type NextBestActionType =
  | "continue-reading"
  | "view-related-projects"
  | "compare-options"
  | "apply-filter"
  | "save-project"
  | "open-service"
  | "start-calculation"
  | "ask-assistant"
  | "request-consultation"
  | "refine-preferences"
  | "wait";

export type NextBestAction = {
  id: string;
  type: NextBestActionType;

  title: string;
  description?: string;

  url?: string;

  score: number;
  confidence: "low" | "medium" | "high";

  reasonCodes: string[];
  explanation: string;

  requiresConsent: boolean;
  requiresConfirmation: boolean;
};
