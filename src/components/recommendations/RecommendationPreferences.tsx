"use client";

import { useEffect, useState } from "react";
import type { RecommendationPreference } from "@/types/recommendation-preference";
import { cn } from "@/lib/utils";
import { SlidersHorizontal } from "lucide-react";

type RecommendationPreferencesProps = {
  sessionId?: string;
  className?: string;
  onChange?: (preferences: RecommendationPreference[]) => void;
};

const PREFERENCE_KEYS: RecommendationPreference["key"][] = [
  "building-type",
  "technology",
  "material",
  "area",
  "floors",
  "location",
];

export function RecommendationPreferences({
  sessionId,
  className,
  onChange,
}: RecommendationPreferencesProps) {
  const [preferences, setPreferences] = useState<RecommendationPreference[]>([]);
  const [key, setKey] = useState<RecommendationPreference["key"]>("technology");
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");

  useEffect(() => {
    const params = new URLSearchParams();
    if (sessionId) params.set("sessionId", sessionId);
    fetch(`/api/recommendations/preferences?${params.toString()}`)
      .then((r) => r.json())
      .then((json: { preferences: RecommendationPreference[] }) => {
        setPreferences(json.preferences ?? []);
        onChange?.(json.preferences ?? []);
      });
  }, [sessionId, onChange]);

  async function savePreference(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    setStatus("idle");
    try {
      const res = await fetch("/api/recommendations/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, key, value }),
      });
      if (!res.ok) throw new Error("save failed");
      const json = (await res.json()) as { preference: RecommendationPreference };
      const next = [...preferences.filter((p) => p.key !== key), json.preference];
      setPreferences(next);
      onChange?.(next);
      setValue("");
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className={cn("rounded-sm border border-graphite/10 bg-background p-5", className)}>
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="h-5 w-5 text-muted" aria-hidden />
        <h3 className="heading-section text-xl">Ваши предпочтения</h3>
      </div>

      <form onSubmit={savePreference} className="mt-4 flex flex-wrap gap-2">
        <select
          value={key}
          onChange={(e) => setKey(e.target.value as RecommendationPreference["key"])}
          className="rounded-sm border border-graphite/20 bg-background px-3 py-2 text-sm"
        >
          {PREFERENCE_KEYS.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Значение"
          className="min-w-[160px] flex-1 rounded-sm border border-graphite/20 bg-background px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-sm border border-graphite/20 px-4 py-2 text-sm hover:bg-sand/40"
        >
          Сохранить
        </button>
      </form>

      {status === "saved" && <p className="mt-2 text-xs text-muted">Сохранено</p>}
      {status === "error" && <p className="mt-2 text-xs text-muted">Ошибка сохранения</p>}

      {preferences.length > 0 && (
        <ul className="mt-4 space-y-2">
          {preferences.map((pref) => (
            <li
              key={pref.id}
              className="flex items-center justify-between rounded-sm border border-graphite/5 px-3 py-2 text-sm"
            >
              <span className="text-muted">{pref.key}</span>
              <span>{pref.value}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
