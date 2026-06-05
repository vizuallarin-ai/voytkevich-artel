import { trackEvent } from "@/lib/analytics";

export type CalculatorEventName =
  | "calculator_started"
  | "calculator_step_completed"
  | "calculator_result_viewed"
  | "calculator_lead_form_opened"
  | "calculator_lead_submitted"
  | "calculator_project_clicked"
  | "calculator_reset";

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
};

/** Safe analytics wrapper for calculator events. No-op when analytics unavailable. */
export function trackCalculatorEvent(
  eventName: CalculatorEventName,
  payload?: CalculatorEventPayload,
) {
  trackEvent(eventName, payload);
}
