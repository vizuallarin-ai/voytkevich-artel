"use client";

type Props = {
  contentItemId: string;
  recommendedAt?: string;
  onScheduled?: () => void;
};

export function ContentScheduleActions({ contentItemId, recommendedAt, onScheduled }: Props) {
  async function handleSchedule(scheduledAt?: string) {
    const at =
      scheduledAt ??
      recommendedAt ??
      new Date(Date.now() + 86400000).toISOString();
    const res = await fetch("/api/dashboard/content-calendar/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentItemId, scheduledAt: at }),
    });
    if (res.ok) onScheduled?.();
    else {
      const data = await res.json();
      alert(data.error ?? "Schedule failed");
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => void handleSchedule()}
        className="rounded-sm bg-primary px-3 py-1.5 text-xs text-primary-foreground"
      >
        Schedule next
      </button>
      {recommendedAt && (
        <button
          type="button"
          onClick={() => void handleSchedule(recommendedAt)}
          className="rounded-sm border border-graphite/20 px-3 py-1.5 text-xs"
        >
          Use recommended
        </button>
      )}
    </div>
  );
}
