import { trackCalculatorEvent as trackCalculatorEventFull } from "@/lib/analytics/events";

export type CalculatorEventName =
  | "calculator_started"
  | "calculator_step_completed"
  | "calculator_result_viewed"
  | "calculator_lead_form_opened"
  | "calculator_lead_submitted"
  | "calculator_project_clicked"
  | "calculator_reset"
  | "calculator_opened";

export type CalculatorEventPayload = {
  area?: number;
  material?: string;
  floors?: number;
  packageType?: string;
  totalMin?: number;
  totalMax?: number;
  source?: string;
  projectSlug?: string;
  step?: number;
  pageType?: string;
};

/** Calculator funnel — Metrika + internal analytics store. */
export function trackCalculatorEvent(
  eventName: CalculatorEventName,
  payload?: CalculatorEventPayload,
) {
  const action = eventName.replace(/^calculator_/, "");
  trackCalculatorEventFull(action, { ...payload, pageType: "calculator" });
}
