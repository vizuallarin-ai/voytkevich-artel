"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

function SubPage({ title, apiPath }: { title: string; apiPath: string }) {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  useEffect(() => {
    fetch(apiPath).then((r) => r.json()).then(setData);
  }, [apiPath]);

  return (
    <div className="space-y-6">
      <Link href="/dashboard/content/refresh" className="text-sm text-muted underline">← Refresh</Link>
      <h1 className="heading-section text-3xl">{title}</h1>
      {!data ? (
        <p className="text-sm text-muted">Загрузка...</p>
      ) : (
        <pre className="text-xs overflow-auto max-h-[520px] rounded-sm border border-graphite/10 p-4 bg-graphite/5">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default function RefreshBriefsPage() {
  return <SubPage title="Update briefs" apiPath="/api/dashboard/content-refresh/briefs" />;
}
