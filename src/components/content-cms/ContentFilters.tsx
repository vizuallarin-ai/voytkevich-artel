"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { ContentFilters } from "@/types/content-cms";
import type { ContentStatus } from "@/types/content-workflow";

const PRESETS: { label: string; params: Record<string, string> }[] = [
  { label: "Все", params: {} },
  { label: "Черновики", params: { status: "draft" } },
  { label: "AI-generated", params: { status: "ai-generated" } },
  { label: "На проверке", params: { status: "review" } },
  { label: "Needs source", params: { status: "needs-source" } },
  { label: "Fact-check", params: { status: "needs-fact-check" } },
  { label: "Approved", params: { status: "approved" } },
  { label: "Noindex", params: { status: "noindex" } },
  { label: "Blockers", params: { blockers: "1" } },
  { label: "P1", params: { priority: "P1" } },
];

export function ContentFiltersBar({ basePath = "/dashboard/content/items" }: { basePath?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get("status");

  const apply = (params: Record<string, string>) => {
    const q = new URLSearchParams(params);
    router.push(`${basePath}?${q.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {PRESETS.map((preset) => (
        <button
          key={preset.label}
          type="button"
          onClick={() => apply(preset.params)}
          className={`rounded-sm border px-3 py-1 text-xs transition ${
            currentStatus === preset.params.status && preset.params.status
              ? "border-graphite bg-graphite text-background"
              : "border-graphite/15 hover:bg-sand/40"
          }`}
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}

import type { CMSContentKind } from "@/types/content-cms";

export function parseContentFiltersFromSearchParams(
  params: URLSearchParams,
): import("@/types/content-cms").ContentFilters {
  const filters: import("@/types/content-cms").ContentFilters = {};
  const status = params.get("status");
  if (status) filters.status = [status as import("@/types/content-workflow").ContentStatus];
  const kind = params.get("kind");
  if (kind) filters.kind = [kind as CMSContentKind];
  const priority = params.get("priority");
  if (priority) filters.priority = [priority as "P1"];
  if (params.get("blockers") === "1") filters.hasBlockers = true;
  const search = params.get("q");
  if (search) filters.search = search;
  return filters;
}
