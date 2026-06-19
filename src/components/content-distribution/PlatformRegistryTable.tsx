import type { ExternalContentPlatform } from "@/types/content-distribution";
import { PlatformStatusBadge } from "./PlatformStatusBadge";

type Row = ExternalContentPlatform & { adapterActive?: boolean };

export function PlatformRegistryTable({ platforms }: { platforms: Row[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full text-sm">
        <thead className="bg-muted-bg text-left text-xs uppercase text-muted">
          <tr>
            <th className="px-4 py-3">Площадка</th>
            <th className="px-4 py-3">Категория</th>
            <th className="px-4 py-3">Auto</th>
            <th className="px-4 py-3">Adapter</th>
            <th className="px-4 py-3">UTM</th>
          </tr>
        </thead>
        <tbody>
          {platforms
            .filter((p) => p.id !== "site-full-article")
            .map((p) => (
              <tr key={p.id} className="border-t">
                <td className="px-4 py-3 font-medium">{p.title}</td>
                <td className="px-4 py-3 text-xs text-muted">{p.category}</td>
                <td className="px-4 py-3 text-xs">{p.supportsAutoPublish ? "да" : "нет"}</td>
                <td className="px-4 py-3">
                  <PlatformStatusBadge status={p.adapterStatus} adapterActive={p.adapterActive} />
                </td>
                <td className="px-4 py-3 text-xs">{p.supportsUTM ? "да" : "—"}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
