"use client";

import type { RecommendedDate } from "@/types/content-scheduling";

type Props = {
  dates: RecommendedDate[];
  onSelect?: (date: RecommendedDate) => void;
};

export function RecommendedDatesPanel({ dates, onSelect }: Props) {
  if (!dates.length) return <p className="text-sm text-muted">Нет рекомендаций</p>;

  return (
    <div className="rounded-sm border border-graphite/10 p-4 space-y-2">
      <h3 className="font-medium text-sm">Рекомендованные даты</h3>
      <ul className="space-y-2">
        {dates.map((d) => (
          <li key={`${d.date}-${d.time}`} className="text-xs">
            <button
              type="button"
              onClick={() => onSelect?.(d)}
              className="text-left w-full rounded-sm border border-graphite/10 p-2 hover:border-primary/30"
            >
              <span className="font-medium">
                {d.date} {d.time}
              </span>
              <span className="text-muted ml-2">score {d.score}</span>
              {d.reasons[0] && <p className="text-muted mt-1">{d.reasons[0]}</p>}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
