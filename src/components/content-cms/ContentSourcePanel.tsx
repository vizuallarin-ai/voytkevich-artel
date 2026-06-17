import type { CMSContentItem } from "@/types/content-cms";

export function ContentSourcePanel({ item }: { item: CMSContentItem }) {
  const status = item.factCheck?.status ?? "not-required";

  return (
    <div className="space-y-3 text-sm">
      <p>
        Fact-check: <span className="font-medium">{status}</span>
      </p>
      {item.factCheck?.sourceIds?.length ? (
        <ul className="space-y-1 text-muted">
          {item.factCheck.sourceIds.map((id) => (
            <li key={id}>{id}</li>
          ))}
        </ul>
      ) : (
        <p className="text-muted">
          {item.quality.requiresSource ? "Источник требуется" : "Источник не требуется"}
        </p>
      )}
    </div>
  );
}
