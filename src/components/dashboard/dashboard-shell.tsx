import Link from "next/link";
import { getDashboardAuthWarning, isDashboardAuthConfigured } from "@/lib/dashboard/auth";
import { getStorageStatus } from "@/lib/leads/lead-service";

const NAV = [
  { href: "/dashboard", label: "Обзор" },
  { href: "/dashboard/leads", label: "Лиды" },
  { href: "/dashboard/leads?group=new", label: "Новые" },
  { href: "/dashboard/leads?group=hot", label: "Горячие" },
  { href: "/dashboard/leads?group=estimate", label: "Нужна смета" },
  { href: "/dashboard/leads?group=overdue", label: "Просроченные" },
  { href: "/dashboard/analytics", label: "Аналитика" },
  { href: "/dashboard/leads?group=urgent", label: "Срочные" },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const authWarning = getDashboardAuthWarning();
  const storage = getStorageStatus();

  return (
    <div className="min-h-screen bg-muted-bg">
      <div className="border-b border-graphite/10 bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 md:px-8">
          <div>
            <p className="label-caps text-xs">Внутренний кабинет</p>
            <h1 className="font-display text-xl">CRM — заявки с сайта</h1>
          </div>
          <Link href="/" className="text-sm text-muted hover:text-foreground">
            На сайт →
          </Link>
        </div>
      </div>

      {(authWarning || !storage.fileStore && !storage.supabase) && (
        <div className="border-b border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-950 md:px-8">
          {authWarning && <p>{authWarning}</p>}
          {!storage.fileStore && !storage.supabase && (
            <p className="mt-1">
              Хранилище лидов не настроено. На VPS включите volume `.data/` или задайте `LEADS_STORAGE=supabase`.
            </p>
          )}
          {storage.backend === "file" && (
            <p className="mt-1 text-muted-foreground">
              Хранилище: file store (`.data/leads.json`) — подходит для VPS с persistent volume.
            </p>
          )}
          {storage.demoMode && (
            <p className="mt-1 font-medium">Показаны demo-лиды для разработки — не путать с реальными заявками.</p>
          )}
        </div>
      )}

      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-8 md:grid-cols-[220px_1fr] md:px-8">
        <aside className="space-y-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-sm px-3 py-2 text-sm text-muted transition hover:bg-background hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
          {!isDashboardAuthConfigured() && process.env.NODE_ENV === "development" && (
            <p className="mt-4 px-3 text-xs text-muted">
              Dev mode: auth отключён. Задайте DASHBOARD_ACCESS_TOKEN для production.
            </p>
          )}
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
