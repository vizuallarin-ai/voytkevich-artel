"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MetricCard } from "@/components/content-analytics/MetricCard";

type PrivacyData = {
  activeModes: { contextual: number; disabled: number };
  consentRate: number;
  profileResets: number;
  expiredSessions: number;
  persistentPreferenceCount: number;
};

export default function RecommendationsPrivacyPage() {
  const [data, setData] = useState<PrivacyData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/recommendations/privacy")
      .then((r) => r.json())
      .then(setData);
  }, []);

  return (
    <div className="space-y-6">
      <Link href="/dashboard/recommendations" className="text-sm text-muted underline">
        ← Recommendations
      </Link>
      <h1 className="heading-section text-3xl">Recommendation Privacy</h1>
      {!data ? (
        <p className="text-sm text-muted">Загрузка…</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard label="Personalization enabled" value={data.activeModes.contextual} />
          <MetricCard label="Personalization disabled" value={data.activeModes.disabled} />
          <MetricCard label="Consent rate" value={`${(data.consentRate * 100).toFixed(1)}%`} />
          <MetricCard label="Profile resets" value={data.profileResets} />
          <MetricCard label="Expired sessions" value={data.expiredSessions} />
          <MetricCard label="Persistent prefs" value={data.persistentPreferenceCount} />
        </div>
      )}
    </div>
  );
}
