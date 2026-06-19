"use client";

import type { ContentCapacityRules } from "@/types/content-scheduling";
import type { ContentCalendarMetrics } from "@/types/content-calendar";

type Props = {
  capacity: ContentCapacityRules;
  metrics?: ContentCalendarMetrics | null;
};

export function ContentCapacityPanel({ capacity, metrics }: Props) {
  return (
    <div className="rounded-sm border border-graphite/10 p-4 space-y-3">
      <h3 className="font-medium text-sm">Capacity ({capacity.mode})</h3>
      <dl className="grid gap-2 text-xs sm:grid-cols-2">
        <div>
          <dt className="text-muted">Site / day</dt>
          <dd>
            {metrics?.todaySiteCount ?? 0} / {capacity.maxSitePublicationsPerDay}
          </dd>
        </div>
        <div>
          <dt className="text-muted">External / day</dt>
          <dd>
            {metrics?.todayExternalCount ?? 0} / {capacity.maxExternalPublicationsPerDay}
          </dd>
        </div>
        <div>
          <dt className="text-muted">Programmatic / day</dt>
          <dd>{capacity.maxProgrammaticPagesPerDay}</dd>
        </div>
        <div>
          <dt className="text-muted">Technical / day</dt>
          <dd>{capacity.maxTechnicalArticlesPerDay}</dd>
        </div>
      </dl>
      {metrics?.capacityWarning && (
        <p className="text-xs text-amber-700">Приближение к дневному лимиту</p>
      )}
    </div>
  );
}
