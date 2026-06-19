"use client";

import { getBalanceRules } from "@/lib/content-calendar/balance-checker";

export function ContentBalancePanel() {
  const rules = getBalanceRules().slice(0, 5);
  return (
    <div className="rounded-sm border border-graphite/10 p-4 space-y-3">
      <h3 className="font-medium text-sm">Balance rules</h3>
      <ul className="text-xs space-y-2">
        {rules.map((r) => (
          <li key={r.id}>
            <span
              className={
                r.severity === "blocker"
                  ? "text-destructive"
                  : r.severity === "warning"
                    ? "text-amber-700"
                    : "text-muted"
              }
            >
              [{r.severity}]
            </span>{" "}
            {r.title}
          </li>
        ))}
      </ul>
    </div>
  );
}
