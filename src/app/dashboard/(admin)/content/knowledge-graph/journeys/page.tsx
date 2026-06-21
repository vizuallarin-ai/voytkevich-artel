"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type JourneyData = {
  deadEnds: string[];
  missingSteps: Array<{ contentItemId: string; missingStep: string }>;
  transitions: Array<{ fromId: string; toId: string; weight: number }>;
};

export default function UserJourneysPage() {
  const [data, setData] = useState<JourneyData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/knowledge-graph/journeys")
      .then((r) => r.json())
      .then(setData);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/content/knowledge-graph" className="text-sm text-muted underline">
          ← Knowledge Graph
        </Link>
        <h1 className="mt-3 heading-section text-3xl">User Journeys</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted">
          Агрегированные пути: dead ends, missing steps, high-value transitions.
        </p>
      </div>

      {!data ? (
        <p className="text-sm text-muted">Загрузка...</p>
      ) : (
        <>
          <section>
            <h2 className="mb-2 font-semibold">Dead ends ({data.deadEnds.length})</h2>
            <ul className="text-sm text-muted">
              {data.deadEnds.slice(0, 15).map((id) => (
                <li key={id}>{id}</li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="mb-2 font-semibold">Missing steps ({data.missingSteps.length})</h2>
            <ul className="text-sm">
              {data.missingSteps.slice(0, 15).map((m, i) => (
                <li key={i} className="text-muted">
                  {m.contentItemId} → needs {m.missingStep}
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
