import { trackEvent } from "@/lib/analytics";

export type PlannerEventName =
  | "planner_started"
  | "planner_scenario_selected"
  | "planner_step_completed"
  | "planner_room_added"
  | "planner_room_removed"
  | "planner_area_changed"
  | "planner_recommendations_viewed"
  | "planner_calculator_clicked"
  | "planner_project_clicked"
  | "planner_lead_form_opened"
  | "planner_lead_submitted"
  | "planner_reset";

export type PlannerEventPayload = {
  scenario?: string | null;
  targetArea?: number;
  totalArea?: number;
  floors?: number;
  roomsCount?: number;
  hasLand?: string;
  source?: string;
  relatedProjectSlugs?: string[];
};

export function trackPlannerEvent(
  eventName: PlannerEventName,
  payload?: PlannerEventPayload,
) {
  trackEvent(eventName, payload);
}
