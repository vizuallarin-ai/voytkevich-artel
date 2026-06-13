import type { LeadReadiness, LeadStatus } from "@/types/lead";
import { LEAD_STATUS_META, READINESS_META, PRIORITY_META } from "@/lib/leads/lead-status";
import { cn } from "@/lib/utils";

export function LeadStatusBadge({ status, className }: { status: LeadStatus; className?: string }) {
  const meta = LEAD_STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        meta.badgeClass,
        className,
      )}
    >
      {meta.label}
    </span>
  );
}

export function LeadReadinessBadge({ readiness, className }: { readiness: LeadReadiness; className?: string }) {
  const meta = READINESS_META[readiness];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        meta.badgeClass,
        className,
      )}
    >
      {meta.label}
    </span>
  );
}

export function DemoBadge() {
  return (
    <span className="inline-flex rounded-full border border-dashed border-amber-400 bg-amber-50 px-2 py-0.5 text-xs text-amber-900">
      Demo
    </span>
  );
}

export function LeadPriorityBadge({
  priority,
  className,
}: {
  priority: "urgent" | "high" | "normal" | "low";
  className?: string;
}) {
  const meta = PRIORITY_META[priority];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        meta.badgeClass,
        className,
      )}
    >
      {meta.label}
    </span>
  );
}

export function OverdueBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-red-300 bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-800",
        className,
      )}
    >
      Просрочен
    </span>
  );
}

export function NotificationStatusBadge({
  status,
}: {
  status: "sent" | "partial" | "failed" | "none";
}) {
  const map = {
    sent: { label: "Уведомлено", className: "bg-emerald-50 text-emerald-800 border-emerald-200" },
    partial: { label: "Частично", className: "bg-amber-50 text-amber-900 border-amber-200" },
    failed: { label: "Не отправлено", className: "bg-red-50 text-red-700 border-red-200" },
    none: { label: "Без уведомления", className: "bg-muted text-muted-foreground border-graphite/15" },
  };
  const meta = map[status];
  return (
    <span className={cn("inline-flex rounded-full border px-2 py-0.5 text-xs", meta.className)}>
      {meta.label}
    </span>
  );
}

export function SourceTypeBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex rounded-full bg-sand px-2 py-0.5 text-xs text-foreground">{label}</span>
  );
}
