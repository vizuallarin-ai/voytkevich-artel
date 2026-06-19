"use client";

type Props = {
  levelFilter: string;
  onLevelChange: (v: string) => void;
  confidenceFilter: string;
  onConfidenceChange: (v: string) => void;
};

export function PriorityFilters({
  levelFilter,
  onLevelChange,
  confidenceFilter,
  onConfidenceChange,
}: Props) {
  return (
    <div className="flex flex-wrap gap-3 items-end text-sm">
      <label>
        <span className="text-xs text-muted block mb-1">Priority</span>
        <select
          value={levelFilter}
          onChange={(e) => onLevelChange(e.target.value)}
          className="rounded-sm border border-graphite/20 px-2 py-1"
        >
          <option value="">All</option>
          {["P1", "P2", "P3", "P4", "P5"].map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span className="text-xs text-muted block mb-1">Confidence</span>
        <select
          value={confidenceFilter}
          onChange={(e) => onConfidenceChange(e.target.value)}
          className="rounded-sm border border-graphite/20 px-2 py-1"
        >
          <option value="">All</option>
          <option value="high">high</option>
          <option value="medium">medium</option>
          <option value="low">low</option>
        </select>
      </label>
    </div>
  );
}
