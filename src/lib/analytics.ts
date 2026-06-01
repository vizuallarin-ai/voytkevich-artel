// Analytics helper — wraps Yandex Metrika and any future provider.
// Usage: import { trackEvent } from "@/lib/analytics"
//        trackEvent("lead_submit", { source: "calc" })

declare global {
  interface Window {
    ym?: (counterId: number, action: string, eventName?: string, params?: Record<string, unknown>) => void;
  }
}

export const YM_ID = process.env.NEXT_PUBLIC_YM_ID
  ? Number(process.env.NEXT_PUBLIC_YM_ID)
  : 0;

export function trackEvent(
  event: string,
  params?: Record<string, unknown>,
) {
  if (typeof window === "undefined") return;

  // Yandex Metrika
  if (window.ym && YM_ID) {
    window.ym(YM_ID, "reachGoal", event, params);
  }

  // Console fallback for dev / when ym is not loaded
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.debug("[analytics]", event, params);
  }
}

/** Track CTA button clicks */
export function trackCta(label: string) {
  trackEvent("cta_click", { label });
}
