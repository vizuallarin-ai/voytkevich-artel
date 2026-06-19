import { trackEvent } from "@/lib/analytics/events";

export function trackContentCalendarViewed(payload?: Record<string, unknown>) {
  trackEvent("content_calendar_viewed", payload);
}

export function trackContentCalendarModeChanged(payload?: Record<string, unknown>) {
  trackEvent("content_calendar_mode_changed", payload);
}

export function trackContentScheduleQueueViewed(payload?: Record<string, unknown>) {
  trackEvent("content_schedule_queue_viewed", payload);
}

export function trackContentScheduled(payload?: Record<string, unknown>) {
  trackEvent("content_scheduled", payload);
}

export function trackContentRescheduled(payload?: Record<string, unknown>) {
  trackEvent("content_rescheduled", payload);
}

export function trackContentScheduleCancelled(payload?: Record<string, unknown>) {
  trackEvent("content_schedule_cancelled", payload);
}

export function trackScheduleValidationFailed(payload?: Record<string, unknown>) {
  trackEvent("schedule_validation_failed", payload);
}

export function trackCapacityWarningTriggered(payload?: Record<string, unknown>) {
  trackEvent("capacity_warning_triggered", payload);
}

export function trackBalanceWarningTriggered(payload?: Record<string, unknown>) {
  trackEvent("balance_warning_triggered", payload);
}

export function trackRecommendedDateSelected(payload?: Record<string, unknown>) {
  trackEvent("recommended_date_selected", payload);
}

export function trackPublicationSlotReserved(payload?: Record<string, unknown>) {
  trackEvent("publication_slot_reserved", payload);
}

export function trackPublicationSlotReleased(payload?: Record<string, unknown>) {
  trackEvent("publication_slot_released", payload);
}

export function trackContentPackageScheduled(payload?: Record<string, unknown>) {
  trackEvent("content_package_scheduled", payload);
}
