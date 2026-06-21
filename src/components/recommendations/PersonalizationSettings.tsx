"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { MapPin, Shield } from "lucide-react";
import { PersonalizationResetDialog } from "./PersonalizationResetDialog";

type PersonalizationSettingsProps = {
  sessionId?: string;
  className?: string;
};

type SettingsState = {
  personalizationEnabled: boolean;
  locationEnabled: boolean;
  persistentPreferencesEnabled: boolean;
};

export function PersonalizationSettings({ sessionId, className }: PersonalizationSettingsProps) {
  const [settings, setSettings] = useState<SettingsState>({
    personalizationEnabled: true,
    locationEnabled: false,
    persistentPreferencesEnabled: false,
  });
  const [showReset, setShowReset] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    if (sessionId) params.set("sessionId", sessionId);
    fetch(`/api/recommendations/preferences?${params.toString()}`)
      .then((r) => r.json())
      .catch(() => undefined);
  }, [sessionId]);

  function toggle(key: keyof SettingsState) {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className={cn("rounded-sm border border-graphite/10 bg-background p-5", className)}>
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-muted" aria-hidden />
        <h3 className="heading-section text-xl">Персонализация</h3>
      </div>
      <p className="mt-2 text-sm text-muted">
        Управляйте тем, как сайт подбирает рекомендации. Все настройки можно сбросить.
      </p>

      <ul className="mt-4 space-y-3">
        <li className="flex items-center justify-between gap-4 text-sm">
          <span>Персональные рекомендации</span>
          <button
            type="button"
            role="switch"
            aria-checked={settings.personalizationEnabled}
            onClick={() => toggle("personalizationEnabled")}
            className={cn(
              "h-6 w-11 rounded-full border border-graphite/20 transition-colors",
              settings.personalizationEnabled ? "bg-primary/20" : "bg-graphite/5",
            )}
          />
        </li>
        <li className="flex items-center justify-between gap-4 text-sm">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-4 w-4 text-muted" aria-hidden />
            Учитывать локацию
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={settings.locationEnabled}
            onClick={() => toggle("locationEnabled")}
            className={cn(
              "h-6 w-11 rounded-full border border-graphite/20 transition-colors",
              settings.locationEnabled ? "bg-primary/20" : "bg-graphite/5",
            )}
          />
        </li>
        <li className="flex items-center justify-between gap-4 text-sm">
          <span>Сохранять предпочтения</span>
          <button
            type="button"
            role="switch"
            aria-checked={settings.persistentPreferencesEnabled}
            onClick={() => toggle("persistentPreferencesEnabled")}
            className={cn(
              "h-6 w-11 rounded-full border border-graphite/20 transition-colors",
              settings.persistentPreferencesEnabled ? "bg-primary/20" : "bg-graphite/5",
            )}
          />
        </li>
      </ul>

      <button
        type="button"
        onClick={() => setShowReset(true)}
        className="mt-4 text-sm text-muted underline hover:text-foreground"
      >
        Сбросить профиль рекомендаций
      </button>

      <PersonalizationResetDialog
        open={showReset}
        sessionId={sessionId}
        onClose={() => setShowReset(false)}
        onReset={() => {
          setSettings({
            personalizationEnabled: true,
            locationEnabled: false,
            persistentPreferencesEnabled: false,
          });
          setShowReset(false);
        }}
      />
    </div>
  );
}
