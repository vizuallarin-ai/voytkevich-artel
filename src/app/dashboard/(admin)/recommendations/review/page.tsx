"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type ReviewData = {
  totalQueued: number;
  feedback: {
    id: string;
    recommendationId: string;
    feedbackType: string;
    message?: string;
    createdAt: string;
    placement?: string;
  }[];
  highDismissal: string[];
  lowQuality: string[];
};

export default function RecommendationsReviewPage() {
  const [data, setData] = useState<ReviewData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/recommendations/review")
      .then((r) => r.json())
      .then(setData);
  }, []);

  return (
    <div className="space-y-6">
      <Link href="/dashboard/recommendations" className="text-sm text-muted underline">
        ← Recommendations
      </Link>
      <h1 className="heading-section text-3xl">Recommendation Review</h1>
      {!data ? (
        <p className="text-sm text-muted">Загрузка…</p>
      ) : (
        <>
          <p className="text-sm text-muted">В очереди: {data.totalQueued}</p>
          <ul className="space-y-3">
            {data.feedback.map((item) => (
              <li
                key={item.id}
                className="rounded-sm border border-graphite/10 bg-background p-4 text-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium">{item.feedbackType}</span>
                  <span className="text-xs text-muted">{item.createdAt}</span>
                </div>
                <p className="mt-1 text-muted">ID: {item.recommendationId}</p>
                {item.message && <p className="mt-2">{item.message}</p>}
                {item.placement && (
                  <p className="mt-1 text-xs text-muted">Placement: {item.placement}</p>
                )}
              </li>
            ))}
          </ul>
          {data.feedback.length === 0 && (
            <p className="text-sm text-muted">Очередь пуста.</p>
          )}
        </>
      )}
    </div>
  );
}
