"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { CalendarSettings } from "@/types/content-calendar";
import { contentSchedulePresets } from "@/data/content-schedule-presets";
import { trackContentCalendarModeChanged } from "@/lib/content-calendar/calendar-analytics";

export default function CalendarSettingsPage() {
  const [settings, setSettings] = useState<CalendarSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/content-calendar/settings")
      .then((r) => r.json())
      .then((d) => setSettings(d.settings));
  }, []);

  async function save(patch: Partial<CalendarSettings>) {
    setSaving(true);
    setError(null);
    const res = await fetch("/api/dashboard/content-calendar/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setSettings(data.settings);
    if (patch.mode) trackContentCalendarModeChanged({ scheduleMode: patch.mode });
  }

  if (!settings) return <p className="text-sm text-muted">Загрузка...</p>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link href="/dashboard/content/calendar" className="text-sm text-muted underline">
          ← Календарь
        </Link>
        <h1 className="mt-3 heading-section text-3xl">Настройки календаря</h1>
      </div>

      <section className="space-y-3">
        <h2 className="font-medium text-sm">Schedule mode</h2>
        <div className="grid gap-3">
          {contentSchedulePresets.map((p) => (
            <button
              key={p.id}
              type="button"
              disabled={saving}
              onClick={() =>
                void save({
                  mode: p.id,
                  aggressiveModeConfirmed: p.id === "aggressive" ? true : settings.aggressiveModeConfirmed,
                })
              }
              className={`text-left rounded-sm border p-4 transition ${
                settings.mode === p.id ? "border-primary bg-primary/5" : "border-graphite/10"
              }`}
            >
              <p className="font-medium">{p.label}</p>
              <p className="text-xs text-muted mt-1">{p.description}</p>
              <p className="text-xs mt-2">
                Site {p.sitePerDay}/day · External {p.externalPerDay}/day · risk {p.risk}
              </p>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <label className="block text-sm">
          External teaser delay (hours)
          <input
            type="number"
            min={1}
            max={48}
            value={settings.externalTeaserDelayHours}
            onChange={(e) =>
              setSettings({ ...settings, externalTeaserDelayHours: Number(e.target.value) })
            }
            className="mt-1 w-full rounded-sm border border-graphite/20 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Timezone
          <input
            value={settings.timezone}
            readOnly
            className="mt-1 w-full rounded-sm border border-graphite/20 bg-graphite/5 px-3 py-2 text-muted"
          />
        </label>
        <button
          type="button"
          disabled={saving}
          onClick={() => void save({ externalTeaserDelayHours: settings.externalTeaserDelayHours })}
          className="rounded-sm bg-primary px-4 py-2 text-sm text-primary-foreground"
        >
          Save
        </button>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </section>

      <p className="text-xs text-muted">
        Агрессивный режим не включён по умолчанию. Manual approval required:{" "}
        {settings.manualApprovalRequired ? "yes" : "no"}.
      </p>
    </div>
  );
}
