import type { ContentAuditLogEntry } from "@/lib/content-cms/content-audit-log";

export function ContentAuditLog({ entries }: { entries: ContentAuditLogEntry[] }) {
  if (!entries.length) {
    return (
      <section className="rounded-sm border border-graphite/10 bg-background p-5">
        <h2 className="font-display text-lg">Audit log</h2>
        <p className="mt-3 text-sm text-muted">Изменений пока нет.</p>
      </section>
    );
  }

  return (
    <section className="rounded-sm border border-graphite/10 bg-background p-5">
      <h2 className="font-display text-lg">Audit log</h2>
      <ul className="mt-4 space-y-2 text-sm">
        {entries.map((entry) => (
          <li key={entry.id} className="border-b border-graphite/5 pb-2">
            <span className="font-medium">{entry.action}</span>
            {entry.fromStatus && entry.toStatus ? (
              <span className="text-muted">
                {" "}
                ({entry.fromStatus} → {entry.toStatus})
              </span>
            ) : null}
            {entry.message ? <p className="text-xs text-muted">{entry.message}</p> : null}
            <p className="text-xs text-muted">{entry.createdAt}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
